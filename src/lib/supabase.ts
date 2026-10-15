import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim().replace(/^["']|["']$/g, '');
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim().replace(/^["']|["']$/g, '');

function crearCliente(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  try {
    return createClient(url, anonKey);
  } catch (e) {
    // Una configuración inválida nunca debe romper la app pública.
    console.error('Supabase mal configurado:', e);
    return null;
  }
}

/** null si no hay variables de entorno válidas: la app pública sigue funcionando sin backend. */
export const supabase: SupabaseClient | null = crearCliente();
