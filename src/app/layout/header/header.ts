import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

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

  readonly title = input<string>('Personal Finance Dashboard');
  readonly onLoginClick = output<void>();
  readonly onSignUpClick = output<void>();

  onLogin(): void {
    this.onLoginClick.emit();
    this.router.navigate(['/login']);
  }

  onSignUp(): void {
    this.onSignUpClick.emit();
    this.router.navigate(['/sign-up']);
  }
}
