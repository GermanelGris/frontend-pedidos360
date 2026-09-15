// Valores de Microsoft Entra ID (ver "Hoja de valores" en GUIA-EP1-Pedidos360.md)
const tenantId = 'bd2636b9-f868-446b-a06f-542bde5b43ae';
const spaClientId = '435373e3-6266-402f-99b1-33f01d299791'; // Pedidos360-SPA
const apiClientId = '9626370e-d9b7-4f84-9a68-444cde77f6da'; // Pedidos360-API

// URL base donde corre la app (respeta <base href>): http://localhost:4200/ o https://germanelgris.github.io/frontend-pedidos360/
const appBaseUrl = new URL('.', document.baseURI).href;

export const environment = {
  production: false,
  azure: {
    clientId: spaClientId,
    tenantId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: `${appBaseUrl}auth/callback`, // Debe estar registrada en la plataforma SPA de Entra ID
    postLogoutRedirectUri: `${appBaseUrl}login`,
    apiScopes: [`api://${apiClientId}/Pedidos.ReadWrite`],
  },
  // AWS API Gateway (HTTP API con autorizador JWT) → BFF en EC2. Para probar local: 'http://localhost:18080'
  apiBaseUrl: 'https://z5ter2hxya.execute-api.us-east-1.amazonaws.com',
};
