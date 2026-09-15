import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService, UserClaims } from './auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  function runGuard(allowedRoles: string[], claims: UserClaims | null) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { loadClaims: () => Promise.resolve(claims) } },
      ],
    });
    const route = { data: { roles: allowedRoles } } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot)) as Promise<
      boolean | UrlTree
    >;
  }

  const user = (roles: string[]): UserClaims => ({
    name: 'Test',
    username: 'test@pedidos360.onmicrosoft.com',
    roles,
    scopes: ['Pedidos.ReadWrite'],
  });

  it('permite el acceso cuando el token trae un rol autorizado', async () => {
    expect(await runGuard(['Admin', 'Operador'], user(['Operador']))).toBeTrue();
  });

  it('redirige a /forbidden cuando el rol no está autorizado', async () => {
    const result = await runGuard(['Admin'], user(['Cliente']));
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/forbidden');
  });

  it('redirige a /login cuando no hay sesión', async () => {
    const result = await runGuard(['Admin'], null);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/login');
  });
});
