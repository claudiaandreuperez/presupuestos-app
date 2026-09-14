export enum Categoria {
  Fijos = 'FIJOS',
  Tabaco = 'TABACO',
  Transporte = 'TRANSPORTE',
  Viajes = 'VIAJES',
  Restauracion = 'RESTAURACION',
  Comida = 'COMIDA',
  Cositas = 'COSITAS',
  Ropa = 'ROPA',
  Cosmetica = 'COSMETICA',
  Salud = 'SALUD',
  Regalos = 'REGALOS',
  Otros = 'OTROS',
}

export interface CategoriaInfo {
  id: Categoria;
  label: string;
  color: string;
  icon: string;
}

export const CATEGORIAS: readonly CategoriaInfo[] = [
  { id: Categoria.Fijos, label: 'Fixos', color: '#5c6bc0', icon: '🏠' },
  { id: Categoria.Tabaco, label: 'Tabac', color: '#8d6e63', icon: '🚬' },
  { id: Categoria.Transporte, label: 'Transport', color: '#42a5f5', icon: '🚌' },
  { id: Categoria.Viajes, label: 'Viatges', color: '#26a69a', icon: '✈️' },
  { id: Categoria.Restauracion, label: 'Restaurant', color: '#ff7043', icon: '🍽️' },
  { id: Categoria.Comida, label: 'Menjar', color: '#66bb6a', icon: '🛒' },
  { id: Categoria.Cositas, label: 'Compretes', color: '#ab47bc', icon: '🎁' },
  { id: Categoria.Ropa, label: 'Roba', color: '#ec407a', icon: '👕' },
  { id: Categoria.Cosmetica, label: 'Cosmètica', color: '#f06292', icon: '💄' },
  { id: Categoria.Salud, label: 'Salut', color: '#ef5350', icon: '💊' },
  { id: Categoria.Regalos, label: 'Regals', color: '#ffa726', icon: '🎀' },
  { id: Categoria.Otros, label: 'Altres', color: '#78909c', icon: '📦' },
] as const;

const categoriaMap = new Map(CATEGORIAS.map((c) => [c.id, c]));

export function getCategoriaInfo(categoria: Categoria): CategoriaInfo {
  const info = categoriaMap.get(categoria);
  if (!info) {
    throw new Error(`Categoria desconeguda: ${categoria}`);
  }
  return info;
}

export function isCategoria(value: string): value is Categoria {
  return Object.values(Categoria).includes(value as Categoria);
}
