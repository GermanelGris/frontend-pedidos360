import { computed, inject, Injectable, signal } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, InteractionRequiredAuthError } from '@azure/msal-browser';
import { jwtDecode } from 'jwt-decode';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';

export type AppRole = 'Admin' | 'Operador' | 'Cliente';

export interface UserClaims {
  name: string;
  username: string;
  roles: string[];
  scopes: string[];
}

interface AccessTokenPayload {
  name?: string;
  preferred_username?: string;
  roles?: string[];
  scp?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly msal = inject(MsalService);

  readonly claims = signal<UserClaims | null>(null);
  readonly roles = computed(() => this.claims()?.roles ?? []);

  hasAnyRole(...roles: AppRole[]): boolean {
    return this.roles().some((role) => roles.includes(role as AppRole));
  }

  activeAccount(): AccountInfo | null {
    const instance = this.msal.instance;
    const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0] ?? null;
    if (account && !instance.getActiveAccount()) {
      instance.setActiveAccount(account);
    }
    return account;
  }

  /**
   * Obtiene (desde caché o renovándolo en silencio) el access token de la API y lee
   * los roles y scopes directamente desde sus claims.
   */
  async loadClaims(): Promise<UserClaims | null> {
    const current = this.claims();
    if (current) {
      return current;
    }
    const account = this.activeAccount();
    if (!account) {
      return null;
    }
    try {
      const result = await firstValueFrom(
        this.msal.acquireTokenSilent({ account, scopes: environment.azure.apiScopes }),
      );
      const token = jwtDecode<AccessTokenPayload>(result.accessToken);
      const claims: UserClaims = {
        name: token.name ?? account.name ?? account.username,
        username: token.preferred_username ?? account.username,
        roles: token.roles ?? [],
        scopes: (token.scp ?? '').split(' ').filter(Boolean),
      };
      this.claims.set(claims);
      return claims;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        this.msal.acquireTokenRedirect({ account, scopes: environment.azure.apiScopes }).subscribe();
      }
      console.error('No fue posible obtener el token de la API', error);
      return null;
    }
  }

  login(): void {
    this.msal.loginRedirect({ scopes: environment.azure.apiScopes }).subscribe();
  }

  logout(): void {
    this.claims.set(null);
    this.msal
      .logoutRedirect({
        account: this.activeAccount(),
        postLogoutRedirectUri: environment.azure.postLogoutRedirectUri,
      })
      .subscribe();
  }
}
