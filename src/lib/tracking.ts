import { supabase } from './supabase';

export type EventType = 'visita' | 'wizard_completo' | 'area_vista';

/**
 * Registra un evento anónimo (sin datos personales). Nunca rompe la app si falla.
 */
export function trackEvent(tipo: EventType, payload: Record<string, unknown> = {}): void {
  if (!supabase) return;
  supabase
    .from('eventos')
    .insert({ tipo, payload })
    .then(({ error }) => {
      if (error) console.warn('tracking:', error.message);
    });
}
