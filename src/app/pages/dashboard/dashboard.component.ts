import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CategoryCardComponent } from '../../components/category-card/category-card.component';
import { ExpenseFormComponent } from '../../components/expense-form/expense-form.component';
import { MonthPickerComponent } from '../../components/month-picker/month-picker.component';
import { getCategoriaInfo } from '../../models/categoria.model';
import { ResumenCategoria } from '../../models/resumen.model';
import { ResumenService } from '../../services/resumen.service';
import { focusFirstInDialog, trapDialogFocus } from '../../utils/dialog-a11y.util';
import { mesActual } from '../../utils/mes.util';

@Component({
  selector: 'app-dashboard',
  imports: [MonthPickerComponent, CategoryCardComponent, ExpenseFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  @ViewChild('addDialog') addDialogRef!: ElementRef<HTMLDialogElement>;
  @ViewChild('fabButton') fabButtonRef!: ElementRef<HTMLButtonElement>;

  mes = mesActual();
  resumens: ResumenCategoria[] = [];
  loading = true;
  statusMessage = '';

  constructor(private readonly resumenService: ResumenService) {}

  ngOnInit(): void {
    void this.loadResumen();
  }

  async onMesChange(mes: string): Promise<void> {
    this.mes = mes;
    await this.loadResumen();
  }

  openAddDialog(): void {
    const dialog = this.addDialogRef.nativeElement;
    dialog.showModal();
    focusFirstInDialog(dialog);
  }

  closeAddDialog(): void {
    this.addDialogRef.nativeElement.close();
    this.fabButtonRef.nativeElement.focus();
  }

  onDialogKeydown(event: KeyboardEvent): void {
    trapDialogFocus(this.addDialogRef.nativeElement, event);
  }

  async onExpenseSaved(): Promise<void> {
    await this.loadResumen();
    this.statusMessage = 'Despesa guardada correctament.';
    this.closeAddDialog();
  }

  getCategoriaColor(resumen: ResumenCategoria): string {
    return getCategoriaInfo(resumen.categoria).color;
  }

  private async loadResumen(): Promise<void> {
    this.loading = true;

    try {
      this.resumens = await this.resumenService.getResumenMes(this.mes);
    } finally {
      this.loading = false;
    }
  }
}
