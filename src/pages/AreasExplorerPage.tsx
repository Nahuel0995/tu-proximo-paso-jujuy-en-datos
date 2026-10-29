import React, { useState } from 'react';
import { Area, AreaId } from '../types';
import { AreaCard } from '../components/AreaCard';
import { Search, Layers, X } from 'lucide-react';

interface AreasExplorerPageProps {
  areas: Area[];
  onSelectArea: (areaId: AreaId) => void;
}

export const AreasExplorerPage: React.FC<AreasExplorerPageProps> = ({ areas, onSelectArea }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAreas = areas.filter(
    (area) =>
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.area_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 py-6">
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>12 Actividades de Jujuy</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Elegí un área para explorar
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Mirá cuánto produce (PBG), cuántos puestos privados tiene (OEDE), qué tareas pide (EIL) y cómo se conecta con otros rubros (MIP).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="relative min-w-[240px] sm:min-w-[270px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar área o actividad..."
                className="w-full pl-9 pr-9 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
                aria-label="Filtrar áreas"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-xs font-medium text-slate-500 whitespace-nowrap bg-slate-100 px-3 py-2 rounded-xl border border-slate-200/80">
              {filteredAreas.length} de {areas.length}
            </div>
          </div>
        </div>
      </div>

      {filteredAreas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAreas.map((area) => (
            <AreaCard key={area.area_id} area={area} onSelect={onSelectArea} />
          ))}
        </div>
      ) : (
        <div className="text-center py-14 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-slate-600 font-medium mb-2">No encontramos áreas con ese nombre.</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-brand-600 font-semibold hover:underline"
          >
            Mostrar las 12 áreas
          </button>
        </div>
      )}
    </div>
  );
};
