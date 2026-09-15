import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';

import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';
import { LayoutComponent } from './layout/layout.component';
import { AuditComponent } from './pages/audit/audit.component';
import { CallbackComponent } from './pages/callback/callback.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { LoginComponent } from './pages/login/login.component';
import { OrderDetailComponent } from './pages/orders/order-detail.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { ReportsComponent } from './pages/reports/reports.component';

const ALL_ROLES = ['Admin', 'Operador', 'Cliente'];

export const routes: Routes = [
  // Públicas
  { path: 'login', component: LoginComponent },
  { path: 'auth/callback', component: CallbackComponent },
  { path: 'forbidden', component: ForbiddenComponent },

  // Protegidas: authGuard envía a /login si no hay sesión; MsalGuard protege cada ruta hija;
  // roleGuard valida el rol leído desde el token
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [MsalGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard], data: { roles: ALL_ROLES } },
      { path: 'orders', component: OrdersComponent, canActivate: [roleGuard], data: { roles: ALL_ROLES } },
      { path: 'orders/:id', component: OrderDetailComponent, canActivate: [roleGuard], data: { roles: ALL_ROLES } },
      { path: 'catalog', component: CatalogComponent, canActivate: [roleGuard], data: { roles: ['Admin', 'Operador'] } },
      { path: 'reports', component: ReportsComponent, canActivate: [roleGuard], data: { roles: ['Admin'] } },
      { path: 'audit', component: AuditComponent, canActivate: [roleGuard], data: { roles: ['Admin'] } },
    ],
  },

  { path: '**', redirectTo: 'dashboard' },
];
