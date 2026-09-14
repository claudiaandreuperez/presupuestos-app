import { Categoria } from './categoria.model';

export interface DadesEvolucioMes {
  mes: string;
  gastado: number;
  limite: number;
}

export interface EvolucionCategoriaRequest {
  categoria: Categoria;
  mesFinal: string;
  meses?: number;
}
