import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Cliente de Supabase con service role (acceso completo)
export function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

// Cliente de Supabase con anon key (acceso limitado por RLS)
export function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  )
}

