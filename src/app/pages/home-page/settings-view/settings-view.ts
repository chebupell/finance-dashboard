import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../services/auth';
import { Locale, AppLocale } from '../../../services/locale';
import { Theme, ThemeMode } from '../../../services/theme';
import { UserService } from '../../../services/user';

@Component({
  selector: 'app-settings-view',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './settings-view.html',
  styleUrl: './settings-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsView {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly userService = inject(UserService);
  readonly locale = inject(Locale);
  readonly theme = inject(Theme);

  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly isSavingProfile = signal(false);
  readonly isSavingEmail = signal(false);
  readonly isSavingPassword = signal(false);
  readonly avatarPreview = signal(this.auth.avatarUrl());

  readonly profileForm = this.fb.nonNullable.group({
    name: [this.auth.getUserData()?.name ?? '', [Validators.required, Validators.minLength(2)]],
  });

  readonly emailForm = this.fb.nonNullable.group({
    email: [this.auth.getUserData()?.email ?? '', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  t(key: Parameters<Locale['t']>[0]): string {
    return this.locale.t(key);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set(this.t('settings.error'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage.set(this.t('settings.error'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.auth.setAvatar(dataUrl);
      this.avatarPreview.set(dataUrl);
      this.successMessage.set(this.t('settings.avatarSaved'));
      this.errorMessage.set('');
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeAvatar(): void {
    this.auth.removeAvatar();
    this.avatarPreview.set('/images/user.png');
    this.successMessage.set(this.t('settings.avatarSaved'));
    this.errorMessage.set('');
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.isSavingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile.set(true);
    this.clearMessages();

    this.userService.updateProfile({ name: this.profileForm.getRawValue().name }).subscribe({
      next: (user) => {
        this.auth.updateLocalUserData(user);
        this.isSavingProfile.set(false);
        this.successMessage.set(this.t('settings.saved'));
      },
      error: (err) => {
        this.isSavingProfile.set(false);
        const message = err?.error?.error;
        this.errorMessage.set(
          typeof message === 'string' && message.length > 0
            ? message
            : this.t('settings.error'),
        );
      },
    });
  }

  saveEmail(): void {
    if (this.emailForm.invalid || this.isSavingEmail()) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isSavingEmail.set(true);
    this.clearMessages();

    this.userService.updateProfile({ email: this.emailForm.getRawValue().email }).subscribe({
      next: (user) => {
        this.auth.updateLocalUserData(user);
        this.isSavingEmail.set(false);
        this.successMessage.set(this.t('settings.saved'));
      },
      error: (err) => {
        this.isSavingEmail.set(false);
        const message = err?.error?.error;
        this.errorMessage.set(
          message === 'Email already in use' ? this.t('settings.errorEmail') : this.t('settings.error'),
        );
      },
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid || this.isSavingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.errorMessage.set(this.t('settings.passwordMismatch'));
      return;
    }

    this.isSavingPassword.set(true);
    this.clearMessages();

    this.userService
      .updateProfile({ currentPassword, newPassword, confirmPassword })
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.isSavingPassword.set(false);
          this.successMessage.set(this.t('settings.saved'));
        },
        error: (err) => {
          this.isSavingPassword.set(false);
          const message = err?.error?.error;
          this.errorMessage.set(
            message === 'Invalid current password'
              ? this.t('settings.errorPassword')
              : this.t('settings.error'),
          );
        },
      });
  }

  setTheme(mode: ThemeMode): void {
    this.theme.setMode(mode);
  }

  setLanguage(locale: AppLocale): void {
    this.locale.setLocale(locale);
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
