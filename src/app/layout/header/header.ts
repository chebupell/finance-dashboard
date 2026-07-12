import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Locale } from '../../services/locale';
import { Theme } from '../../services/theme';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  readonly locale = inject(Locale);
  readonly theme = inject(Theme);

  readonly title = input<string>('');
  readonly onLoginClick = output<void>();
  readonly onSignUpClick = output<void>();

  readonly isLoggedIn = computed(() => this.auth.isLoggedIn());

  t(key: Parameters<Locale['t']>[0]): string {
    return this.locale.t(key);
  }

  displayTitle(): string {
    return this.title() || this.locale.t('app.title');
  }

  onLogin(): void {
    this.onLoginClick.emit();
    this.router.navigate(['/login']);
  }

  onSignUp(): void {
    this.onSignUpClick.emit();
    this.router.navigate(['/sign-up']);
  }

  onLogout(): void {
    this.auth.logout();
  }

  toggleTheme(event: Event): void {
    event.stopPropagation();
    this.theme.toggle();
  }

  themeToggleLabel(): string {
    return this.theme.mode() === 'light'
      ? this.locale.t('header.themeToDark')
      : this.locale.t('header.themeToLight');
  }
}
