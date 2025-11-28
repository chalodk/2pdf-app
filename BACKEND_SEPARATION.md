# Guía de Separación Frontend/Backend

## Archivos que van al BACKEND

### Archivos principales:
- ✅ `server.js` - Servidor Express con endpoint `/render`
- ✅ `Dockerfile` - Configuración Docker para el backend
- ✅ `package.json` - Necesita ser actualizado (solo dependencias backend)

### Dependencias del backend:
```json
{
  "express": "^4.19.2",
  "cors": "^2.8.5",
  "handlebars": "^4.7.8",
  "playwright": "^1.43.0"
}
```

### Archivos opcionales:
- `first_model.html` - Solo si quieres mantenerlo como ejemplo/template

---

## Archivos que se quedan en el FRONTEND

### Estructura completa:
- ✅ `components/` - Todos los componentes React
- ✅ `pages/` - Páginas Next.js
- ✅ `store/` - Store Zustand
- ✅ `styles/` - Estilos CSS
- ✅ `package.json` - Con dependencias de Next.js, React, etc.

---

## Pasos para separar

### 1. Crear carpeta backend
```bash
mkdir backend
cd backend
```

### 2. Mover archivos al backend
```bash
# Desde la raíz del proyecto
cp server.js backend/
cp Dockerfile backend/
```

### 3. Crear package.json para backend
Ver `backend/package.json` en este documento

### 4. Actualizar frontend
- Remover dependencias de backend del `package.json` del frontend
- Actualizar la URL del API en `PreviewPane.jsx` (usar variable de entorno)

---

## Configuración necesaria

### Backend:
- Puerto: 3000 (o configurable via env)
- Endpoint: POST `/render`
- Health check: GET `/health`

### Frontend:
- Variable de entorno: `NEXT_PUBLIC_API_URL=http://localhost:3000`
- O en producción: `NEXT_PUBLIC_API_URL=https://api.tudominio.com`

