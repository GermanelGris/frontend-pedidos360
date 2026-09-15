import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { MsalGuardConfiguration, MsalInterceptorConfiguration } from '@azure/msal-angular';

import { environment } from '../../environments/environment';

/** Quién soy (clientId), en qué tenant (authority) y a dónde vuelvo tras el login (redirectUri). */
export function msalInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.azure.clientId,
      authority: environment.azure.authority,
      redirectUri: environment.azure.redirectUri,
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        loggerCallback: (_level, message, containsPii) => {
          if (!containsPii) {
            console.warn(message);
          }
        },
      },
    },
  });
}

/** MsalGuard: obliga a iniciar sesión (redirect) pidiendo el scope de la API. */
export function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: { scopes: environment.azure.apiScopes },
    loginFailedRoute: '/login',
  };
}

/** MsalInterceptor: adjunta "Authorization: Bearer <access_token>" a toda llamada a la API. */
export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>([
    [`${environment.apiBaseUrl}/api/*`, environment.azure.apiScopes],
  ]);
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}
