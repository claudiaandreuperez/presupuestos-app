import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { CATEGORIAS, Categoria, getCategoriaInfo } from '../../models/categoria.model';
import { PresupuestoService } from '../../services/presupuesto.service';
import { formatMesLabel, mesActual, mesAnterior } from '../../utils/mes.util';

interface PresupuestoEditable {
  categoria: Categoria;
  limite: number | null;
}

@Component({
  selector: 'app-presupuestos',
  imports: [MonthPickerComponent, FormsModule, CurrencyPipe],
  templateUrl: './presupuestos.component.html',
  styleUrl: './presupuestos.component.css',
})
export class PresupuestosComponent implements OnInit {
  readonly categorias = CATEGORIAS;
  readonly getCategoriaInfo = getCategoriaInfo;

  mes = mesActual();
  presupuestos: PresupuestoEditable[] = [];
  loading = true;
  saving = false;
  copying = false;
  statusMessage = '';
  errorMessage = '';

  constructor(private readonly presupuestoService: PresupuestoService) {}

  ngOnInit(): void {
    void this.loadPresupuestos();
  }

  async onMesChange(mes: string): Promise<void> {
    this.mes = mes;
    await this.loadPresupuestos();
  }

  async saveAll(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';

    const invalid = this.presupuestos.find(
      (p) => p.limite === null || p.limite < 0,
    );

    if (invalid) {
      this.errorMessage = 'Tots els límits han de ser zero o superiors.';
      return;
    }

    this.saving = true;

    try {
      await this.presupuestoService.setMany(
        this.presupuestos.map((p) => ({
          categoria: p.categoria,
          mes: this.mes,
          limite: p.limite ?? 0,
        })),
      );
      this.statusMessage = 'Pressupostos guardats correctament.';
    } catch {
      this.errorMessage = 'No s\'han pogut guardar els pressupostos. Torna-ho a provar.';
    } finally {
      this.saving = false;
    }
  }

  async copyFromPrevious(): Promise<void> {
    this.errorMessage = '';
    this.statusMessage = '';
    this.copying = true;

    try {
      const count = await this.presupuestoService.copyFromPreviousMes(this.mes);

      if (count === 0) {
        this.errorMessage = `No hi ha pressupostos al mes anterior (${formatMesLabel(mesAnterior(this.mes))}).`;
      } else {
        await this.loadPresupuestos();
        this.statusMessage = `S'han copiat ${count} pressupostos del mes anterior.`;
      }
    } catch {
      this.errorMessage = 'No s\'han pogut copiar els pressupostos. Torna-ho a provar.';
    } finally {
      this.copying = false;
    }
  }

  get totalPresupuesto(): number {
    return this.presupuestos.reduce((sum, p) => sum + (p.limite ?? 0), 0);
  }

  private async loadPresupuestos(): Promise<void> {
    this.loading = true;

    try {
      await this.presupuestoService.ensureAllCategories(this.mes);
      const map = await this.presupuestoService.getMapByMes(this.mes);

      this.presupuestos = CATEGORIAS.map((cat) => ({
        categoria: cat.id,
        limite: map.get(cat.id)?.limite ?? 0,
      }));
    } finally {
      this.loading = false;
    }
  }
}
