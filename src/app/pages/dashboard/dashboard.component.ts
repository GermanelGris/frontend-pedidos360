import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { errorMessage, Order } from '../../core/models';
import { OrdersService } from '../../core/orders.service';
import { OrderStatusBadgeComponent } from '../orders/order-status-badge.component';

const CLOSED = ['ENTREGADO', 'CANCELADO'];

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, OrderStatusBadgeComponent],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow eyebrow-plain">{{ today }}</p>
        <h1>Hola, {{ auth.claims()?.name }}</h1>
        <p class="page-subtitle">
          {{ auth.hasAnyRole('Admin', 'Operador') ? 'Este es el resumen de la operación de pedidos.' : 'Revisa el estado de tus pedidos recientes.' }}
        </p>
      </div>
      <a class="btn btn-primary" routerLink="/orders">
        @if (auth.hasAnyRole('Cliente', 'Operador')) {
          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Nuevo pedido
        } @else {
          Ver pedidos
          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        }
      </a>
    </header>

    @if (error()) {
      <p class="alert" role="alert">
        <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        <span>{{ error() }}</span>
      </p>
    }

    @if (auth.hasAnyRole('Admin')) {
      <section class="kpis">
        <div class="kpi">
          <div class="kpi-body">
            <span class="kpi-label">Pedidos totales</span>
            <strong class="kpi-value">{{ orders().length }}</strong>
            <span class="kpi-hint">Histórico registrado</span>
          </div>
          <span class="kpi-icon tone-indigo" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></svg>
          </span>
        </div>
        <div class="kpi">
          <div class="kpi-body">
            <span class="kpi-label">Ventas</span>
            <strong class="kpi-value">{{ sales() | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</strong>
            <span class="kpi-hint">Excluye pedidos cancelados</span>
          </div>
          <span class="kpi-icon tone-green" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></svg>
          </span>
        </div>
        <div class="kpi">
          <div class="kpi-body">
            <span class="kpi-label">Pedidos activos</span>
            <strong class="kpi-value">{{ active().length }}</strong>
            <span class="kpi-hint">Aún no entregados ni cancelados</span>
          </div>
          <span class="kpi-icon tone-amber" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </span>
        </div>
        <div class="kpi">
          <div class="kpi-body">
            <span class="kpi-label">Lead time promedio</span>
            <strong class="kpi-value">{{ avgLeadTime() ?? '—' }} <small>min</small></strong>
            <span class="kpi-hint">Desde creación hasta entrega</span>
          </div>
          <span class="kpi-icon tone-sky" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </span>
        </div>
      </section>
    }

    <section class="card card-table">
      <div class="card-header">
        <div class="card-title">
          <span class="card-icon" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 9.38a1 1 0 0 0-.78-.38H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>
          </span>
          <div>
            <h2>{{ auth.hasAnyRole('Admin', 'Operador') ? 'Pedidos en curso' : 'Mis últimos pedidos' }}</h2>
            <p class="card-subtitle">{{ highlighted().length }} pedido(s) para mostrar</p>
          </div>
        </div>
        <a class="card-link" routerLink="/orders">
          Ver todos
          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </a>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>N°</th><th>Cliente</th><th>Estado</th><th class="num">Total</th><th>Creado</th></tr>
          </thead>
          <tbody>
            @for (order of highlighted(); track order.id) {
              <tr>
                <td><a class="id-link" [routerLink]="['/orders', order.id]">#{{ order.id }}</a></td>
                <td>
                  <span class="customer">
                    <span class="customer-avatar" aria-hidden="true">{{ (order.customerName ?? '?').charAt(0) }}</span>
                    {{ order.customerName }}
                  </span>
                </td>
                <td><app-order-status-badge [status]="order.status" /></td>
                <td class="num cell-strong">{{ order.total | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</td>
                <td class="cell-muted">{{ order.createdAt | date: 'dd-MM-yyyy HH:mm' }}</td>
              </tr>
            } @empty {
              <tr class="empty-row">
                <td colspan="5">
                  <div class="empty">
                    <span class="empty-icon" aria-hidden="true">
                      <svg class="i i-lg" viewBox="0 0 24 24"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
                    </span>
                    <p class="empty-title">Sin pedidos para mostrar</p>
                    <p class="empty-text">Cuando existan pedidos activos aparecerán aquí.</p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>

    <section class="card session-card">
      <div class="card-header">
        <div class="card-title">
          <span class="card-icon" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" /></svg>
          </span>
          <div>
            <h2>Mi sesión (claims del access token)</h2>
            <p class="card-subtitle">Datos leídos desde el JWT emitido por Microsoft Entra ID</p>
          </div>
        </div>
        <span class="chip chip-ok chip-lg">
          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          Sesión activa
        </span>
      </div>
      <dl class="session-claims">
        <div>
          <dt>
            <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>
            Usuario
          </dt>
          <dd class="mono">{{ auth.claims()?.username }}</dd>
        </div>
        <div>
          <dt>
            <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>
            Roles
          </dt>
          <dd class="chips">
            @for (role of auth.claims()?.roles ?? []; track role) {
              <span class="chip chip-lg">{{ role }}</span>
            } @empty {
              <span class="muted">—</span>
            }
          </dd>
        </div>
        <div>
          <dt>
            <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Scopes
          </dt>
          <dd class="chips">
            @for (scope of auth.claims()?.scopes ?? []; track scope) {
              <span class="chip chip-muted chip-mono">{{ scope }}</span>
            } @empty {
              <span class="muted">—</span>
            }
          </dd>
        </div>
      </dl>
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly ordersApi = inject(OrdersService);

  /** Fecha de hoy en español (solo presentación). */
  readonly today = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  readonly orders = signal<Order[]>([]);
  readonly error = signal('');

  readonly active = computed(() => this.orders().filter((o) => !CLOSED.includes(o.status)));
  readonly sales = computed(() =>
    this.orders().filter((o) => o.status !== 'CANCELADO').reduce((sum, o) => sum + o.total, 0),
  );
  readonly avgLeadTime = computed(() => {
    const delivered = this.orders().filter((o) => o.leadTimeMinutes !== null);
    if (delivered.length === 0) {
      return null;
    }
    return Math.round(delivered.reduce((sum, o) => sum + (o.leadTimeMinutes ?? 0), 0) / delivered.length);
  });
  readonly highlighted = computed(() =>
    this.auth.hasAnyRole('Admin', 'Operador') ? this.active() : this.orders().slice(0, 5),
  );

  async ngOnInit(): Promise<void> {
    await this.auth.loadClaims();
    this.ordersApi.list().subscribe({
      next: (orders) => this.orders.set(orders),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
