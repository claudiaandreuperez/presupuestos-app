import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CATEGORIAS, Categoria } from '../../models/categoria.model';
import { Gasto } from '../../models/gasto.model';
import { GastoService } from '../../services/gasto.service';
import { fechaHoy } from '../../utils/mes.util';

@Component({
  selector: 'app-expense-form',
  imports: [FormsModule],
  templateUrl: './expense-form.component.html',
  styleUrl: './expense-form.component.css',
})
export class ExpenseFormComponent implements OnChanges {
  @Input() mes = '';
  @Input() gasto?: Gasto;
  @Output() saved = new EventEmitter<void>();

  readonly categorias = CATEGORIAS;

  importe: number | null = null;
  categoria: Categoria = Categoria.Comida;
  nota = '';
  fecha = fechaHoy();
  saving = false;
  errorMessage = '';

  constructor(private readonly gastoService: GastoService) {}

  get isEditing(): boolean {
    return this.gasto !== undefined;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gasto']) {
      this.populateFromGasto();
    }
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (this.importe === null || this.importe <= 0) {
      this.errorMessage = 'Introdueix un import vàlid superior a zero.';
      return;
    }

    this.saving = true;

    try {
      if (this.isEditing && this.gasto) {
        await this.gastoService.update({
          ...this.gasto,
          fecha: this.fecha,
          categoria: this.categoria,
          importe: this.importe,
          nota: this.nota.trim() || undefined,
        });
      } else {
        await this.gastoService.create({
          fecha: this.fecha,
          categoria: this.categoria,
          importe: this.importe,
          nota: this.nota.trim() || undefined,
        });

        this.importe = null;
        this.nota = '';
        this.fecha = fechaHoy();
      }

      this.saved.emit();
    } catch {
      this.errorMessage = this.isEditing
        ? 'No s\'ha pogut actualitzar la despesa. Torna-ho a provar.'
        : 'No s\'ha pogut guardar la despesa. Torna-ho a provar.';
    } finally {
      this.saving = false;
    }
  }

  selectCategoria(categoria: Categoria): void {
    this.categoria = categoria;
  }

  private populateFromGasto(): void {
    if (!this.gasto) {
      return;
    }

    this.importe = this.gasto.importe;
    this.categoria = this.gasto.categoria;
    this.nota = this.gasto.nota ?? '';
    this.fecha = this.gasto.fecha;
  }
}
