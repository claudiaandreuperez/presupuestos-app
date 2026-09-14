import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { ExpenseFormComponent } from '../../components/expense-form/expense-form.component';
import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { CATEGORIAS, Categoria, getCategoriaInfo } from '../../models/categoria.model';
import { Gasto } from '../../models/gasto.model';
import { GastoService } from '../../services/gasto.service';
import { focusFirstInDialog, trapDialogFocus } from '../../utils/dialog-a11y.util';
import { formatFechaLabel, mesActual } from '../../utils/mes.util';

type CategoriaFilter = Categoria | 'TOTES';

@Component({
  selector: 'app-historial',
  imports: [MonthPickerComponent, ExpenseFormComponent, CurrencyPipe],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css',
})
export class HistorialComponent implements OnInit {
  @ViewChild('editDialog') editDialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('deleteDialog') deleteDialogRef!: ElementRef<HTMLDialogElement>;

  readonly categorias = CATEGORIAS;
  readonly formatFechaLabel = formatFechaLabel;
  readonly getCategoriaInfo = getCategoriaInfo;

  mes = mesActual();
  filtroCategoria: CategoriaFilter = 'TOTES';
  gastos: Gasto[] = [];
  loading = true;
  statusMessage = '';
  editingGasto?: Gasto;
  deletingGasto?: Gasto;
  deleting = false;
  private editTriggerButton?: HTMLButtonElement;

  constructor(private readonly gastoService: GastoService) {}

  ngOnInit(): void {
    void this.loadGastos();
  }

  async onMesChange(mes: string): Promise<void> {
    this.mes = mes;
    await this.loadGastos();
  }

  onFiltroChange(categoria: CategoriaFilter): void {
    this.filtroCategoria = categoria;
  }

  get gastosFiltrados(): Gasto[] {
    if (this.filtroCategoria === 'TOTES') {
      return [...this.gastos].reverse();
    }

    return [...this.gastos]
      .filter((g) => g.categoria === this.filtroCategoria)
      .reverse();
  }

  openEditDialog(gasto: Gasto, event: Event): void {
    this.editingGasto = { ...gasto };
    this.editTriggerButton = event.currentTarget instanceof HTMLButtonElement
      ? event.currentTarget
      : undefined;
    const dialog = this.editDialogRef.nativeElement;
    dialog.showModal();
    focusFirstInDialog(dialog);
  }

  closeEditDialog(): void {
    this.editDialogRef.nativeElement.close();
    this.editingGasto = undefined;
    this.editTriggerButton?.focus();
    this.editTriggerButton = undefined;
  }

  onEditDialogKeydown(event: KeyboardEvent): void {
    trapDialogFocus(this.editDialogRef.nativeElement, event);
  }

  async onExpenseUpdated(): Promise<void> {
    await this.loadGastos();
    this.statusMessage = 'Despesa actualitzada correctament.';
    this.closeEditDialog();
  }

  openDeleteDialog(gasto: Gasto, event: Event): void {
    this.deletingGasto = gasto;
    this.editTriggerButton = event.currentTarget instanceof HTMLButtonElement
      ? event.currentTarget
      : undefined;
    const dialog = this.deleteDialogRef.nativeElement;
    dialog.showModal();
    focusFirstInDialog(dialog);
  }

  closeDeleteDialog(): void {
    this.deleteDialogRef.nativeElement.close();
    this.deletingGasto = undefined;
    this.editTriggerButton?.focus();
    this.editTriggerButton = undefined;
  }

  onDeleteDialogKeydown(event: KeyboardEvent): void {
    trapDialogFocus(this.deleteDialogRef.nativeElement, event);
  }

  async confirmDelete(): Promise<void> {
    if (!this.deletingGasto) {
      return;
    }

    this.deleting = true;

    try {
      await this.gastoService.delete(this.deletingGasto.id);
      await this.loadGastos();
      this.statusMessage = 'Despesa eliminada correctament.';
      this.closeDeleteDialog();
    } catch {
      this.statusMessage = 'No s\'ha pogut eliminar la despesa. Torna-ho a provar.';
    } finally {
      this.deleting = false;
    }
  }

  private async loadGastos(): Promise<void> {
    this.loading = true;

    try {
      this.gastos = await this.gastoService.getByMes(this.mes);
    } finally {
      this.loading = false;
    }
  }
}
