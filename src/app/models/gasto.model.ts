import { Categoria } from './categoria.model';

export interface Gasto {
  id: string;
  fecha: string;
  categoria: Categoria;
  importe: number;
  nota?: string;
  mes: string;
}

export type GastoInput = Omit<Gasto, 'id' | 'mes'>;
