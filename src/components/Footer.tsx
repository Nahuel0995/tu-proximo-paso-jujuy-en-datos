import React from 'react';
import { ShieldCheck, BookOpen, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Columna 1: Proyecto */}
          <div>
            <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500"></span>
              Tu Próximo Paso — Jujuy en Datos
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Un recorrido visual por las 12 actividades económicas de Jujuy: qué producen, cuánto trabajo formal generan y cómo se conectan entre sí.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
              <span>IES N.º 11 — Proyecto Académico</span>
            </div>
          </div>

          {/* Columna 2: Aclaración simple */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Para informarte, no para decidir por vos
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Esta página <strong>no es un test vocacional</strong> ni recomienda qué estudiar o dónde trabajar. Muestra datos reales y públicos para que explores con libertad.
            </p>
          </div>

          {/* Columna 3: Las 4 siglas explicadas en una línea */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Las 4 fuentes oficiales
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li><strong className="text-slate-200">PBG (DiPEC):</strong> lo que produce cada actividad en Jujuy.</li>
              <li><strong className="text-slate-200">OEDE (SIPA):</strong> puestos de trabajo en empresas privadas.</li>
              <li><strong className="text-slate-200">EIL (MTEySS):</strong> tipos de tareas y búsquedas en Gran Jujuy.</li>
              <li><strong className="text-slate-200">MIP (2015):</strong> cómo impulsa cada rubro a los demás.</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Tu Próximo Paso — Jujuy en Datos · IES N.º 11</p>
          <p className="text-slate-400">Datos públicos oficiales explicados en lenguaje claro</p>
        </div>
      </div>
    </footer>
  );
};
