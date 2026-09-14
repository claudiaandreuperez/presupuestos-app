import { Injectable } from '@angular/core';

import { Categoria } from '../models/categoria.model';
import { Gasto, GastoInput } from '../models/gasto.model';
import { mesFromFecha } from '../utils/mes.util';
import { db } from './presupuestos.database';

@Injectable({ providedIn: 'root' })
export class GastoService {
  async getAll(): Promise<Gasto[]> {
    return db.gastos.orderBy('fecha').reverse().toArray();
  }

  async getById(id: string): Promise<Gasto | undefined> {
    return db.gastos.get(id);
  }

  async getByMes(mes: string): Promise<Gasto[]> {
    return db.gastos.where('mes').equals(mes).sortBy('fecha');
  }

  async getByMesAndCategoria(mes: string, categoria: Categoria): Promise<Gasto[]> {
    return db.gastos.where('[mes+categoria]').equals([mes, categoria]).sortBy('fecha');
  }

  async getTotalByMes(mes: string): Promise<number> {
    const gastos = await this.getByMes(mes);
    return gastos.reduce((sum, g) => sum + g.importe, 0);
  }

  async getTotalByCategoria(mes: string, categoria: Categoria): Promise<number> {
    const gastos = await this.getByMesAndCategoria(mes, categoria);
    return gastos.reduce((sum, g) => sum + g.importe, 0);
  }

  async getTotalesPorCategoria(mes: string): Promise<Map<Categoria, number>> {
    const gastos = await this.getByMes(mes);
    const totales = new Map<Categoria, number>();

    for (const gasto of gastos) {
      totales.set(gasto.categoria, (totales.get(gasto.categoria) ?? 0) + gasto.importe);
    }

    return totales;
  }

  async create(input: GastoInput): Promise<Gasto> {
    const gasto: Gasto = {
      ...input,
      id: crypto.randomUUID(),
      mes: mesFromFecha(input.fecha),
    };

    await db.gastos.add(gasto);
    return gasto;
  }

  async update(gasto: Gasto): Promise<Gasto> {
    const actualizado: Gasto = {
      ...gasto,
      mes: mesFromFecha(gasto.fecha),
    };

    await db.gastos.put(actualizado);
    return actualizado;
  }

  async delete(id: string): Promise<void> {
    await db.gastos.delete(id);
  }
}
