import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { errorMessage, Order, ORDER_STATUSES, OrderStatus } from '../../core/models';
import { OrdersService } from '../../core/orders.service';
import { OrderStatusBadgeComponent } from './order-status-badge.component';

@Component({
  selector: 'app-order-detail',
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink, OrderStatusBadgeComponent],
  template: `
    <a routerLink="/orders" class="btn btn-link back-link">
      <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 19-7-7 7-7M19 12H5" /></svg>
      Volver a pedidos
    </a>

    @if (error()) {
      <p class="alert" role="alert">
        <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        <span>{{ error() }}</span>
      </p>
    }

    @if (order(); as o) {
      <header class="page-header">
        <div>
          <p class="eyebrow">Detalle del pedido</p>
          <div class="title-row">
            <h1>Pedido #{{ o.id }}</h1>
            <app-order-status-badge [status]="o.status" />
          </div>
          <p class="page-subtitle">Creado el {{ o.createdAt | date: 'dd-MM-yyyy' }} a las {{ o.createdAt | date: 'HH:mm' }}</p>
        </div>
      </header>

      <div class="detail-grid">
        <div>
          <section class="card card-table">
            <div class="card-header">
              <div class="card-title">
                <span class="card-icon" aria-hidden="true">
                  <svg class="i" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
                </span>
                <div>
                  <h2>Productos</h2>
                  <p class="card-subtitle">{{ o.items.length }} ítem(s) en el pedido</p>
                </div>
              </div>
            </div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Producto</th><th class="num">Cantidad</th><th class="num">Precio</th><th class="num">Subtotal</th></tr></thead>
                <tbody>
                  @for (item of o.items; track item.productId) {
                    <tr>
                      <td class="cell-strong">{{ item.productName }}</td>
                      <td class="num"><span class="count-pill">{{ item.quantity }}</span></td>
                      <td class="num cell-muted">{{ item.unitPrice | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</td>
                      <td class="num cell-strong">{{ item.subtotal | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="draft-footer" style="justify-content: flex-end">
              <div class="total-amount">
                <span>Total</span>
                <strong>{{ o.total | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</strong>
              </div>
            </div>
          </section>
        </div>

        <div>
          <section class="card">
            <div class="card-header">
              <h2>Resumen</h2>
            </div>
            <dl class="meta-list">
              <div>
                <dt><svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>Cliente</dt>
                <dd>{{ o.customerName ?? '—' }}</dd>
              </div>
              <div>
                <dt><svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>Creado</dt>
                <dd>{{ o.createdAt | date: 'dd-MM-yyyy HH:mm' }}</dd>
              </div>
              <div>
                <dt><svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>Entregado</dt>
                <dd>{{ o.deliveredAt ? (o.deliveredAt | date: 'dd-MM-yyyy HH:mm') : '—' }}</dd>
              </div>
              <div>
                <dt><svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>Lead time</dt>
                <dd>{{ o.leadTimeMinutes !== null ? o.leadTimeMinutes + ' min' : '—' }}</dd>
              </div>
            </dl>
          </section>

          @if (auth.hasAnyRole('Admin', 'Operador')) {
            <section class="card">
              <div class="card-header">
                <div>
                  <h2>Cambiar estado</h2>
                  <p class="card-subtitle">Transiciones permitidas desde el estado actual</p>
                </div>
              </div>
              <div class="status-actions">
                @for (next of o.nextStatuses; track next) {
                  <button class="btn btn-primary" (click)="changeStatus(next)">
                    {{ next }}
                    <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                } @empty {
                  <span class="final-state">
                    <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    El pedido está en un estado final.
                  </span>
                }
              </div>

              <div class="test-zone">
                <p class="test-zone-title">
                  <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" /><path d="M8.5 2h7M7 16h10" /></svg>
                  Zona de prueba · HTTP 409
                </p>
                <span class="muted small">Probar la regla de negocio (el backend rechaza transiciones inválidas con 409):</span>
                <div class="form-row">
                  <select [(ngModel)]="forcedStatus" aria-label="Estado a forzar">
                    @for (status of statuses; track status) {
                      <option [value]="status">{{ status }}</option>
                    }
                  </select>
                  <button class="btn" (click)="changeStatus(forcedStatus())">Intentar</button>
                </div>
              </div>
            </section>
          }
        </div>
      </div>
    }
  `,
})
export class OrderDetailComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly ordersApi = inject(OrdersService);

  readonly statuses = ORDER_STATUSES;
  readonly order = signal<Order | null>(null);
  readonly error = signal('');
  readonly forcedStatus = signal<OrderStatus>('DESPACHADO');

  async ngOnInit(): Promise<void> {
    await this.auth.loadClaims();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.ordersApi.get(id).subscribe({
      next: (order) => this.order.set(order),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  changeStatus(status: OrderStatus): void {
    const current = this.order();
    if (!current) {
      return;
    }
    this.error.set('');
    this.ordersApi.changeStatus(current.id, status).subscribe({
      next: (order) => this.order.set(order),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
