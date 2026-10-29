import React, { useState, useRef } from 'react';
import { Area, AreaId } from '../types';
import { AreaIcon } from '../utils/iconHelper';
import { JujuyLandscapeIllustration } from '../components/JujuyLandscapeIllustration';
import {
  ArrowRight,
  Sparkles,
  Layers,
  BookOpen,
  TrendingUp,
  Users,
  Network,
  Calendar,
  ChevronRight,
  ChevronDown,
  Info,
  Rocket,
  BarChart2,
  HelpCircle,
} from 'lucide-react';

interface HomePageProps {
  areas: Area[];
  onStartWizard: () => void;
  onExploreAreas: () => void;
  onSelectArea: (areaId: AreaId) => void;
  onNavigateMethodology: () => void;
}

const AREA_UI_CONFIG: Record<
  AreaId,
  {
    simpleName: string;
    badgeColor: string;
    hoverBorder: string;
  }
> = {
  A01: { simpleName: 'Agro', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', hoverBorder: 'hover:border-emerald-400 hover:shadow-emerald-100' },
  A02: { simpleName: 'Minería', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200', hoverBorder: 'hover:border-amber-400 hover:shadow-amber-100' },
  A03: { simpleName: 'Industria', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200', hoverBorder: 'hover:border-blue-400 hover:shadow-blue-100' },
  A04: { simpleName: 'Energía', badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200', hoverBorder: 'hover:border-yellow-400 hover:shadow-yellow-100' },
  A05: { simpleName: 'Construcción', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200', hoverBorder: 'hover:border-orange-400 hover:shadow-orange-100' },
  A06: { simpleName: 'Comercio', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200', hoverBorder: 'hover:border-teal-400 hover:shadow-teal-100' },
  A07: { simpleName: 'Turismo', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200', hoverBorder: 'hover:border-rose-400 hover:shadow-rose-100' },
  A08: { simpleName: 'Transporte', badgeColor: 'bg-sky-50 text-sky-700 border-sky-200', hoverBorder: 'hover:border-sky-400 hover:shadow-sky-100' },
  A09: { simpleName: 'Servicios', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200', hoverBorder: 'hover:border-purple-400 hover:shadow-purple-100' },
  A10: { simpleName: 'Estado', badgeColor: 'bg-slate-100 text-slate-700 border-slate-300', hoverBorder: 'hover:border-slate-400 hover:shadow-slate-100' },
  A11: { simpleName: 'Educación', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200', hoverBorder: 'hover:border-indigo-400 hover:shadow-indigo-100' },
  A12: { simpleName: 'Salud', badgeColor: 'bg-red-50 text-red-700 border-red-200', hoverBorder: 'hover:border-red-400 hover:shadow-red-100' },
};

export const HomePage: React.FC<HomePageProps> = ({
  areas,
  onStartWizard,
  onExploreAreas,
  onSelectArea,
  onNavigateMethodology,
}) => {
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const deepDiveRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const toggleDeepDive = () => {
    setShowDeepDive((prev) => !prev);
    setTimeout(() => deepDiveRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const toggleHowItWorks = () => {
    setShowHowItWorks((prev) => !prev);
    setTimeout(() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="space-y-8 sm:space-y-10 py-4 sm:py-8">
      {/* 1. PORTADA */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 text-white p-6 sm:p-10 lg:p-14 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-brand-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="animate-hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold border border-brand-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>IES N.º 11 • Proyecto Académico</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm uppercase tracking-wider font-extrabold text-brand-300">
              Tu Próximo Paso · Jujuy en Datos
            </div>
            <h1 className="animate-hero-title text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              ¿Qué te gustaría descubrir de Jujuy?
            </h1>
            <p className="animate-hero-subtitle text-base sm:text-xl text-slate-200 font-medium max-w-2xl mx-auto leading-relaxed">
              Conocé qué producen las actividades de nuestra provincia y dónde hay trabajo formal, en palabras simples.
            </p>
          </div>

          <div className="animate-hero-cta pt-1 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartWizard}
              className="group inline-flex items-center justify-center gap-3 px-9 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600 hover:from-brand-400 hover:to-indigo-500 text-white font-black text-lg sm:text-xl shadow-2xl shadow-brand-950 transition-all duration-200 hover:-translate-y-1 active:scale-95 cursor-pointer"
            >
              <Rocket className="w-6 h-6 text-amber-300" />
              <span>Empezar recorrido guiado</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5" />
            </button>

            <button
              onClick={onExploreAreas}
              className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Ver las 12 áreas</span>
            </button>
          </div>

          <div className="pt-3 max-w-3xl mx-auto">
            <JujuyLandscapeIllustration className="rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden" />
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>No es un test vocacional: muestra estadísticas públicas de Jujuy para que explores libremente.</span>
          </p>
        </div>
      </section>

      {/* 2. LAS 12 ÁREAS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tocá un área para ver sus números
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Las 12 actividades económicas de Jujuy en un vistazo.
            </p>
          </div>
          <button
            onClick={onExploreAreas}
            className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Ver listado completo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {areas.map((area) => {
            const config = AREA_UI_CONFIG[area.area_id] || {
              simpleName: area.nombre,
              badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
              hoverBorder: 'hover:border-slate-300',
            };

            return (
              <button
                key={area.area_id}
                onClick={() => onSelectArea(area.area_id)}
                className={`p-4 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-lg ${config.hoverBorder} text-center transition-all duration-200 hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500`}
                aria-label={`Ver datos de ${config.simpleName}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-200 shadow-2xs group-hover:scale-110 mb-2.5 ${config.badgeColor}`}>
                  <AreaIcon name={area.icono} size={28} />
                </div>
                <span className="font-black text-slate-900 text-sm sm:text-base group-hover:text-brand-700 transition-colors block">
                  {config.simpleName}
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                  {area.area_id}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. ACCESOS RÁPIDOS A MÁS INFO */}
      <section className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-700">¿Querés saber más sobre la provincia?</span>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={toggleDeepDive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 shadow-2xs cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-brand-600" />
            <span>{showDeepDive ? 'Ocultar resumen de Jujuy' : 'Resumen general de Jujuy'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDeepDive ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={toggleHowItWorks}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>¿Cómo se usa?</span>
          </button>

          <button
            onClick={onNavigateMethodology}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Fuentes de datos</span>
          </button>
        </div>
      </section>

      {/* 4. ¿CÓMO SE USA? */}
      {showHowItWorks && (
        <section ref={howItWorksRef} className="space-y-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">En 3 pasos simples</h3>
            <button onClick={() => setShowHowItWorks(false)} className="text-xs text-slate-400 hover:text-slate-600 underline cursor-pointer">
              Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-black text-brand-700">1. Elegí</span>
              <h4 className="font-bold text-slate-900 text-sm">Tocá una actividad</h4>
              <p className="text-xs text-slate-600">Podés entrar directo a cualquiera de las 12 áreas o usar el recorrido guiado.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-black text-brand-700">2. Mirá</span>
              <h4 className="font-bold text-slate-900 text-sm">Leé los gráficos simples</h4>
              <p className="text-xs text-slate-600">Vas a ver qué produce, cuánto empleo privado tiene y qué tareas aparecen.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-xs font-black text-brand-700">3. Compará</span>
              <h4 className="font-bold text-slate-900 text-sm">Poné dos áreas frente a frente</h4>
              <p className="text-xs text-slate-600">Usá la pestaña “Comparar” para ver en qué se diferencian dos rubros.</p>
            </div>
          </div>
        </section>
      )}

      {/* 5. RESUMEN GENERAL DE JUJUY */}
      {showDeepDive && (
        <section ref={deepDiveRef} className="space-y-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Números generales de Jujuy
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Los 4 indicadores oficiales explicados en pocas palabras.
              </p>
            </div>
            <button onClick={() => setShowDeepDive(false)} className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer">
              Ocultar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-emerald-100 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 block">
                PBG · Lo que produce Jujuy
              </span>
              <div className="text-2xl font-black text-slate-900">$5,48 billones</div>
              <p className="text-xs text-slate-600">
                Valor de todo lo producido en 2024* ($6,47 mil millones medido en pesos de 2004 sin inflación).
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-blue-100 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 block">
                OEDE · Empleo privado
              </span>
              <div className="text-2xl font-black text-slate-900">63.017 puestos</div>
              <p className="text-xs text-slate-600">
                Trabajadores en blanco en empresas privadas (1° Trim 2026). No cuenta empleados públicos.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-800 block">
                Historia · Más de 20 años
              </span>
              <div className="text-2xl font-black text-slate-900">2004 – 2026</div>
              <p className="text-xs text-slate-600">
                Podés ver cómo creció o cambió cada actividad año por año durante dos décadas.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-indigo-100 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                <Network className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 block">
                MIP · Rubros conectados
              </span>
              <div className="text-2xl font-black text-slate-900">34 sectores</div>
              <p className="text-xs text-slate-600">
                Muestra cuánto trabajo mueve una actividad en sus proveedores cuando produce (base 2015).
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 6. LAS 4 FUENTES EXPLICADAS BREVEMENTE */}
      <section className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-white">¿Qué significan las siglas de las fuentes?</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Todos los números salen de organismos públicos oficiales.
            </p>
          </div>
          <button
            onClick={onNavigateMethodology}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>Ver detalle de fuentes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-emerald-400 block">PBG · Producción</span>
            <span className="text-slate-300">Cuánto valor genera cada rubro en Jujuy (DiPEC).</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-blue-400 block">OEDE · Empleo privado</span>
            <span className="text-slate-300">Puestos en blanco en empresas privadas (SIPA).</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-purple-400 block">EIL · Tareas urbanas</span>
            <span className="text-slate-300">Tipos de puestos y búsquedas en Gran Jujuy.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-bold text-indigo-400 block">MIP · Conexiones</span>
            <span className="text-slate-300">Cómo una actividad impulsa a sus proveedores (2015).</span>
          </div>
        </div>
      </section>
    </div>
  );
};
