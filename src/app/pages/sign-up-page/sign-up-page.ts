import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sign-up-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  readonly signUpForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    enableAutoLogin: [false],
    agreeToTerms: [false, [Validators.requiredTrue]],
  });

  readonly isSubmitting = signal(false);
  readonly passwordsMatch = signal(true);

  onSubmit(): void {
    if (!this.signUpForm.valid) {
      return;
    }

    this.validatePasswords();

    if (!this.passwordsMatch()) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.signUpForm.getRawValue();

    this.auth.loginUser(formValue);

    // TODO: Call AuthService to register user
    // this.authService.signUp(formValue).subscribe({
    //   next: () => this.router.navigate(['/home']),
    //   error: (err) => this.isSubmitting.set(false),
    // });

    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);
  }

  onGoogleSignUp(): void {
    console.log('Google sign up');
    // TODO: Implement Google OAuth
  }

  onFacebookSignUp(): void {
    console.log('Facebook sign up');
    // TODO: Implement Facebook OAuth
  }

  private validatePasswords(): void {
    const password = this.signUpForm.get('password')?.value;
    const confirmPassword = this.signUpForm.get('confirmPassword')?.value;
    this.passwordsMatch.set(password === confirmPassword);
  }

  get fullNameError(): string {
    const control = this.signUpForm.get('fullName');
    if (control?.hasError('required')) {
      return 'Full name is required';
    }
    return '';
  }

  get emailError(): string {
    const control = this.signUpForm.get('email');
    if (control?.hasError('required')) {
      return 'Email is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  get passwordError(): string {
    const control = this.signUpForm.get('password');
    if (control?.hasError('required')) {
      return 'Password is required';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    return '';
  }
}
