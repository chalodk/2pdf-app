# 📋 Instrucciones para Crear los PRs

## 🎯 Resumen

Hay **2 Pull Requests** listos para crear:

1. **Frontend: Gestión de API Keys** (`feature/api-keys-management`)
2. **Backend: Edge Functions** (`feature/edge-function-generate-document`)

---

## 🔑 PR #1: Gestión de API Keys (Frontend)

### Branch
```
feature/api-keys-management
```

### Título del PR
```
feat: Implementar gestión de API Keys en el frontend
```

### Descripción (copiar desde `PR_API_KEYS_FRONTEND.md`)

```markdown
## 📋 Descripción

Implementación completa del frontend para la gestión de API Keys, permitiendo a los usuarios crear, visualizar, revocar y reactivar API keys desde el dashboard.

## ✨ Funcionalidades Implementadas

### 1. **Página de Gestión de API Keys** (`/api-keys`)
- Lista todas las API Keys del usuario
- Filtrado por proyecto y ambiente (test/production)
- Búsqueda por nombre
- Indicadores visuales de estado (activa/revocada)

### 2. **Crear API Key**
- Modal para crear nuevas API Keys
- Selección de proyecto asociado
- Selección de ambiente (test/production)
- Nombre descriptivo para la key
- Modal de revelación única con la key completa (solo se muestra una vez)

### 3. **Gestional de API Keys**
- **Revocar**: Desactiva una API Key sin eliminarla
- **Reactivar**: Vuelve a activar una API Key previamente revocada
- **Eliminar**: Elimina permanentemente una API Key
- **Copiar**: Copia los últimos 4 caracteres de la key

## 📁 Archivos Modificados/Creados

- `components/CreateApiKeyModal.jsx`
- `components/ApiKeyRevealModal.jsx`
- `components/ApiKeyListItem.jsx`
- `pages/api-keys.js`
- `hooks/useApiKeys.js`
- `lib/apiKeys.js`
- `components/SettingsSidebar.jsx` (modificado)

## 🔐 Seguridad

- Las API Keys se hashean con SHA-256 antes de almacenarse
- Solo se muestra la key completa una vez al crearla
- Solo se muestran los últimos 4 caracteres después de la creación
- Validación de permisos a nivel de organización

## ✅ Checklist

- [x] Componentes creados
- [x] Página de gestión implementada
- [x] Integración con Supabase
- [x] Hash de API Keys
- [x] Validaciones de formulario
- [x] Manejo de errores
- [x] Loading states
- [x] Integración con Settings sidebar
```

### Pasos para crear el PR en GitHub

1. Ve a: `https://github.com/DrojasFrontend/2pdf-app/compare/main...feature/api-keys-management`
2. O desde la página principal del repo, click en "New Pull Request"
3. Selecciona `main` como base y `feature/api-keys-management` como compare
4. Copia el título y descripción de arriba
5. Agrega reviewers
6. Click en "Create Pull Request"

---

## ⚡ PR #2: Edge Functions para API de Documentos

### Branch
```
feature/edge-function-generate-document
```

### Título del PR
```
feat: Implementar Edge Functions para validación de API Keys y generación de documentos
```

### Descripción (copiar desde `PR_EDGE_FUNCTIONS.md`)

```markdown
## 📋 Descripción

Implementación de Edge Functions en Supabase para validar API Keys y generar documentos PDF. Estas funciones forman la base del backend público de la API.

## ✨ Funcionalidades Implementadas

### 1. **Función `validate-key`**
Valida API Keys y retorna información sobre la key y el proyecto asociado.

**Endpoint:** `POST /functions/v1/validate-key`

**Validaciones:**
- ✅ Formato correcto (`pk_test_` o `pk_live_`)
- ✅ Key existe en la base de datos
- ✅ Key está activa (no revocada)
- ✅ Key no ha expirado

### 2. **Función `generate-document`**
Genera documentos PDF usando templates y datos dinámicos.

**Endpoint:** `POST /functions/v1/generate-document`

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
- `supabase/functions/validate-key/index.ts`
- `supabase/functions/generate-document/index.ts`

### Utilidades Compartidas
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/hash.ts`
- `supabase/functions/_shared/supabase.ts`

### Documentación
- `VALIDACION_EDGE_FUNCTIONS.md`
- `validate-functions.sh`

## 🧪 Testing

Las funciones pueden probarse localmente con:

```bash
# Iniciar Supabase local
supabase start

# Servir funciones
supabase functions serve --no-verify-jwt

# Probar validación
curl -X POST http://127.0.0.1:54321/functions/v1/validate-key \
  -H "X-API-Key: pk_test_tu_key"
```

## 📊 Estado de Implementación

### ✅ Completado
- [x] Estructura de Edge Functions
- [x] Validación de API Keys
- [x] Creación de render jobs
- [x] Procesamiento de templates con datos
- [x] Manejo de errores
- [x] CORS configurado
- [x] Documentación

### ⏳ Pendiente
- [ ] Generación real de PDF (Playwright/Puppeteer)
- [ ] Validación de cuotas
- [ ] Webhooks
- [ ] Tests automatizados
```

### Pasos para crear el PR en GitHub

1. Ve a: `https://github.com/DrojasFrontend/2pdf-app/compare/main...feature/edge-function-generate-document`
2. O desde la página principal del repo, click en "New Pull Request"
3. Selecciona `main` como base y `feature/edge-function-generate-document` como compare
4. Copia el título y descripción de arriba
5. Agrega reviewers
6. Click en "Create Pull Request"

---

## 🔗 Links Directos para Crear PRs

### PR Frontend (API Keys)
```
https://github.com/DrojasFrontend/2pdf-app/compare/main...feature/api-keys-management?expand=1
```

### PR Backend (Edge Functions)
```
https://github.com/DrojasFrontend/2pdf-app/compare/main...feature/edge-function-generate-document?expand=1
```

---

## 📝 Notas Importantes

1. **Orden de Merge**: Se recomienda mergear primero el PR de Frontend, luego el de Backend
2. **Dependencias**: El backend depende de que exista la tabla `api_keys` (ya existe en `modelo1.sql`)
3. **Testing**: Ambos PRs incluyen documentación para testing local
4. **Validación**: El script `validate-functions.sh` puede ejecutarse para validar las Edge Functions

---

## ✅ Checklist Pre-PR

### Frontend
- [x] Código implementado
- [x] Archivos creados
- [x] Integración con Supabase
- [x] Documentación incluida

### Backend
- [x] Edge Functions creadas
- [x] Validación implementada
- [x] Documentación completa
- [x] Script de validación incluido
- [x] Configuración de Supabase incluida

---

## 🚀 Después del Merge

1. **Deploy de Edge Functions a producción:**
```bash
supabase login
supabase link --project-ref tu-project-ref
supabase functions deploy validate-key
supabase functions deploy generate-document
```

2. **Verificar que todo funcione correctamente**

3. **Continuar con la implementación de generación de PDF**


