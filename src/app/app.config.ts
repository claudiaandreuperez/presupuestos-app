import { registerLocaleData } from '@angular/common';
import localeCa from '@angular/common/locales/ca';
import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';

registerLocaleData(localeCa);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'ca' },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
