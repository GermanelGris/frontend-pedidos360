import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Sin sesión: muestra la página de bienvenida (/login) en vez de saltar directo a Microsoft.
 * Con sesión: deja pasar y MsalGuard (canActivateChild) protege las rutas hijas.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.activeAccount() ? true : router.parseUrl('/login');
};
