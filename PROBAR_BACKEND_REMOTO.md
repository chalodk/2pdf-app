# 🚀 Probar Backend en Supabase Remoto

## Paso 1: Login en Supabase CLI

```bash
/opt/homebrew/Cellar/supabase/2.67.1/bin/supabase login
```

Esto abrirá el navegador para autenticarte.

## Paso 2: Linkear tu proyecto remoto

```bash
cd /Users/daniel/2pdf/2pdf-app
/opt/homebrew/Cellar/supabase/2.67.1/bin/supabase link --project-ref wxtgjdagxhobtrrkyozo
```

## Paso 3: Deployar las Edge Functions

```bash
/opt/homebrew/Cellar/supabase/2.67.1/bin/supabase functions deploy validate-key
/opt/homebrew/Cellar/supabase/2.67.1/bin/supabase functions deploy generate-document
```

## Paso 4: Probar con tu API Key

```bash
curl -X POST https://wxtgjdagxhobtrrkyozo.supabase.co/functions/v1/validate-key \
  -H "Content-Type: application/json" \
  -H "X-API-Key: pk_live_FczqFqw25plcZTEEnh3rkchojzFkR94e"
```

## Paso 5: Ver logs

```bash
/opt/homebrew/Cellar/supabase/2.67.1/bin/supabase functions logs validate-key --follow
```

