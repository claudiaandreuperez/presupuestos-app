import { Injectable } from '@angular/core';

import { CATEGORIAS, Categoria } from '../models/categoria.model';
import { Presupuesto, PresupuestoInput } from '../models/presupuesto.model';
import { mesAnterior } from '../utils/mes.util';
import { db } from './presupuestos.database';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {
  async getAll(): Promise<Presupuesto[]> {
    return db.presupuestos.toArray();
  }

  async getByMes(mes: string): Promise<Presupuesto[]> {
    return db.presupuestos.where('mes').equals(mes).toArray();
  }

  async get(categoria: Categoria, mes: string): Promise<Presupuesto | undefined> {
    return db.presupuestos.get([categoria, mes]);
  }

  async getOrDefault(categoria: Categoria, mes: string): Promise<Presupuesto> {
    const presupuesto = await this.get(categoria, mes);
    return presupuesto ?? { categoria, mes, limite: 0 };
  }

  async getMapByMes(mes: string): Promise<Map<Categoria, Presupuesto>> {
    const presupuestos = await this.getByMes(mes);
    return new Map(presupuestos.map((p) => [p.categoria, p]));
  }

  async set(input: PresupuestoInput): Promise<Presupuesto> {
    const presupuesto: Presupuesto = {
      categoria: input.categoria,
      mes: input.mes,
      limite: input.limite,
    };

    await db.presupuestos.put(presupuesto);
    return presupuesto;
  }

  async setMany(presupuestos: PresupuestoInput[]): Promise<void> {
    await db.presupuestos.bulkPut(presupuestos);
  }

  async delete(categoria: Categoria, mes: string): Promise<void> {
    await db.presupuestos.delete([categoria, mes]);
  }

  async copyFromPreviousMes(targetMes: string): Promise<number> {
    const sourceMes = mesAnterior(targetMes);
    const source = await this.getByMes(sourceMes);

    if (source.length === 0) {
      return 0;
    }

    const copied = source.map((p) => ({
      categoria: p.categoria,
      mes: targetMes,
      limite: p.limite,
    }));

    await this.setMany(copied);
    return copied.length;
  }

  async ensureAllCategories(mes: string, defaultLimite = 0): Promise<void> {
    const existing = await this.getMapByMes(mes);
    const missing = CATEGORIAS.filter((c) => !existing.has(c.id)).map((c) => ({
      categoria: c.id,
      mes,
      limite: defaultLimite,
    }));

    if (missing.length > 0) {
      await this.setMany(missing);
    }
  }
}
