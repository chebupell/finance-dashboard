import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const authService = inject(Auth);
  const router = inject(Router);

  console.log('Is Logged In:', authService.isLoggedIn());

  if (authService.isLoggedIn()) {
    return true;
  }

  console.log('Redirecting to sign-up...');
  // Использование createUrlTree — более стабильный способ в Angular 15+
  return router.createUrlTree(['/sign-up']);
};
