import { Routes } from '@angular/router';
import { authGuard } from './services/auth-guard';
import { guestGuard } from './services/guest-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login-page/login-page').then((m) => m.LoginPage),
    canActivate: [guestGuard],
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up-page/sign-up-page').then((m) => m.SignUpPage),
    canActivate: [guestGuard],
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  },
];
