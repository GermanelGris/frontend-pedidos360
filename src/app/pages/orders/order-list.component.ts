import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Order, ORDER_STATUSES } from '../../core/models';
import { OrderStatusBadgeComponent } from './order-status-badge.component';

@Component({
  selector: 'app-order-list',
  imports: [FormsModule, CurrencyPipe, DatePipe, RouterLink, OrderStatusBadgeComponent],
  template: `
    <div class="toolbar">
      <label class="field">
        Estado
        <select [(ngModel)]="statusFilter">
          <option value="">Todos</option>
          @for (status of statuses; track status) {
            <option [value]="status">{{ status }}</option>
          }
        </select>
      </label>
      <div class="input-icon">
        <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
        <input type="search" placeholder="Buscar por N° o cliente" aria-label="Buscar por N° o cliente" [(ngModel)]="search" />
      </div>
      <span class="toolbar-count">{{ filtered().length }} de {{ orders().length }} pedidos</span>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>N°</th><th>Cliente</th><th>Estado</th><th class="num">Productos</th><th class="num">Total</th><th>Creado</th></tr>
        </thead>
        <tbody>
          @for (order of filtered(); track order.id) {
            <tr>
              <td><a class="id-link" [routerLink]="['/orders', order.id]">#{{ order.id }}</a></td>
              <td>
                <span class="customer">
                  <span class="customer-avatar" aria-hidden="true">{{ (order.customerName ?? '?').charAt(0) }}</span>
                  {{ order.customerName }}
                </span>
              </td>
              <td><app-order-status-badge [status]="order.status" /></td>
              <td class="num"><span class="count-pill">{{ order.items.length }}</span></td>
              <td class="num cell-strong">{{ order.total | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</td>
              <td class="cell-muted">{{ order.createdAt | date: 'dd-MM-yyyy HH:mm' }}</td>
            </tr>
          } @empty {
            <tr class="empty-row">
              <td colspan="6">
                <div class="empty">
                  <span class="empty-icon" aria-hidden="true">
                    <svg class="i i-lg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                  </span>
                  <p class="empty-title">No hay pedidos que coincidan</p>
                  <p class="empty-text">Prueba con otro estado o término de búsqueda.</p>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class OrderListComponent {
  readonly orders = input.required<Order[]>();
  readonly statuses = ORDER_STATUSES;
  readonly statusFilter = signal('');
  readonly search = signal('');

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    const term = this.search().trim().toLowerCase();
    return this.orders().filter(
      (order) =>
        (!status || order.status === status) &&
        (!term || String(order.id).includes(term) || (order.customerName ?? '').toLowerCase().includes(term)),
    );
  });
}
