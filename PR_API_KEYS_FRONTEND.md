# 🔑 PR: Gestión de API Keys (Frontend)

## 📋 Descripción

Implementación completa del frontend para la gestión de API Keys, permitiendo a los usuarios crear, visualizar, revocar y reactivar API keys desde el dashboard.

## 🎯 Objetivo

Permitir a los usuarios generar y gestionar API Keys que serán utilizadas por clientes externos para autenticarse en la API de generación de PDFs.

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

### 3. **Gestión de API Keys**
- **Revocar**: Desactiva una API Key sin eliminarla
- **Reactivar**: Vuelve a activar una API Key previamente revocada
- **Eliminar**: Elimina permanentemente una API Key
- **Copiar**: Copia los últimos 4 caracteres de la key

### 4. **Integración con Settings**
- Nueva sección "API Key" en el sidebar de configuración
- Navegación integrada con el resto de la aplicación

## 📁 Archivos Modificados/Creados

### Nuevos Componentes
- `components/CreateApiKeyModal.jsx` - Modal para crear API Keys
- `components/ApiKeyRevealModal.jsx` - Modal que muestra la key una sola vez
- `components/ApiKeyListItem.jsx` - Componente para cada item de la lista

### Nuevas Páginas
- `pages/api-keys.js` - Página principal de gestión

### Nuevos Hooks
- `hooks/useApiKeys.js` - Hook personalizado para gestión de API Keys

### Nuevas Librerías
- `lib/apiKeys.js` - Funciones para interactuar con la API de Supabase

### Archivos Modificados
- `components/SettingsSidebar.jsx` - Agregado enlace a API Keys

## 🔐 Seguridad

- Las API Keys se hashean con SHA-256 antes de almacenarse
- Solo se muestra la key completa una vez al crearla
- Solo se muestran los últimos 4 caracteres después de la creación
- Validación de permisos a nivel de organización

## 🧪 Testing

### Pruebas Manuales Recomendadas

1. **Crear API Key**
   - Crear una nueva key con nombre, proyecto y ambiente
   - Verificar que se muestre el modal de revelación
   - Verificar que la key tenga el formato correcto (`pk_test_` o `pk_live_`)

2. **Listar API Keys**
   - Verificar que se muestren todas las keys del usuario
   - Probar filtros por proyecto y ambiente
   - Probar búsqueda por nombre

3. **Revocar/Reactivar**
   - Revocar una key y verificar que se marque como inactiva
   - Reactivar y verificar que vuelva a estar activa

4. **Eliminar**
   - Eliminar una key y verificar que desaparezca de la lista

## 📸 Screenshots

_Agregar screenshots de la interfaz cuando esté disponible_

## 🔗 Relacionado

- Backend: `feature/edge-function-generate-document` (validación de API Keys)
- Issue: _[Número de issue relacionado]_

## ✅ Checklist

- [x] Componentes creados
- [x] Página de gestión implementada
- [x] Integración con Supabase
- [x] Hash de API Keys
- [x] Validaciones de formulario
- [x] Manejo de errores
- [x] Loading states
- [x] Integración con Settings sidebar
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Documentación de API

## 🚀 Deployment Notes

- No requiere cambios en la base de datos (ya existe la tabla `api_keys`)
- Compatible con el schema actual
- No rompe funcionalidad existente

## 📝 Notas Adicionales

- Las API Keys se generan con formato: `pk_{env}_{random_string}`
- El hash se calcula en el frontend antes de enviar a Supabase
- Los últimos 4 caracteres se almacenan para identificación visual


