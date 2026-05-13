import { Injectable } from '@angular/core';

export interface UserData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  enableAutoLogin: boolean;
  agreeToTerms: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  isLoggedIn(): boolean {
    return (
      localStorage.getItem('isLoggedIn') === 'true' ||
      sessionStorage.getItem('isLoggedIn') === 'true'
    );
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
  }

  loginUser(userData: UserData): void {
    if (userData?.enableAutoLogin) {
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
    }
    sessionStorage.setItem('userData', JSON.stringify(userData));
    sessionStorage.setItem('isLoggedIn', 'true');
  }

  getUserData(): UserData | null {
    return (
      (JSON.parse(localStorage.getItem('userData') || '{}') as UserData) ||
      (JSON.parse(sessionStorage.getItem('userData') || '{}') as UserData)
    );
  }
}
