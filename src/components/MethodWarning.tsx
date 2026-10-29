import React from 'react';
import { AlertTriangle, Info, Clock, ShieldAlert } from 'lucide-react';

interface MethodWarningProps {
  type: 'oede-a10' | 'eil-primaria' | 'eil-agrupada' | 'mip-base2015' | 'pbg-provisorio' | 'generic';
  title?: string;
  message?: string;
  className?: string;
}

export const MethodWarning: React.FC<MethodWarningProps> = ({
  type,
  title,
  message,
  className = 'my-3',
}) => {
  let defaultTitle = 'Aclaración';
  let defaultMessage = '';
  let icon = <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />;
  let boxStyle = 'bg-blue-50 border-blue-200 text-blue-900';

  switch (type) {
    case 'oede-a10':
      defaultTitle = 'OEDE no mide empleo público';
      defaultMessage =
        'Esta fuente solo registra trabajadores de empresas privadas. Por eso no aparecen datos de Administración Pública (no significa que sea cero).';
      icon = <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />;
      boxStyle = 'bg-amber-50 border-amber-200 text-amber-900';
      break;

    case 'eil-primaria':
      defaultTitle = 'EIL solo releva zonas urbanas';
      defaultMessage =
        'Esta encuesta se hace en empresas urbanas del Gran Jujuy y no incluye campo ni minería. Que no haya datos acá no significa que no haya trabajo.';
      icon = <Info className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />;
      boxStyle = 'bg-slate-100 border-slate-200 text-slate-800';
      break;

    case 'eil-agrupada':
      defaultTitle = 'Comercio y Turismo van juntos en EIL';
      defaultMessage =
        'En esta encuesta, Comercio, Restaurantes y Hoteles se publican unidos en un solo grupo.';
      icon = <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />;
      boxStyle = 'bg-purple-50 border-purple-200 text-purple-900';
      break;

    case 'mip-base2015':
      defaultTitle = 'MIP: foto de cómo se conectan los rubros (año 2015)';
      defaultMessage =
        'Muestra cuántos puestos directos e indirectos mueve cada actividad cuando produce. No es la cantidad de gente trabajando hoy.';
      icon = <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />;
      boxStyle = 'bg-indigo-50 border-indigo-200 text-indigo-900';
      break;

    case 'pbg-provisorio':
      defaultTitle = 'Datos recientes provisorios (*)';
      defaultMessage =
        'Los números de 2022, 2023 y 2024 tienen asterisco (*) porque todavía pueden ajustarse en futuras publicaciones de DiPEC.';
      icon = <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />;
      boxStyle = 'bg-amber-50 border-amber-200 text-amber-900';
      break;

    case 'generic':
    default:
      icon = <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />;
      boxStyle = 'bg-brand-50 border-brand-200 text-brand-900';
      break;
  }

  return (
    <div className={`p-3.5 rounded-xl border text-xs flex gap-2.5 shadow-2xs ${boxStyle} ${className}`}>
      {icon}
      <div>
        <h5 className="font-bold mb-0.5">{title || defaultTitle}</h5>
        <p className="leading-relaxed opacity-90">{message || defaultMessage}</p>
      </div>
    </div>
  );
};
