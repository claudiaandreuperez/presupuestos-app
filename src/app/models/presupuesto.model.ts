import { Categoria } from './categoria.model';

export interface Presupuesto {
  categoria: Categoria;
  mes: string;
  limite: number;
}

export type PresupuestoInput = Presupuesto;
