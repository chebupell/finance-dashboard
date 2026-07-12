import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environment/environment';

export interface UserData {
  id?: number;
  name: string;
  email: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  enableAutoLogin: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserData;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly avatarStorageKey = 'finance-dashboard-avatar';
  private readonly defaultAvatar = '/images/user.png';

  readonly loggedIn = signal<boolean>(
    !!(localStorage.getItem('token') || sessionStorage.getItem('token')),
  );

  readonly userData = signal<UserData | null>(this.readUserDataFromStorage());
  readonly avatarUrl = signal<string>(this.readAvatarFromStorage());

  isLoggedIn(): boolean {
    return this.loggedIn();
  }

  logout(): void {
    this.removeSession();
    this.loggedIn.set(false);
    this.userData.set(null);
    this.avatarUrl.set(this.defaultAvatar);
    this.router.navigate(['/login']);
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((response) => this.saveSession(response, payload.enableAutoLogin)));
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((response) => this.saveSession(response)));
  }

  getUserData(): UserData | null {
    return this.userData();
  }

  updateLocalUserData(user: UserData): void {
    const storage = this.getActiveStorage();
    if (!storage) return;
    storage.setItem('userData', JSON.stringify(user));
    this.userData.set(user);
  }

  setAvatar(dataUrl: string): void {
    localStorage.setItem(this.avatarStorageKey, dataUrl);
    this.avatarUrl.set(dataUrl);
  }

  removeAvatar(): void {
    localStorage.removeItem(this.avatarStorageKey);
    this.avatarUrl.set(this.defaultAvatar);
  }

  private saveSession(res: AuthResponse, enableAutoLogin = false): void {
    const storage = enableAutoLogin ? localStorage : sessionStorage;
    storage.setItem('token', res.token);
    storage.setItem('userData', JSON.stringify(res.user));
    this.loggedIn.set(true);
    this.userData.set(res.user);
  }

  private removeSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');
  }

  private getActiveStorage(): Storage | null {
    if (localStorage.getItem('token')) return localStorage;
    if (sessionStorage.getItem('token')) return sessionStorage;
    return null;
  }

  private readUserDataFromStorage(): UserData | null {
    const raw =
      localStorage.getItem('userData') || sessionStorage.getItem('userData') || '';
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as UserData;
      return parsed.name ? parsed : null;
    } catch {
      return null;
    }
  }

  private readAvatarFromStorage(): string {
    return localStorage.getItem(this.avatarStorageKey) || this.defaultAvatar;
  }
}
