import { Injectable } from '@angular/core';

import { Categoria } from '../models/categoria.model';
import { DadesEvolucioMes } from '../models/graficos.model';
import { ResumenCategoria } from '../models/resumen.model';
import { ultimosMeses } from '../utils/mes.util';
import { GastoService } from './gasto.service';
import { PresupuestoService } from './presupuesto.service';
import { ResumenService } from './resumen.service';

@Injectable({ providedIn: 'root' })
export class GraficosService {
  constructor(
    private readonly resumenService: ResumenService,
    private readonly gastoService: GastoService,
    private readonly presupuestoService: PresupuestoService,
  ) {}

  async getComparativaMes(mes: string): Promise<ResumenCategoria[]> {
    return this.resumenService.getResumenMes(mes);
  }

  async getEvolucionCategoria(
    categoria: Categoria,
    mesFinal: string,
    meses = 6,
  ): Promise<DadesEvolucioMes[]> {
    const mesesList = ultimosMeses(mesFinal, meses);

    await Promise.all(mesesList.map((mes) => this.presupuestoService.ensureAllCategories(mes)));

    return Promise.all(
      mesesList.map(async (mes) => {
        const [gastado, presupuesto] = await Promise.all([
          this.gastoService.getTotalByCategoria(mes, categoria),
          this.presupuestoService.getOrDefault(categoria, mes),
        ]);

        return {
          mes,
          gastado,
          limite: presupuesto.limite,
        };
      }),
    );
  }
}
