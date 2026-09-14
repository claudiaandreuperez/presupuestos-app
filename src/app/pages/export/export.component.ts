import { Component } from '@angular/core';

import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { ExportService } from '../../services/export.service';
import { canShareFiles } from '../../utils/file-share.util';
import { mesActual } from '../../utils/mes.util';

type ExportScope = 'all' | 'month';

@Component({
  selector: 'app-export',
  imports: [MonthPickerComponent],
  templateUrl: './export.component.html',
  styleUrl: './export.component.css',
})
export class ExportComponent {
  readonly canShare = canShareFiles();

  mes = mesActual();
  detalleScope: ExportScope = 'all';
  busyAction = '';
  statusMessage = '';
  errorMessage = '';
  showShortcutGuide = false;

  constructor(private readonly exportService: ExportService) {}

  onDetalleScopeChange(scope: ExportScope): void {
    this.detalleScope = scope;
    this.clearMessages();
  }

  onMesChange(mes: string): void {
    this.mes = mes;
    this.clearMessages();
  }

  toggleShortcutGuide(): void {
    this.showShortcutGuide = !this.showShortcutGuide;
  }

  async downloadDetalle(): Promise<void> {
    await this.runAction('detalle-download', async () => {
      await this.exportService.downloadGastosDetalle(this.detalleMesFilter);
      this.statusMessage = 'CSV de detall descarregat.';
    });
  }

  async shareDetalle(): Promise<void> {
    await this.runAction('detalle-share', async () => {
      const result = await this.exportService.shareGastosDetalle(this.detalleMesFilter);
      this.statusMessage =
        result === 'shared'
          ? 'CSV de detall compartit. Tria el teu drecera d\'iCloud a Numbers.'
          : 'Compartir no disponible. S\'ha descarregat el fitxer.';
    });
  }

  async downloadResumen(): Promise<void> {
    await this.runAction('resumen-download', async () => {
      await this.exportService.downloadResumenMensual();
      this.statusMessage = 'CSV resum mensual descarregat.';
    });
  }

  async shareResumen(): Promise<void> {
    await this.runAction('resumen-share', async () => {
      const result = await this.exportService.shareResumenMensual();
      this.statusMessage =
        result === 'shared'
          ? 'CSV resum compartit.'
          : 'Compartir no disponible. S\'ha descarregat el fitxer.';
    });
  }

  async downloadBackup(): Promise<void> {
    await this.runAction('backup-download', async () => {
      await this.exportService.downloadBackup();
      this.statusMessage = 'Còpia de seguretat JSON descarregada.';
    });
  }

  async shareBackup(): Promise<void> {
    await this.runAction('backup-share', async () => {
      const result = await this.exportService.shareBackup();
      this.statusMessage =
        result === 'shared'
          ? 'Còpia de seguretat compartida.'
          : 'Compartir no disponible. S\'ha descarregat el fitxer.';
    });
  }

  async onImportFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    await this.runAction('import', async () => {
      const raw = JSON.parse(await file.text()) as unknown;
      const result = await this.exportService.importBackup(raw);
      this.statusMessage = `Backup restaurat: ${result.gastos} gastos i ${result.presupuestos} pressupostos.`;
    });
  }

  isBusy(action: string): boolean {
    return this.busyAction === action;
  }

  isAnyBusy(): boolean {
    return this.busyAction !== '';
  }

  private get detalleMesFilter(): string | null {
    return this.detalleScope === 'month' ? this.mes : null;
  }

  private async runAction(action: string, fn: () => Promise<void>): Promise<void> {
    this.clearMessages();
    this.busyAction = action;

    try {
      await fn();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      this.errorMessage =
        error instanceof Error
          ? error.message
          : 'No s\'ha pogut completar l\'operació. Torna-ho a provar.';
    } finally {
      this.busyAction = '';
    }
  }

  private clearMessages(): void {
    this.statusMessage = '';
    this.errorMessage = '';
  }
}
