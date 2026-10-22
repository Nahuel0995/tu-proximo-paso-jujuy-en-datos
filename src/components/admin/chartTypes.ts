export interface ChartDatum {
  name: string;
  value: number;
}

/** Paleta azul de la marca. */
export const BLUE_PALETTE = ['#0077b6', '#0096c7', '#48cae4', '#90e0ef', '#023e8a', '#00b4d8'];

export const sumValues = (data: ChartDatum[]): number =>
  data.reduce((acc, d) => acc + d.value, 0);

/** Convierte un array de claves repetidas en frecuencias ordenadas de mayor a menor. */
export const toFrequency = (items: string[]): ChartDatum[] => {
  const m = new Map<string, number>();
  items.forEach((k) => m.set(k, (m.get(k) || 0) + 1));
  return [...m.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

/** Datos de ejemplo para probar el dashboard sin backend. */
export const MOCK_DASHBOARD_DATA = {
  areasElegidas: [
    { name: 'A05', value: 12 },
    { name: 'A01', value: 9 },
    { name: 'A03', value: 7 },
    { name: 'A08', value: 5 },
    { name: 'A10', value: 3 },
    { name: 'A12', value: 1 },
  ] as ChartDatum[],
  areasConsultadas: [] as ChartDatum[], // ejemplo de estado vacío
  motivos: [
    { name: 'Estudiar', value: 14 },
    { name: 'Trabajar', value: 9 },
    { name: 'Curiosidad', value: 4 },
  ] as ChartDatum[],
  tareas: [
    { name: 'Profesional', value: 10 },
    { name: 'Técnica', value: 8 },
    { name: 'Operativa', value: 5 },
  ] as ChartDatum[],
  edades: [
    { name: '15-24', value: 11 },
    { name: '25-34', value: 8 },
    { name: '35-44', value: 4 },
    { name: '45+', value: 2 },
  ] as ChartDatum[],
};
