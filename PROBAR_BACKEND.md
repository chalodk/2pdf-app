# 🧪 Probar Backend - Paso a Paso

## ✅ Paso 1: Verificar que tienes todo

```bash
# Verificar que Supabase CLI está instalado
supabase --version

# Si no está instalado:
brew install supabase/tap/supabase
```

## ✅ Paso 2: Iniciar Supabase Local

```bash
cd /Users/daniel/2pdf/2pdf-app
supabase start
```

**Espera a que termine.** Deberías ver algo como:
```
Started supabase local development setup.
API URL: http://127.0.0.1:54321
```

## ✅ Paso 3: Servir las Edge Functions

**Abre una NUEVA terminal** (deja la anterior corriendo) y ejecuta:

```bash
cd /Users/daniel/2pdf/2pdf-app
supabase functions serve --no-verify-jwt
```

Deberías ver:
```
Functions served on http://127.0.0.1:54321/functions/v1
```

## ✅ Paso 4: Preparar una API Key de prueba

Necesitas una API Key en la base de datos. Tienes 2 opciones:

### Opción A: Crear desde el frontend
1. Cambia al branch del frontend: `git checkout feature/api-keys-management`
2. Inicia la app: `npm run dev`
3. Crea una API Key desde la UI
4. **Copia la key completa** (solo se muestra una vez)

### Opción B: Crear manualmente en la BD

1. Abre Supabase Studio local: http://127.0.0.1:54323
2. Ve a la tabla `api_keys`
3. Crea un registro manual con:
   - `name`: "Test Key"
   - `key_hash`: (necesitas hashear la key primero)
   - `project_id`: (un UUID de un proyecto existente)
   - `environment`: "sandbox"
   - `is_active`: true

**Pero es más fácil usar la Opción A** 👆

## ✅ Paso 5: Probar `validate-key`

**Abre otra terminal** y ejecuta:

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/validate-key \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_TU_KEY_AQUI"
```

**Reemplaza `TU_KEY_AQUI` con tu API Key real.**

**Respuesta esperada (éxito):**
```json
{
  "valid": true,
  "key": {
    "id": "...",
    "name": "Test Key",
    "environment": "sandbox"
  },
  "project": {
    "id": "...",
    "name": "Mi Proyecto"
  }
}
```

**Si hay error, revisa:**
- ¿La key existe en la BD?
- ¿Está activa (`is_active = true`)?
- ¿El hash coincide?

## ✅ Paso 6: Probar `generate-document`

Necesitas:
- Una API Key válida
- Un `template_id` que exista en la BD

```bash
curl -X POST http://127.0.0.1:54321/functions/v1/generate-document \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_test_TU_KEY_AQUI" \
  -d '{
    "template_id": "UUID_DEL_TEMPLATE",
    "data": {
      "nombre": "Juan",
      "edad": 30
    }
  }'
```

**Reemplaza:**
- `TU_KEY_AQUI` con tu API Key
- `UUID_DEL_TEMPLATE` con un template_id real

**Respuesta esperada:**
```json
{
  "success": true,
  "job_id": "...",
  "template": {
    "id": "...",
    "name": "Mi Template"
  },
  "html_preview": "<html>...</html>"
}
```

## 🐛 Si algo falla

### Error: "API Key no encontrada"
- Verifica que la key existe en `api_keys`
- Verifica que `is_active = true`
- Verifica que el hash es correcto

### Error: "Template no encontrado"
- Verifica que el `template_id` existe
- Verifica que pertenece a la misma organización que la API Key

### Error: "Supabase no responde"
```bash
# Verificar estado
supabase status

# Reiniciar si es necesario
supabase stop
supabase start
```

## 📝 Notas

- Las funciones están en: `supabase/functions/`
- Los logs aparecen en la terminal donde ejecutaste `supabase functions serve`
- Para ver la BD: http://127.0.0.1:54323

