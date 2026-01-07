# 🔄 Cambiar entre Supabase Local y Remoto

## Para probar el backend localmente:

```bash
# Copiar configuración local
cp .env.local.dev .env.local

# Reiniciar el servidor de Next.js
npm run dev
```

Ahora el frontend apuntará a Supabase local y podrás crear API Keys que funcionen con las Edge Functions locales.

## Para volver a remoto:

```bash
# Restaurar configuración remota
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://wxtgjdagxhobtrrkyozo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FjE5XiHqFbRWYAqTj4mYoQ_8Hnbz73I
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
```

## Resumen:

- **Local**: `.env.local.dev` → Para probar Edge Functions locales
- **Remoto**: `.env.local` (actual) → Para producción/desarrollo normal

