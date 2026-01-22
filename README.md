# 2PDF – Guía rápida

## Instalación

```bash
npm install
```

## Configuración

Crea `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wxtgjdagxhobtrrkyozo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FjE5XiHqFbRWYAqTj4mYoQ_8Hnbz73I
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Iniciar

```bash
npm run dev
```

Abre: http://localhost:3000

---

## API Keys

1. Ve a http://localhost:3000/api-keys
2. Clic en **Crear API Key**
3. Completa: Nombre, Proyecto, Ambiente
4. Copia la key (solo se muestra una vez)

---

## Edge Functions

### Validar API Key

`POST https://wxtgjdagxhobtrrkyozo.supabase.co/functions/v1/validate-key`

**Headers:** `X-API-Key`, `Content-Type: application/json`

### Generar documento (crea job)

`POST https://wxtgjdagxhobtrrkyozo.supabase.co/functions/v1/generate-document`

**Headers:** `X-API-Key`, `Content-Type: application/json`

**Body:**
```json
{
  "template_id": "uuid-del-template",
  "data": { "nombre": "Test" }
}
```

**Respuesta (202):** `{ "job_id": "...", "status": "queued", "message": "..." }`

La generación real del PDF la hace el Worker (asíncrono).

---

## Documents y filtro por proyecto

### Qué está implementado

- **Página Documents** (`/documents`): lista de documentos con filtros (proyecto, estado, búsqueda).
- **Filtro por proyecto:** "Todos los proyectos", "Carpeta usuarios", "Proyecto 2", etc.
- **Cards:** cada documento muestra **Proyecto**, **Template**, estado y fecha.
- **Modal de vista previa:** "Ver" en documentos succeeded (template renderizado o PDF).
- **Seed SQL** (`supabase/seed-documents-dummy.sql`): documentos dummy para **Carpeta usuarios** y **Proyecto 2** (PDF público de prueba) para probar el filtro sin usar la API.

Flujo dummy: 1) Creas API keys por proyecto → 2) Ejecutas el seed → 3) En Documents ves todos y filtras por proyecto.

### Pasos para verificar

1. **API keys y proyectos**  
   En **API Keys** ten al menos una key para **Carpeta usuarios** y otra para **Proyecto 2**. Crea **Proyecto 2** en Projects si no existe.

2. **Ejecutar el seed SQL**
   - **Local:**  
     `psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/seed-documents-dummy.sql`
   - **Supabase en la nube:** Dashboard → SQL Editor → New query → pegar contenido de `supabase/seed-documents-dummy.sql` → Run.

3. **Arrancar la app**  
   `npm run dev` y abrir http://localhost:3000

4. **Ir a Documents**  
   Menú lateral → **Documents**.

5. **Probar "Todos los proyectos"**  
   Debes ver documentos de Carpeta usuarios y de Proyecto 2. En cada card: **Proyecto: …**.

6. **Probar filtro "Carpeta usuarios"**  
   Solo documentos de ese proyecto.

7. **Probar filtro "Proyecto 2"**  
   Solo documentos de ese proyecto.

8. **Vista previa (opcional)**  
   En un documento **Success** → **Ver** → se abre el modal.

Si ejecutas el seed varias veces se insertan más filas (duplicados). Para limpiar, borra manualmente o restaura la DB.

---

## Deploy Edge Functions

```bash
supabase login
supabase link --project-ref wxtgjdagxhobtrrkyozo
supabase functions deploy validate-key
supabase functions deploy generate-document
```

---

## Verificar en Supabase

1. Dashboard: https://supabase.com/dashboard/project/wxtgjdagxhobtrrkyozo  
2. Edge Functions → Ver funciones deployadas  
3. Table Editor → `api_keys`, `documents`, `render_jobs`
