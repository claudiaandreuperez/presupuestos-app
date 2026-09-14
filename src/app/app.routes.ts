import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ExportComponent } from './pages/export/export.component';
import { GraficosComponent } from './pages/graficos/graficos.component';
import { HistorialComponent } from './pages/historial/historial.component';
import { PresupuestosComponent } from './pages/presupuestos/presupuestos.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'historial', component: HistorialComponent },
  { path: 'presupuestos', component: PresupuestosComponent },
  { path: 'graficos', component: GraficosComponent },
  { path: 'exportar', component: ExportComponent },
  { path: '**', redirectTo: '' },
];
