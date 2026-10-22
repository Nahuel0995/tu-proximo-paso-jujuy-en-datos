import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { LogOut, Upload, BarChart3, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import areasJson from '../../data/areas.json';
import { StatsDashboard } from '../components/admin/StatsDashboard';
import { toFrequency } from '../components/admin/chartTypes';

interface Evento {
  tipo: string;
  payload: Record<string, any>;
  created_at: string;
}

const ARCHIVOS_FUENTE = [
  'PBG/PBG-2004-2024-actualizacion-agosto-2025.xlsx',
  'OEDE/provinciales_serie_empleo_trimestral_2dig_7.xlsx',
  'EIL/EIL_2407_2.xlsx',
  'EIL/EIL_2407_6.xlsx',
  'EIL/EIL_2407_8.xlsx',
  'MIP/Informe-MIP-y-Empleo-Jujuy-base-2015.pdf',
];

const AREA_LABELS: Record<string, string> = Object.fromEntries(
  (areasJson as { area_id: string; nombre: string }[]).map((a) => [a.area_id, a.nombre])
);

export const AdminPage: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) return;
    supabase
      .from('eventos')
      .select('tipo,payload,created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
      .then(({ data, error }) => {
        if (error) setError('No tenés permisos de administrador o falló la consulta.');
        else setEventos((data as Evento[]) || []);
      });
  }, [session]);

  if (!supabase) {
    return (
      <div className="py-12 max-w-xl mx-auto text-sm text-slate-700">
        El panel no está configurado. Definí <code>VITE_SUPABASE_URL</code> y{' '}
        <code>VITE_SUPABASE_ANON_KEY</code> (ver <code>.env.example</code>).
      </div>
    );
  }
  if (loading) return <div className="py-12 text-center text-slate-500">Cargando…</div>;

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) setError('Usuario o contraseña incorrectos.');
  };

  if (!session) {
    return (
      <form onSubmit={login} className="max-w-sm mx-auto my-16 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Acceso administradores
        </h1>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        <input type="password" required placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm" />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl py-2 text-sm">Ingresar</button>
      </form>
    );
  }

  const subir = async (ruta: string, file: File | undefined) => {
    if (!file) return;
    setMsg(null);
    const { error } = await supabase!.storage.from('fuentes').upload(ruta, file, { upsert: true });
    setMsg(error
      ? { ok: false, text: `Error al subir ${ruta}: ${error.message}` }
      : { ok: true, text: `${ruta} subido. Ejecutá el workflow "Actualizar datos" en GitHub para regenerar los JSON.` });
  };

  const visitas = eventos.filter((e) => e.tipo === 'visita').length;
  const wizards = eventos.filter((e) => e.tipo === 'wizard_completo');
  const dashboardData = {
    areasElegidas: toFrequency(wizards.flatMap((e) => e.payload.areas || [])),
    areasConsultadas: toFrequency(
      eventos.filter((e) => e.tipo === 'area_vista').map((e) => e.payload.area_id)
    ),
    motivos: toFrequency(wizards.map((e) => e.payload.motivo || 'sin dato')),
    tareas: toFrequency(wizards.map((e) => e.payload.tipoTarea || 'sin dato')),
    edades: toFrequency(wizards.map((e) => e.payload.rangoEdad || 'sin dato')),
  };

  const descargarCsv = () => {
    const filas = ['fecha,tipo,payload', ...eventos.map((e) => `${e.created_at},${e.tipo},"${JSON.stringify(e.payload).replace(/"/g, '""')}"`)];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([filas.join('\n')], { type: 'text/csv' }));
    a.download = 'eventos.csv';
    a.click();
  };

  return (
    <div className="py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Panel de administración</h1>
        <div className="flex gap-2">
          <button onClick={descargarCsv} className="text-xs px-3 py-2 rounded-xl bg-slate-200 font-bold">Exportar CSV</button>
          <button onClick={() => supabase!.auth.signOut()} className="text-xs px-3 py-2 rounded-xl bg-slate-800 text-white font-bold inline-flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-5"><div className="text-3xl font-black">{visitas}</div><div className="text-xs text-slate-500">Visitas</div></div>
        <div className="bg-white border rounded-2xl p-5"><div className="text-3xl font-black">{wizards.length}</div><div className="text-xs text-slate-500">Asistentes completados</div></div>
        <div className="bg-white border rounded-2xl p-5"><div className="text-3xl font-black">{eventos.filter((e) => e.tipo === 'area_vista').length}</div><div className="text-xs text-slate-500">Fichas de área vistas</div></div>
      </div>

      <StatsDashboard data={dashboardData} areaLabels={AREA_LABELS} />

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-black text-slate-900 flex items-center gap-2"><Upload className="w-5 h-5" /> Actualizar bases de datos</h2>
        <p className="text-xs text-slate-600">Subí el archivo nuevo (se reemplaza el anterior). Luego un workflow de GitHub corre el ETL y publica los datos actualizados.</p>
        {ARCHIVOS_FUENTE.map((ruta) => (
          <label key={ruta} className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-100 pb-2">
            <span className="font-mono">{ruta}</span>
            <input type="file" accept=".xlsx,.pdf" onChange={(e) => subir(ruta, e.target.files?.[0])} />
          </label>
        ))}
        {msg && (
          <p className={`text-xs flex items-center gap-1 ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>
            {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
          </p>
        )}
      </section>
    </div>
  );
};

export default AdminPage;
