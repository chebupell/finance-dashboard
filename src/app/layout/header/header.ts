import { Component, ChangeDetectionStrategy, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);

  readonly title = input<string>('Personal Finance Dashboard');
  readonly onLoginClick = output<void>();
  readonly onSignUpClick = output<void>();

  readonly isLoggedIn = computed(() => this.auth.isLoggedIn());

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
}
