# 📦 Resumen: Qué Llevar al Backend

## ✅ Archivos que VAN al Backend

### Archivos principales:
1. **`server.js`** → `backend/server.js`
   - Servidor Express
   - Endpoint `/render` para generar PDFs
   - Endpoint `/health` para health checks

2. **`Dockerfile`** → `backend/Dockerfile`
   - Configuración Docker con Playwright
   - Dependencias del sistema para Chromium

3. **`package.json`** → `backend/package.json`
   - Solo dependencias del backend (ver abajo)

### Dependencias del Backend:
```json
{
  "express": "^4.19.2",      // Servidor HTTP
  "cors": "^2.8.5",           // CORS middleware
  "handlebars": "^4.7.8",     // Template engine
  "playwright": "^1.43.0"     // PDF generation
}
```

---

## ❌ Archivos que NO van al Backend (se quedan en Frontend)

- `components/` - Componentes React
- `pages/` - Páginas Next.js
- `store/` - Zustand store
- `styles/` - CSS
- `first_model.html` - Ejemplo (opcional)

---

## 🔧 Cambios Necesarios

### Backend:
- ✅ Puerto configurable via `PORT` env var
- ✅ CORS configurable via `CORS_ORIGIN` env var
- ✅ Graceful shutdown para Playwright
- ✅ Mejor manejo de errores

### Frontend:
- ✅ `PreviewPane.jsx` actualizado para usar `NEXT_PUBLIC_API_URL`
- ✅ Remover dependencias backend del `package.json`

---

## 📝 Archivos Creados para Ti

1. **`backend-server.js`** - Versión mejorada del server.js
2. **`backend-package.json`** - package.json solo con dependencias backend
3. **`backend-Dockerfile`** - Dockerfile optimizado
4. **`frontend-package.json`** - package.json sin dependencias backend
5. **`DEPLOYMENT.md`** - Guía completa de deployment
6. **`BACKEND_SEPARATION.md`** - Detalles técnicos

---

## 🚀 Quick Start

### 1. Crear estructura:
```bash
mkdir backend frontend
```

### 2. Setup Backend:
```bash
cd backend
cp ../backend-server.js server.js
cp ../backend-package.json package.json
cp ../backend-Dockerfile Dockerfile
npm install
```

### 3. Setup Frontend:
```bash
cd ../frontend
cp -r ../components ../pages ../store ../styles .
cp ../frontend-package.json package.json
npm install
```

### 4. Variables de entorno:

**Backend `.env`:**
```env
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_N8N_WEBHOOK_URL=tu-webhook-url
```

---

## 📊 Comparación

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Estructura** | Monolítico | Separado |
| **Deploy** | Junto | Independiente |
| **Escalabilidad** | Limitada | Backend escalable |
| **Dependencias** | Mezcladas | Separadas |
| **Mantenimiento** | Complejo | Simple |

---

## ✅ Ventajas de Separar

1. **Deploy independiente** - Backend y frontend pueden deployarse por separado
2. **Escalabilidad** - Puedes escalar el backend sin afectar el frontend
3. **Tecnologías diferentes** - Backend puede usar diferentes stack
4. **Equipos separados** - Diferentes equipos pueden trabajar en cada parte
5. **Costos** - Puedes optimizar recursos por servicio

