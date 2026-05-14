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

  // ✅ реактивный сигнал — инициализируем из storage при старте
  readonly loggedIn = signal<boolean>(
    !!(localStorage.getItem('token') || sessionStorage.getItem('token')),
  );

  isLoggedIn(): boolean {
    return this.loggedIn(); // ✅ теперь возвращает сигнал
  }

  logout(): void {
    this.removeSession();
    this.loggedIn.set(false); // ✅ хидер обновится мгновенно
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
    return JSON.parse(localStorage.getItem('userData') || '{}') as UserData;
  }

  private saveSession(res: AuthResponse, enableAutoLogin = false): void {
    const storage = enableAutoLogin ? localStorage : sessionStorage;
    storage.setItem('token', res.token);
    storage.setItem('userData', JSON.stringify(res.user));
    this.loggedIn.set(true); // ✅ хидер обновится мгновенно
  }

  private removeSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');
  }
}
