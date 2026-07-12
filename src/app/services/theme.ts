import { effect, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly storageKey = 'finance-dashboard-theme';

  readonly mode = signal<ThemeMode>(this.readStoredMode());

  constructor() {
    effect(() => {
      const mode = this.mode();
      document.documentElement.setAttribute('data-theme', mode);
      localStorage.setItem(this.storageKey, mode);
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  toggle(): void {
    this.mode.set(this.mode() === 'light' ? 'dark' : 'light');
  }

  private readStoredMode(): ThemeMode {
    const stored = localStorage.getItem(this.storageKey);
    return stored === 'dark' ? 'dark' : 'light';
  }
}
