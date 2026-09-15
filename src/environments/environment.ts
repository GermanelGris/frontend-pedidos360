// Valores de Microsoft Entra ID (ver "Hoja de valores" en GUIA-EP1-Pedidos360.md)
const tenantId = 'bd2636b9-f868-446b-a06f-542bde5b43ae';
const spaClientId = '435373e3-6266-402f-99b1-33f01d299791'; // Pedidos360-SPA
const apiClientId = '9626370e-d9b7-4f84-9a68-444cde77f6da'; // Pedidos360-API

export const environment = {
  production: false,
  azure: {
    clientId: spaClientId,
    tenantId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: 'http://localhost:4200/auth/callback', // Debe coincidir con la plataforma SPA en Entra ID
    postLogoutRedirectUri: 'http://localhost:4200/login',
    apiScopes: [`api://${apiClientId}/Pedidos.ReadWrite`],
  },
  // AWS API Gateway (HTTP API con autorizador JWT) → BFF en EC2. Para probar local: 'http://localhost:18080'
  apiBaseUrl: 'https://z5ter2hxya.execute-api.us-east-1.amazonaws.com',
};
