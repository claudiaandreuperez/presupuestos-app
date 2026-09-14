import Dexie, { Table } from 'dexie';

import { Gasto } from '../models/gasto.model';
import { Presupuesto } from '../models/presupuesto.model';

export class PresupuestosDatabase extends Dexie {
  gastos!: Table<Gasto, string>;
  presupuestos!: Table<Presupuesto, [string, string]>;

  constructor() {
    super('PresupuestosDB');

    this.version(1).stores({
      gastos: 'id, fecha, categoria, mes, [mes+categoria]',
      presupuestos: '[categoria+mes], mes, categoria',
    });
  }
}

export const db = new PresupuestosDatabase();
