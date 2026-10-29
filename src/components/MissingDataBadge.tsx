import React from 'react';
import { EyeOff, AlertCircle, HelpCircle, CheckCircle2, Star } from 'lucide-react';

interface MissingDataBadgeProps {
  status: 'PUBLICADO' | 'SIN_DATO_SECRETO_ESTADISTICO' | 'SIN_DATO_NO_DISPONIBLE' | 'NO_APLICA' | 'FUENTE_NO_DISPONIBLE' | 'PROVISORIO';
  label?: string;
}

export const MissingDataBadge: React.FC<MissingDataBadgeProps> = ({ status, label }) => {
  switch (status) {
    case 'PUBLICADO':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>{label || 'Dato disponible'}</span>
        </span>
      );

    case 'SIN_DATO_SECRETO_ESTADISTICO':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-900 border border-amber-300"
          title="Hay pocas empresas en este rubro y el dato se reserva por privacidad."
        >
          <EyeOff className="w-3 h-3 text-amber-700" />
          <span>{label || 'Dato reservado'}</span>
        </span>
      );

    case 'NO_APLICA':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300"
          title="Esta encuesta no mide este rubro."
        >
          <HelpCircle className="w-3 h-3 text-slate-500" />
          <span>{label || 'No medido acá'}</span>
        </span>
      );

    case 'FUENTE_NO_DISPONIBLE':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
          title="Esta fuente no incluye a este sector."
        >
          <AlertCircle className="w-3 h-3 text-rose-600" />
          <span>{label || 'No incluido'}</span>
        </span>
      );

    case 'PROVISORIO':
      return (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
          title="Dato preliminar que puede actualizarse más adelante."
        >
          <Star className="w-3 h-3 text-indigo-600 fill-indigo-600" />
          <span>{label || 'Provisorio (*)'}</span>
        </span>
      );

    case 'SIN_DATO_NO_DISPONIBLE':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          <AlertCircle className="w-3 h-3 text-slate-400" />
          <span>{label || 'Sin dato'}</span>
        </span>
      );
  }
};
