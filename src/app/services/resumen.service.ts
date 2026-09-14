import { Injectable } from '@angular/core';

import { CATEGORIAS } from '../models/categoria.model';
import { ResumenCategoria } from '../models/resumen.model';
import { GastoService } from './gasto.service';
import { PresupuestoService } from './presupuesto.service';

@Injectable({ providedIn: 'root' })
export class ResumenService {
  constructor(
    private readonly gastoService: GastoService,
    private readonly presupuestoService: PresupuestoService,
  ) {}

  async getResumenMes(mes: string): Promise<ResumenCategoria[]> {
    await this.presupuestoService.ensureAllCategories(mes);

    const [totales, presupuestos] = await Promise.all([
      this.gastoService.getTotalesPorCategoria(mes),
      this.presupuestoService.getMapByMes(mes),
    ]);

    return CATEGORIAS.map((cat) => {
      const gastado = totales.get(cat.id) ?? 0;
      const limite = presupuestos.get(cat.id)?.limite ?? 0;
      const restante = limite - gastado;
      const porcentaje =
        limite > 0 ? Math.min((gastado / limite) * 100, 100) : gastado > 0 ? 100 : 0;

      return { categoria: cat.id, gastado, limite, restante, porcentaje };
    });
  }
}
