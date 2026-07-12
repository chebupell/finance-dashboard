import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { Auth } from '../../services/auth';
import { Locale } from '../../services/locale';

export type SidebarNav = 'dashboard' | 'transactions' | 'goals' | 'settings';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  readonly auth = inject(Auth);
  readonly locale = inject(Locale);
  readonly activeNav = input<SidebarNav>('dashboard');
  readonly navChange = output<SidebarNav>();

  onNavClick(event: Event, nav: SidebarNav): void {
    event.preventDefault();
    this.navChange.emit(nav);
  }

  t(key: Parameters<Locale['t']>[0]): string {
    return this.locale.t(key);
  }
}
