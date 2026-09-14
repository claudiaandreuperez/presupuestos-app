import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { CATEGORIAS, Categoria, getCategoriaInfo } from '../../models/categoria.model';
import { DadesEvolucioMes } from '../../models/graficos.model';
import { ResumenCategoria } from '../../models/resumen.model';
import { GraficosService } from '../../services/graficos.service';
import { formatMesShortLabel, mesActual } from '../../utils/mes.util';

@Component({
  selector: 'app-graficos',
  imports: [MonthPickerComponent, BaseChartDirective, FormsModule, CurrencyPipe],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.css',
})
export class GraficosComponent implements OnInit {
  readonly categorias = CATEGORIAS;
  readonly getCategoriaInfo = getCategoriaInfo;

  mes = mesActual();
  categoriaEvolucio = Categoria.Comida;
  loadingComparativa = true;
  loadingEvolucio = true;
  resumens: ResumenCategoria[] = [];
  evolucio: DadesEvolucioMes[] = [];

  comparativaOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => this.formatTooltipValue(context.parsed.x),
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value) => this.formatAxisValue(value),
        },
      },
    },
  };

  evolucioOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${this.formatTooltipValue(context.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => this.formatAxisValue(value),
        },
      },
    },
  };

  comparativaData: ChartData<'bar'> = { labels: [], datasets: [] };
  evolucioData: ChartData<'line'> = { labels: [], datasets: [] };

  constructor(private readonly graficosService: GraficosService) {}

  ngOnInit(): void {
    void this.loadCharts();
  }

  async onMesChange(mes: string): Promise<void> {
    this.mes = mes;
    await this.loadCharts();
  }

  async onCategoriaChange(categoria: Categoria): Promise<void> {
    this.categoriaEvolucio = categoria;
    await this.loadEvolucio();
  }

  get resumensActius(): ResumenCategoria[] {
    return this.resumens.filter((resumen) => resumen.gastado > 0 || resumen.limite > 0);
  }

  get categoriaEvolucioLabel(): string {
    return getCategoriaInfo(this.categoriaEvolucio).label;
  }

  get evolucioBuida(): boolean {
    return this.evolucio.every((item) => item.gastado === 0 && item.limite === 0);
  }

  private async loadCharts(): Promise<void> {
    await Promise.all([this.loadComparativa(), this.loadEvolucio()]);
  }

  private async loadComparativa(): Promise<void> {
    this.loadingComparativa = true;

    try {
      this.resumens = await this.graficosService.getComparativaMes(this.mes);
      this.comparativaData = this.buildComparativaData(this.resumensActius);
    } finally {
      this.loadingComparativa = false;
    }
  }

  private async loadEvolucio(): Promise<void> {
    this.loadingEvolucio = true;

    try {
      this.evolucio = await this.graficosService.getEvolucionCategoria(
        this.categoriaEvolucio,
        this.mes,
      );
      this.evolucioData = this.buildEvolucioData(this.evolucio);
    } finally {
      this.loadingEvolucio = false;
    }
  }

  private buildComparativaData(resumens: ResumenCategoria[]): ChartData<'bar'> {
    return {
      labels: resumens.map((resumen) => getCategoriaInfo(resumen.categoria).label),
      datasets: [
        {
          label: 'Despeses',
          data: resumens.map((resumen) => resumen.gastado),
          backgroundColor: resumens.map(
            (resumen) => getCategoriaInfo(resumen.categoria).color,
          ),
          borderRadius: 4,
        },
        {
          label: 'Pressupost',
          data: resumens.map((resumen) => resumen.limite),
          backgroundColor: 'rgba(26, 95, 60, 0.25)',
          borderColor: '#1a5f3c',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }

  private buildEvolucioData(dades: DadesEvolucioMes[]): ChartData<'line'> {
    const categoriaColor = getCategoriaInfo(this.categoriaEvolucio).color;

    return {
      labels: dades.map((item) => formatMesShortLabel(item.mes)),
      datasets: [
        {
          label: 'Despeses',
          data: dades.map((item) => item.gastado),
          borderColor: categoriaColor,
          backgroundColor: `${categoriaColor}33`,
          tension: 0.25,
          fill: true,
        },
        {
          label: 'Pressupost',
          data: dades.map((item) => item.limite),
          borderColor: '#1a5f3c',
          backgroundColor: 'transparent',
          borderDash: [6, 4],
          tension: 0.25,
        },
      ],
    };
  }

  private formatAxisValue(value: string | number): string {
    const amount = typeof value === 'number' ? value : Number(value);
    return new Intl.NumberFormat('ca', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private formatTooltipValue(value: number | null): string {
    const amount = value ?? 0;
    return new Intl.NumberFormat('ca', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}
