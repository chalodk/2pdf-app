# 🚀 Guía Rápida: Crear los PRs

## 📝 Paso a Paso

### PR #1: Frontend - API Keys

1. **Abre este link:**
   ```
   https://github.com/DrojasFrontend/2pdf-app/compare/main...feature/api-keys-management?expand=1
   ```

2. **Título del PR:**
   ```
   feat: Implementar gestión de API Keys en el frontend
   ```

3. **Descripción (copia todo esto):**
   ```markdown
   ## 📋 Descripción
   
   Implementación completa del frontend para la gestión de API Keys, permitiendo a los usuarios crear, visualizar, revocar y reactivar API keys desde el dashboard.
   
   ## ✨ Funcionalidades Implementadas
   
   - **Página de Gestión** (`/api-keys`): Lista, filtrado y búsqueda de API Keys
   - **Crear API Key**: Modal con selección de proyecto y ambiente
   - **Gestión**: Revocar, reactivar, eliminar API Keys
   - **Integración**: Nueva sección en Settings sidebar
   
   ## 📁 Archivos Creados
   
   - `components/CreateApiKeyModal.jsx`
   - `components/ApiKeyRevealModal.jsx`
   - `components/ApiKeyListItem.jsx`
   - `pages/api-keys.js`
   - `hooks/useApiKeys.js`
   - `lib/apiKeys.js`
   - `components/SettingsSidebar.jsx` (modificado)
   
   ## 🔐 Seguridad
   
   - API Keys hasheadas con SHA-256
   - Key completa solo se muestra una vez al crearla
   - Validación de permisos a nivel de organización
   
   ## ✅ Checklist
   
   - [x] Componentes creados
   - [x] Página de gestión implementada
   - [x] Integración con Supabase
   - [x] Hash de API Keys
   - [x] Validaciones y manejo de errores
   ```

4. **Click en "Create Pull Request"**

---

### PR #2: Backend - Edge Functions

1. **Abre este link:**
   ```
   https://github.com/DrojasFrontend/2pdf-app/compare/main...feature/edge-function-generate-document?expand=1
   ```

2. **Título del PR:**
   ```
   feat: Implementar Edge Functions para validación de API Keys y generación de documentos
   ```

3. **Descripción (copia todo esto):**
   ```markdown
   ## 📋 Descripción
   
   Implementación de Edge Functions en Supabase para validar API Keys y generar documentos PDF. Estas funciones forman la base del backend público de la API.
   
   ## ✨ Funcionalidades Implementadas
   
   ### 1. Función `validate-key`
   - Valida API Keys y retorna información del proyecto
   - Endpoint: `POST /functions/v1/validate-key`
   - Validaciones: formato, existencia, estado activo, expiración
   
   ### 2. Función `generate-document`
   - Genera documentos usando templates y datos dinámicos
   - Endpoint: `POST /functions/v1/generate-document`
   - Crea render jobs y procesa templates
   - Soporte para loops y variables dinámicas
   - ⏳ Generación real de PDF pendiente
   
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
   
   ## 🧪 Testing Local
   
   ```bash
   supabase start
   supabase functions serve --no-verify-jwt
   ```
   
   Ver `VALIDACION_EDGE_FUNCTIONS.md` para más detalles.
   
   ## ✅ Checklist
   
   - [x] Edge Functions creadas
   - [x] Validación de API Keys
   - [x] Procesamiento de templates
   - [x] Manejo de errores y CORS
   - [x] Documentación completa
   - [ ] Generación real de PDF (pendiente)
   - [ ] Tests automatizados (pendiente)
   ```

4. **Click en "Create Pull Request"**

---

## 🎯 Alternativa: Desde el Repositorio

Si prefieres crear los PRs desde la página principal:

1. Ve a: https://github.com/DrojasFrontend/2pdf-app
2. Click en **"Pull requests"** → **"New pull request"**
3. Selecciona:
   - **Base branch**: `main`
   - **Compare branch**: `feature/api-keys-management` (o `feature/edge-function-generate-document`)
4. Copia el título y descripción de arriba
5. Click en **"Create Pull Request"**

---

## ✅ Después de Crear los PRs

1. Agrega **reviewers** (miembros de tu equipo)
2. Agrega **labels** si es necesario (ej: `frontend`, `backend`, `feature`)
3. Opcional: Asigna el PR a alguien
4. Notifica a tu equipo que los PRs están listos para revisión

---

## 📚 Documentación Adicional

- `PR_API_KEYS_FRONTEND.md` - Descripción completa del PR Frontend
- `PR_EDGE_FUNCTIONS.md` - Descripción completa del PR Backend
- `VALIDACION_EDGE_FUNCTIONS.md` - Documentación técnica
- `INSTRUCCIONES_PRS.md` - Instrucciones detalladas


