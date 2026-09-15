# frontend-pedidos360

Frontend Angular 20 de **Pedidos360** con autenticación **Microsoft Entra ID** mediante **MSAL Angular**.

## Qué implementa

| Requisito | Dónde |
|---|---|
| Login / logout con MSAL (redirect) | `auth/auth.service.ts`, `pages/login`, `pages/callback` |
| Configuración de MSAL (instancia, guard, interceptor) | `auth/msal-config.ts`, `app.config.ts` |
| Rutas protegidas con `MsalGuard` | `app.routes.ts` |
| Autorización por rol (`Admin`, `Operador`, `Cliente`) | `auth/role.guard.ts` + menú en `layout/layout.component.ts` |
| Roles y scopes leídos desde los claims del access token | `AuthService.loadClaims()` |
| `MsalInterceptor` adjunta `Authorization: Bearer <token>` | `protectedResourceMap` en `msal-config.ts` |
| Consumo del API Gateway | `core/orders.service.ts`, `core/catalog.service.ts` |

## Pantallas

| Ruta | Componente | Roles |
|---|---|---|
| `/login` | LoginComponent | público |
| `/auth/callback` | CallbackComponent | público |
| `/dashboard` | DashboardComponent | todos |
| `/orders`, `/orders/:id` | OrdersComponent, OrderListComponent, OrderDetailComponent, OrderStatusBadgeComponent | Admin, Operador, Cliente |
| `/catalog` | CatalogComponent, ProductCardComponent, ProductFormComponent | Admin, Operador |
| `/reports` | ReportsComponent (próxima etapa) | Admin |
| `/audit` | AuditComponent (próxima etapa) | Admin |

## Configuración

Editar `src/environments/environment.ts`:

| Valor | Origen |
|---|---|
| `tenantId` | Entra ID → Id. de directorio (inquilino) |
| `spaClientId` | App `Pedidos360-SPA` → Id. de aplicación (cliente) |
| `apiClientId` | App `Pedidos360-API` → Id. de aplicación (cliente) |
| `apiBaseUrl` | URL de invocación del API Gateway (`https://<id>.execute-api.us-east-1.amazonaws.com`) o `http://localhost:18080` (BFF local) |

En Entra ID, la app SPA debe tener como URI de redirección (plataforma **SPA**) `http://localhost:4200/auth/callback`.

## Ejecutar

```bash
npm install
npm start          # http://localhost:4200
npm run build
```

## Autores

Germán Maraboli & Camila Vera

Proyecto Pedidos360 · DSY1107 Desarrollo Cloud Native I · Duoc UC
