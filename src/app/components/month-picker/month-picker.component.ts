import { Component, EventEmitter, Input, Output } from '@angular/core';

import { formatMesLabel, mesActual, mesAnterior, mesSiguiente } from '../../utils/mes.util';

@Component({
  selector: 'app-month-picker',
  templateUrl: './month-picker.component.html',
  styleUrl: './month-picker.component.css',
})
export class MonthPickerComponent {
  @Input({ required: true }) mes!: string;
  @Output() mesChange = new EventEmitter<string>();

  get mesLabel(): string {
    return formatMesLabel(this.mes);
  }

  get isMesActual(): boolean {
    return this.mes === mesActual();
  }

  mesAnterior(): void {
    this.mesChange.emit(mesAnterior(this.mes));
  }

  mesSiguiente(): void {
    if (this.isMesActual) {
      return;
    }
    this.mesChange.emit(mesSiguiente(this.mes));
  }

  irMesActual(): void {
    this.mesChange.emit(mesActual());
  }
}
