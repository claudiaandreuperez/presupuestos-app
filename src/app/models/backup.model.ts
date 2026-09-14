import { Gasto } from './gasto.model';
import { Presupuesto } from './presupuesto.model';

export const BACKUP_VERSION = 1;

export interface BackupData {
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  gastos: Gasto[];
  presupuestos: Presupuesto[];
}
