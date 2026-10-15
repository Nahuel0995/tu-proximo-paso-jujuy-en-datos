import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Limpia espacios, comillas y un posible prefijo NOMBRE= pegado por error en el valor. */
const limpiar = (v: unknown): string | undefined =>
  typeof v === 'string'
    ? v.trim().replace(/^[A-Z_]+=/, '').trim().replace(/^["']|["']$/g, '') || undefined
    : undefined;

const url = limpiar(import.meta.env.VITE_SUPABASE_URL);
const anonKey = limpiar(import.meta.env.VITE_SUPABASE_ANON_KEY);

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
