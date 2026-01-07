# ⚡ PR: Edge Functions para API de Documentos

## 📋 Descripción

Implementación de Edge Functions en Supabase para validar API Keys y generar documentos PDF. Estas funciones forman la base del backend público de la API.

## 🎯 Objetivo

Crear endpoints públicos que permitan a clientes externos autenticarse con API Keys y generar documentos PDF usando templates predefinidos.

## ✨ Funcionalidades Implementadas

### 1. **Función `validate-key`**
Valida API Keys y retorna información sobre la key y el proyecto asociado.

**Endpoint:** `POST /functions/v1/validate-key`

**Headers:**
- `X-API-Key`: La API Key a validar

**Respuesta exitosa:**
```json
{
  "valid": true,
  "key": {
    "id": "uuid",
    "name": "Mi API Key",
    "environment": "test",
    "daily_limit": 1000,
    "monthly_limit": 10000
  },
  "project": {
    "id": "uuid",
    "name": "Mi Proyecto",
    "slug": "mi-proyecto"
  }
}
```

**Validaciones:**
- ✅ Formato correcto (`pk_test_` o `pk_live_`)
- ✅ Key existe en la base de datos
- ✅ Key está activa (no revocada)
- ✅ Key no ha expirado

### 2. **Función `generate-document`**
Genera documentos PDF usando templates y datos dinámicos.

**Endpoint:** `POST /functions/v1/generate-document`

**Headers:**
- `X-API-Key`: La API Key para autenticación
- `Content-Type`: `application/json`

**Body:**
```json
{
  "template_id": "uuid-del-template",
  "data": {
    "nombre": "Juan",
    "edad": 30,
    "items": [
      { "producto": "Laptop", "precio": 1000 }
    ]
  },
  "options": {
    "format": "A4",
    "orientation": "portrait"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "job_id": "uuid-del-job",
  "template": {
    "id": "uuid",
    "name": "Mi Template",
    "version_id": "uuid"
  },
  "html_preview": "<html>...</html>"
}
```

**Funcionalidades:**
- ✅ Validación de API Key
- ✅ Verificación de permisos (template pertenece a la organización)
- ✅ Creación de `render_job`
- ✅ Procesamiento de template con datos dinámicos
- ✅ Soporte para loops (`{% for %}`)
- ✅ Soporte para variables (`{{ variable }}`)
- ⏳ Generación real de PDF (pendiente)

## 📁 Archivos Creados

### Edge Functions
- `supabase/functions/validate-key/index.ts` - Validación de API Keys
- `supabase/functions/generate-document/index.ts` - Generación de documentos

### Utilidades Compartidas (`_shared/`)
- `supabase/functions/_shared/cors.ts` - Manejo de CORS
- `supabase/functions/_shared/hash.ts` - Hash SHA-256 de API Keys
- `supabase/functions/_shared/supabase.ts` - Cliente de Supabase

### Configuración
- `supabase/config.toml` - Configuración de Supabase local
- `supabase/.gitignore` - Archivos a ignorar

### Documentación
- `VALIDACION_EDGE_FUNCTIONS.md` - Documentación completa
- `validate-functions.sh` - Script de validación

## 🔐 Seguridad

- ✅ Validación de API Keys con hash SHA-256
- ✅ Verificación de permisos a nivel de organización
- ✅ CORS configurado (actualmente `*`, restringir en producción)
- ✅ Uso de Service Role Key solo en Edge Functions
- ✅ Validación de expiración y estado de keys

## 🧪 Testing

### Pruebas Locales

1. **Iniciar Supabase local:**
```bash
supabase start
```

2. **Servir funciones:**
```bash
supabase functions serve --no-verify-jwt
```

3. **Probar validación de key:**
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/validate-key \
  -H "X-API-Key: pk_test_tu_key_aqui"
```

4. **Probar generación:**
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/generate-document \
  -H "X-API-Key: pk_test_tu_key_aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "uuid-del-template",
    "data": {"nombre": "Test"}
  }'
```

### Validación Automática

Ejecutar el script de validación:
```bash
./validate-functions.sh
```

## 📊 Estado de Implementación

### ✅ Completado
- [x] Estructura de Edge Functions
- [x] Validación de API Keys
- [x] Creación de render jobs
- [x] Procesamiento de templates con datos
- [x] Soporte para loops y variables
- [x] Manejo de errores
- [x] CORS configurado
- [x] Documentación

### ⏳ Pendiente
- [ ] Generación real de PDF (Playwright/Puppeteer)
- [ ] Validación de cuotas (daily_limit, monthly_limit)
- [ ] Webhooks para notificar cuando el PDF esté listo
- [ ] Tests automatizados
- [ ] Rate limiting
- [ ] Logging y monitoreo

## 🔗 Relacionado

- Frontend: `feature/api-keys-management` (gestión de API Keys)
- Schema: `modelo1.sql` (tablas `api_keys`, `render_jobs`, `templates`)

## ✅ Checklist

- [x] Edge Functions creadas
- [x] Validación de API Keys implementada
- [x] Procesamiento de templates implementado
- [x] CORS configurado
- [x] Manejo de errores
- [x] Documentación completa
- [x] Script de validación
- [ ] Generación de PDF
- [ ] Tests
- [ ] Deploy a producción

## 🚀 Deployment Notes

### Variables de Entorno Requeridas

Las Edge Functions usan estas variables (configuradas automáticamente por Supabase):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`

### Deploy a Producción

```bash
# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref tu-project-ref

# Deploy funciones
supabase functions deploy validate-key
supabase functions deploy generate-document
```

## 📝 Notas Adicionales

- Las funciones usan Deno runtime (TypeScript)
- El hash de API Keys debe coincidir con el del frontend
- Actualmente retorna HTML procesado, la generación de PDF está pendiente
- En producción, restringir CORS a dominios específicos

## 🔄 Próximos Pasos

1. Implementar generación de PDF con Playwright/Puppeteer
2. Agregar validación de cuotas
3. Implementar sistema de webhooks
4. Agregar tests automatizados
5. Configurar monitoreo y logging


