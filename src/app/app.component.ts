import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

import { NetworkStatusService } from './services/network-status.service';
import { PwaInstallService } from './services/pwa-install.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly networkStatus = inject(NetworkStatusService);
  readonly pwaInstall = inject(PwaInstallService);
  private readonly swUpdate = inject(SwUpdate);

  updateAvailable = false;

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
        .subscribe(() => {
          this.updateAvailable = true;
        });
    }
  }

  async installApp(): Promise<void> {
    await this.pwaInstall.install();
  }

  dismissInstall(): void {
    this.pwaInstall.dismiss();
  }

  applyUpdate(): void {
    void this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }
}
