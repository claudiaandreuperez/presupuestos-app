import { Injectable } from '@angular/core';

import { BACKUP_VERSION, BackupData } from '../models/backup.model';
import { CATEGORIAS, Categoria, isCategoria } from '../models/categoria.model';
import { Gasto } from '../models/gasto.model';
import { Presupuesto } from '../models/presupuesto.model';
import { toCsvRow } from '../utils/csv.util';
import { downloadBlob, downloadOrShare, ShareResult } from '../utils/file-share.util';
import { mesFromFecha } from '../utils/mes.util';
import { GastoService } from './gasto.service';
import { PresupuestoService } from './presupuesto.service';
import { db } from './presupuestos.database';

export interface ImportBackupResult {
  gastos: number;
  presupuestos: number;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  constructor(
    private readonly gastoService: GastoService,
    private readonly presupuestoService: PresupuestoService,
  ) {}

  async buildGastosDetalleCsv(mes?: string): Promise<string> {
    const gastos = await this.gastoService.getAll();
    const filtered = mes ? gastos.filter((g) => g.mes === mes) : gastos;
    const sorted = [...filtered].sort((a, b) => a.fecha.localeCompare(b.fecha));

    const rows = [
      toCsvRow(['fecha', 'categoria', 'importe', 'nota', 'mes']),
      ...sorted.map((g) =>
        toCsvRow([g.fecha, g.categoria, g.importe, g.nota ?? '', g.mes]),
      ),
    ];

    return rows.join('\n');
  }

  async buildResumenMensualCsv(): Promise<string> {
    const [gastos, presupuestos] = await Promise.all([
      this.gastoService.getAll(),
      this.presupuestoService.getAll(),
    ]);

    const meses = this.collectMeses(gastos, presupuestos);
    const totales = this.buildTotalesMatrix(gastos, meses);

    const header = toCsvRow(['categoria', ...meses]);
    const rows = CATEGORIAS.map((cat) => {
      const values = meses.map((mes) => totales.get(cat.id)?.get(mes) ?? 0);
      return toCsvRow([cat.id, ...values]);
    });

    return [header, ...rows].join('\n');
  }

  async buildBackupJson(): Promise<string> {
    const backup = await this.createBackup();
    return JSON.stringify(backup, null, 2);
  }

  async createBackup(): Promise<BackupData> {
    const [gastos, presupuestos] = await Promise.all([
      this.gastoService.getAll(),
      this.presupuestoService.getAll(),
    ]);

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      gastos,
      presupuestos,
    };
  }

  async downloadGastosDetalle(mes: string | null): Promise<void> {
    const csv = await this.buildGastosDetalleCsv(mes ?? undefined);
    const suffix = mes ?? 'tots';
    downloadBlob(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
      `gastos_detalle_${suffix}.csv`,
    );
  }

  async shareGastosDetalle(mes: string | null): Promise<ShareResult> {
    const csv = await this.buildGastosDetalleCsv(mes ?? undefined);
    const suffix = mes ?? 'tots';
    return downloadOrShare(csv, `gastos_detalle_${suffix}.csv`, 'text/csv;charset=utf-8');
  }

  async downloadResumenMensual(): Promise<void> {
    const csv = await this.buildResumenMensualCsv();
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), 'resumen_mensual.csv');
  }

  async shareResumenMensual(): Promise<ShareResult> {
    const csv = await this.buildResumenMensualCsv();
    return downloadOrShare(csv, 'resumen_mensual.csv', 'text/csv;charset=utf-8');
  }

  async downloadBackup(): Promise<void> {
    const json = await this.buildBackupJson();
    const date = new Date().toISOString().slice(0, 10);
    downloadBlob(new Blob([json], { type: 'application/json' }), `presupuestos_backup_${date}.json`);
  }

  async shareBackup(): Promise<ShareResult> {
    const json = await this.buildBackupJson();
    const date = new Date().toISOString().slice(0, 10);
    return downloadOrShare(json, `presupuestos_backup_${date}.json`, 'application/json');
  }

  async importBackup(raw: unknown): Promise<ImportBackupResult> {
    const backup = this.parseBackup(raw);

    await db.transaction('rw', db.gastos, db.presupuestos, async () => {
      await db.gastos.clear();
      await db.presupuestos.clear();
      await db.gastos.bulkAdd(backup.gastos);
      await db.presupuestos.bulkPut(backup.presupuestos);
    });

    return {
      gastos: backup.gastos.length,
      presupuestos: backup.presupuestos.length,
    };
  }

  private collectMeses(gastos: Gasto[], presupuestos: Presupuesto[]): string[] {
    const meses = new Set<string>();

    for (const gasto of gastos) {
      meses.add(gasto.mes);
    }

    for (const presupuesto of presupuestos) {
      meses.add(presupuesto.mes);
    }

    return [...meses].sort();
  }

  private buildTotalesMatrix(
    gastos: Gasto[],
    meses: string[],
  ): Map<Categoria, Map<string, number>> {
    const matrix = new Map<Categoria, Map<string, number>>();

    for (const cat of CATEGORIAS) {
      matrix.set(cat.id, new Map(meses.map((mes) => [mes, 0])));
    }

    for (const gasto of gastos) {
      const byMes = matrix.get(gasto.categoria);
      if (byMes?.has(gasto.mes)) {
        byMes.set(gasto.mes, (byMes.get(gasto.mes) ?? 0) + gasto.importe);
      }
    }

    return matrix;
  }

  private parseBackup(raw: unknown): BackupData {
    if (!raw || typeof raw !== 'object') {
      throw new Error('El fitxer no conté un backup vàlid.');
    }

    const data = raw as Partial<BackupData>;

    if (data.version !== BACKUP_VERSION) {
      throw new Error('Versió de backup no compatible.');
    }

    if (!Array.isArray(data.gastos) || !Array.isArray(data.presupuestos)) {
      throw new Error('El backup no conté les dades esperades.');
    }

    const gastos = data.gastos.map((g, index) => this.parseGasto(g, index));
    const presupuestos = data.presupuestos.map((p, index) =>
      this.parsePresupuesto(p, index),
    );

    return {
      version: BACKUP_VERSION,
      exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : new Date().toISOString(),
      gastos,
      presupuestos,
    };
  }

  private parseGasto(raw: unknown, index: number): Gasto {
    if (!raw || typeof raw !== 'object') {
      throw new Error(`Gast invàlid a la posició ${index + 1}.`);
    }

    const g = raw as Partial<Gasto>;

    if (typeof g.id !== 'string' || !g.id) {
      throw new Error(`Gast ${index + 1}: falta l'identificador.`);
    }

    if (typeof g.fecha !== 'string' || !g.fecha) {
      throw new Error(`Gast ${index + 1}: data invàlida.`);
    }

    if (typeof g.categoria !== 'string' || !isCategoria(g.categoria)) {
      throw new Error(`Gast ${index + 1}: categoria desconeguda.`);
    }

    if (typeof g.importe !== 'number' || g.importe < 0) {
      throw new Error(`Gast ${index + 1}: import invàlid.`);
    }

    const mes = typeof g.mes === 'string' && g.mes ? g.mes : mesFromFecha(g.fecha);

    return {
      id: g.id,
      fecha: g.fecha,
      categoria: g.categoria,
      importe: g.importe,
      nota: typeof g.nota === 'string' ? g.nota : undefined,
      mes,
    };
  }

  private parsePresupuesto(raw: unknown, index: number): Presupuesto {
    if (!raw || typeof raw !== 'object') {
      throw new Error(`Pressupost invàlid a la posició ${index + 1}.`);
    }

    const p = raw as Partial<Presupuesto>;

    if (typeof p.categoria !== 'string' || !isCategoria(p.categoria)) {
      throw new Error(`Pressupost ${index + 1}: categoria desconeguda.`);
    }

    if (typeof p.mes !== 'string' || !p.mes) {
      throw new Error(`Pressupost ${index + 1}: mes invàlid.`);
    }

    if (typeof p.limite !== 'number' || p.limite < 0) {
      throw new Error(`Pressupost ${index + 1}: límit invàlid.`);
    }

    return {
      categoria: p.categoria,
      mes: p.mes,
      limite: p.limite,
    };
  }
}
