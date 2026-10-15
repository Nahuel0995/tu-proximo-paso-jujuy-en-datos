import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** null si no hay variables de entorno: la app pública sigue funcionando sin backend. */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
