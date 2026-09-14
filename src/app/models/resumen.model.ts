import { Categoria } from './categoria.model';

export interface ResumenCategoria {
  categoria: Categoria;
  gastado: number;
  limite: number;
  restante: number;
  porcentaje: number;
}
