export function mesFromFecha(fecha: string): string {
  return fecha.slice(0, 7);
}

export function mesActual(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function mesAnterior(mes: string): string {
  const [year, month] = mes.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function mesSiguiente(mes: string): string {
  const [year, month] = mes.split('-').map(Number);
  const date = new Date(year, month, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatMesLabel(mes: string): string {
  const [year, month] = mes.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('ca', { month: 'long', year: 'numeric' }).format(date);
}

export function formatMesShortLabel(mes: string): string {
  const [year, month] = mes.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('ca', { month: 'short', year: '2-digit' }).format(date);
}

export function ultimosMeses(mesFinal: string, count: number): string[] {
  const result: string[] = [];
  let current = mesFinal;

  for (let i = 0; i < count; i++) {
    result.unshift(current);
    current = mesAnterior(current);
  }

  return result;
}

export function formatFechaLabel(fecha: string): string {
  const [year, month, day] = fecha.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('ca', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function fechaHoy(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
