import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabase.ts'
import { hashApiKey } from '../_shared/hash.ts'

interface GenerateRequest {
  template_id: string
  data: Record<string, unknown>
  options?: {
    format?: 'A4' | 'Letter' | 'Legal'
    orientation?: 'portrait' | 'landscape'
  }
}

interface ApiKeyRecord {
  id: string
  name: string
  environment: string
  is_active: boolean
  project_id: string
  daily_limit: number | null
  monthly_limit: number | null
  expires_at: string | null
  projects: {
    id: string
    name: string
    organization_id: string
  }
}

interface TemplateVersion {
  id: string
  html: string
  css: string | null
  data_schema: Record<string, unknown> | null
}

interface Template {
  id: string
  name: string
  organization_id: string
  project_id: string | null
  template_versions: TemplateVersion[]
}

// Función para validar API Key y obtener contexto
async function validateApiKey(apiKey: string | null) {
  if (!apiKey) {
    return { valid: false, error: 'API Key no proporcionada. Usa el header X-API-Key' }
  }

  if (!apiKey.startsWith('pk_live_') && !apiKey.startsWith('pk_test_')) {
    return { valid: false, error: 'Formato de API Key inválido' }
  }

  const keyHash = await hashApiKey(apiKey)
  const supabase = getSupabaseAdmin()

  const { data: keyRecord, error: dbError } = await supabase
    .from('api_keys')
    .select(`
      id,
      name,
      environment,
      is_active,
      project_id,
      daily_limit,
      monthly_limit,
      expires_at,
      projects (
        id,
        name,
        organization_id
      )
    `)
    .eq('key_hash', keyHash)
    .single()

  if (dbError || !keyRecord) {
    return { valid: false, error: 'API Key no encontrada o inválida' }
  }

  const record = keyRecord as ApiKeyRecord

  if (!record.is_active) {
    return { valid: false, error: 'API Key revocada' }
  }

  if (record.expires_at && new Date(record.expires_at) < new Date()) {
    return { valid: false, error: 'API Key expirada' }
  }

  return { valid: true, keyRecord: record }
}

// Función para procesar el template con los datos
function processTemplate(html: string, css: string | null, data: Record<string, unknown>): string {
  let processed = html

  // Procesar loops {% for item in array %}...{% endfor %}
  processed = processed.replace(
    /{%\s*for\s+(\w+)\s+in\s+([\w.]+)\s*%}([\s\S]*?){%\s*endfor\s*%}/g,
    (_, itemName, arrayPath, content) => {
      const array = getNestedValue(data, arrayPath)
      if (!Array.isArray(array)) return ''
      return array.map((item, index) => {
        let itemContent = content
        // Reemplazar {{item.prop}} con el valor
        itemContent = itemContent.replace(
          new RegExp(`{{\\s*${itemName}\\.(\\w+)\\s*}}`, 'g'),
          (_: string, prop: string) => String(item[prop] ?? '')
        )
        // Reemplazar {{item}} directamente
        itemContent = itemContent.replace(
          new RegExp(`{{\\s*${itemName}\\s*}}`, 'g'),
          String(item)
        )
        return itemContent
      }).join('')
    }
  )

  // Procesar variables {{variable}}
  processed = processed.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const value = getNestedValue(data, key)
    return String(value ?? '')
  })

  // Construir documento HTML completo
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>${css || ''}</style>
      </head>
      <body>
        ${processed}
      </body>
    </html>
  `
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((o: unknown, k) => {
    if (o && typeof o === 'object' && k in o) {
      return (o as Record<string, unknown>)[k]
    }
    return undefined
  }, obj)
}

serve(async (req) => {
  // Manejar CORS preflight
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido. Usa POST' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // 1. Validar API Key
    const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key')
    const validation = await validateApiKey(apiKey)

    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { keyRecord } = validation

    // 2. Parsear body
    const body: GenerateRequest = await req.json()
    const { template_id, data, options } = body

    if (!template_id) {
      return new Response(
        JSON.stringify({ error: 'template_id es requerido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!data || typeof data !== 'object') {
      return new Response(
        JSON.stringify({ error: 'data debe ser un objeto JSON' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Obtener template
    const supabase = getSupabaseAdmin()
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .select(`
        id,
        name,
        organization_id,
        project_id,
        template_versions (
          id,
          html,
          css,
          data_schema,
          is_default
        )
      `)
      .eq('id', template_id)
      .eq('organization_id', keyRecord!.projects.organization_id)
      .single()

    if (templateError || !template) {
      return new Response(
        JSON.stringify({ error: 'Template no encontrado o sin permisos' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const typedTemplate = template as Template

    // Obtener versión default
    const defaultVersion = typedTemplate.template_versions.find(v => v.is_default) 
      || typedTemplate.template_versions[0]

    if (!defaultVersion) {
      return new Response(
        JSON.stringify({ error: 'Template no tiene versiones' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 4. Crear render_job
    const { data: renderJob, error: jobError } = await supabase
      .from('render_jobs')
      .insert({
        organization_id: keyRecord!.projects.organization_id,
        project_id: keyRecord!.project_id,
        template_version_id: defaultVersion.id,
        api_key_id: keyRecord!.id,
        status: 'processing',
        payload: data,
        options: options || {},
        queued_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating render job:', jobError)
      return new Response(
        JSON.stringify({ error: 'Error al crear job de renderizado' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 5. Procesar template con datos
    const processedHtml = processTemplate(
      defaultVersion.html,
      defaultVersion.css,
      data
    )

    // 6. TODO: Generar PDF con Playwright/Puppeteer
    // Por ahora retornamos el HTML procesado y la info del job
    // En producción, aquí se llamaría a un servicio de generación de PDF

    // 7. Actualizar render_job como exitoso
    await supabase
      .from('render_jobs')
      .update({
        status: 'succeeded',
        finished_at: new Date().toISOString(),
      })
      .eq('id', renderJob.id)

    // 8. Retornar resultado
    return new Response(
      JSON.stringify({
        success: true,
        job_id: renderJob.id,
        template: {
          id: typedTemplate.id,
          name: typedTemplate.name,
          version_id: defaultVersion.id,
        },
        // En producción esto sería la URL del PDF generado
        // Por ahora retornamos el HTML para testing
        html_preview: processedHtml,
        message: 'Documento procesado. PDF generation pendiente de implementar.',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating document:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

