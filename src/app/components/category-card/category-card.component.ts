import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

import { getCategoriaInfo } from '../../models/categoria.model';
import { ResumenCategoria } from '../../models/resumen.model';

type ProgressState = 'ok' | 'warning' | 'danger';

@Component({
  selector: 'app-category-card',
  imports: [CurrencyPipe],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.css',
})
export class CategoryCardComponent {
  @Input({ required: true }) resumen!: ResumenCategoria;

  get info() {
    return getCategoriaInfo(this.resumen.categoria);
  }

  get progressState(): ProgressState {
    if (this.resumen.limite <= 0) {
      return this.resumen.gastado > 0 ? 'warning' : 'ok';
    }
    if (this.resumen.restante < 0) {
      return 'danger';
    }
    if (this.resumen.porcentaje >= 90) {
      return 'danger';
    }
    if (this.resumen.porcentaje >= 70) {
      return 'warning';
    }
    return 'ok';
  }

  get progressLabel(): string {
    const gastado = this.resumen.gastado.toLocaleString('ca-ES', {
      style: 'currency',
      currency: 'EUR',
    });
    const limite = this.resumen.limite.toLocaleString('ca-ES', {
      style: 'currency',
      currency: 'EUR',
    });

    if (this.resumen.limite <= 0) {
      return `${this.info.label}: ${gastado} gastats, sense pressupost definit`;
    }

    return `${this.info.label}: ${gastado} de ${limite}, ${Math.round(this.resumen.porcentaje)}% consumit`;
  }
}
