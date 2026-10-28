import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';

export interface SearchableArea {
  area_id: string;
  nombre: string;
  descripcion: string;
}

interface SearchBarProps {
  areas?: SearchableArea[];
  onSelectArea?: (areaId: string) => void;
  placeholder?: string;
  className?: string;
}

/** Datos simulados para probar el componente. */
export const MOCK_SEARCH_AREAS: SearchableArea[] = [
  { area_id: 'A01', nombre: 'Agro y producción primaria', descripcion: 'Actividades agrícolas, ganaderas, caza y silvicultura.' },
  { area_id: 'A02', nombre: 'Minería', descripcion: 'Explotación de minas y canteras, incluyendo litio y metales.' },
  { area_id: 'A03', nombre: 'Industria manufacturera', descripcion: 'Transformación de materias primas, azúcar, siderurgia y alimentos.' },
  { area_id: 'A05', nombre: 'Construcción', descripcion: 'Obras de infraestructura y edificación.' },
];

/** Normaliza para comparar sin tildes ni mayúsculas (mantiene la longitud del texto). */
const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Resalta la coincidencia (insensible a tildes). */
const Highlight: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const q = norm(query.trim());
  if (!q) return <>{text}</>;
  const idx = norm(text).indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-emerald-100 text-emerald-900 font-bold rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
};

/** Buscador con dropdown de coincidencias, resaltado y navegación por teclado. */
export const SearchBar: React.FC<SearchBarProps> = ({
  areas = MOCK_SEARCH_AREAS,
  onSelectArea,
  placeholder = 'Buscar actividad (ej. minería)…',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useMemo(() => `search-list-${Math.random().toString(36).slice(2, 8)}`, []);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return [];
    return areas.filter(
      (a) => norm(a.nombre).includes(q) || norm(a.descripcion).includes(q) || norm(a.area_id).includes(q)
    );
  }, [query, areas]);

  useEffect(() => setActive(0), [query]);

  // Cierra al hacer clic fuera
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const choose = (a: SearchableArea) => {
    onSelectArea?.(a.area_id);
    setQuery('');
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[active]);
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showDropdown && results.length ? `${listId}-${active}` : undefined}
          aria-label="Buscar áreas económicas"
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 z-[60] mt-2 min-w-[300px] rounded-2xl border border-gray-200 bg-white p-2 shadow-lg sm:min-w-[380px]">
          <div className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Coincidencias encontradas
          </div>
          {results.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500">Sin coincidencias para “{query}”.</div>
          ) : (
            <ul id={listId} role="listbox" className="max-h-80 overflow-y-auto">
              {results.map((a, i) => (
                <li
                  key={a.area_id}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(a)}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl px-2.5 py-2 ${
                    i === active ? 'bg-emerald-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="mt-0.5 rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-gray-700">
                    {a.area_id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-gray-900">
                      <Highlight text={a.nombre} query={query} />
                    </span>
                    <span className="block text-xs leading-snug text-gray-500">
                      <Highlight text={a.descripcion} query={query} />
                    </span>
                  </span>
                  <span className="mt-0.5 inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[11px] font-bold text-emerald-700">
                    Explorar <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
