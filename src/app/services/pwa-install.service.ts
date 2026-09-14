import { Injectable, computed, signal } from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'presupuestos-install-dismissed';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  readonly canNativeInstall = signal(false);
  readonly isStandalone = signal(this.detectStandalone());
  readonly isIosSafari = signal(this.detectIosSafari());
  readonly dismissed = signal(this.readDismissed());

  readonly showInstallBanner = computed(
    () =>
      !this.isStandalone() &&
      !this.dismissed() &&
      (this.canNativeInstall() || this.isIosSafari()),
  );

  readonly installMode = computed<'native' | 'ios' | null>(() => {
    if (this.isStandalone() || this.dismissed()) {
      return null;
    }
    if (this.canNativeInstall()) {
      return 'native';
    }
    if (this.isIosSafari()) {
      return 'ios';
    }
    return null;
  });

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.canNativeInstall.set(true);
    });

    window.matchMedia('(display-mode: standalone)').addEventListener('change', (event) => {
      this.isStandalone.set(event.matches);
    });
  }

  async install(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    await this.deferredPrompt.prompt();
    const choice = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canNativeInstall.set(false);

    if (choice.outcome === 'accepted') {
      this.dismiss();
      return true;
    }

    return false;
  }

  dismiss(): void {
    this.dismissed.set(true);
    localStorage.setItem(DISMISS_KEY, '1');
  }

  private readDismissed(): boolean {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  }

  private detectStandalone(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }

    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }

  private detectIosSafari(): boolean {
    if (typeof navigator === 'undefined') {
      return false;
    }

    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);

    return isIos && isSafari;
  }
}
