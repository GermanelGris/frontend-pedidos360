import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/**
 * Autorización por rol. Se usa después de MsalGuard:
 * { path: 'catalog', canActivate: [roleGuard], data: { roles: ['Admin', 'Operador'] } }
 */
export const roleGuard: CanActivateFn = async (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowed = (route.data['roles'] as string[] | undefined) ?? [];

  const claims = await auth.loadClaims();
  if (!claims) {
    return router.parseUrl('/login');
  }
  if (allowed.length === 0 || claims.roles.some((role) => allowed.includes(role))) {
    return true;
  }
  return router.parseUrl('/forbidden');
};
