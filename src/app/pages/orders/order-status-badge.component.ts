import { Component, computed, input } from '@angular/core';

import { OrderStatus } from '../../core/models';

const LABELS: Record<OrderStatus, string> = {
  CREADO: 'Creado',
  ACEPTADO: 'Aceptado',
  EN_PREPARACION: 'En preparación',
  DESPACHADO: 'Despachado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

@Component({
  selector: 'app-order-status-badge',
  template: `<span class="badge" [class]="'badge status-' + status().toLowerCase()">{{ label() }}</span>`,
})
export class OrderStatusBadgeComponent {
  readonly status = input.required<OrderStatus>();
  readonly label = computed(() => LABELS[this.status()]);
}
