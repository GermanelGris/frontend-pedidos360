import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../auth/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { errorMessage, Order, Product } from '../../core/models';
import { OrdersService } from '../../core/orders.service';
import { OrderListComponent } from './order-list.component';

interface DraftLine {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-orders',
  imports: [FormsModule, CurrencyPipe, OrderListComponent],
  template: `
    <header class="page-header">
      <div>
        <h1>Pedidos</h1>
        <p class="page-subtitle">
          {{ auth.hasAnyRole('Admin', 'Operador') ? 'Crea, filtra y gestiona los pedidos de todos los clientes.' : 'Realiza un nuevo pedido y revisa el estado de los anteriores.' }}
        </p>
      </div>
    </header>

    @if (message()) {
      <p class="alert alert-ok" role="status">
        <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
        <span>{{ message() }}</span>
      </p>
    }
    @if (error()) {
      <p class="alert" role="alert">
        <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        <span>{{ error() }}</span>
      </p>
    }

    @if (auth.hasAnyRole('Cliente', 'Operador')) {
      <section class="card">
        <div class="card-header">
          <div class="card-title">
            <span class="card-icon" aria-hidden="true">
              <svg class="i" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
            </span>
            <div>
              <h2>Nuevo pedido</h2>
              <p class="card-subtitle">Agrega productos del catálogo y confirma el pedido.</p>
            </div>
          </div>
        </div>

        <div class="order-builder">
          @if (auth.hasAnyRole('Operador')) {
            <label class="field field-grow">
              Cliente
              <input placeholder="Nombre del cliente" [(ngModel)]="customerName" />
            </label>
          }
          <label class="field field-grow">
            Producto
            <select [(ngModel)]="selectedProductId">
              <option [ngValue]="null">Selecciona un producto</option>
              @for (product of products(); track product.id) {
                <option [ngValue]="product.id" [disabled]="!product.active">
                  {{ product.name }} · {{ product.price | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }} · stock {{ product.stock }}
                </option>
              }
            </select>
          </label>
          <label class="field">
            Cantidad
            <input type="number" min="1" [(ngModel)]="quantity" class="input-sm" />
          </label>
          <button class="btn" (click)="addLine()" [disabled]="!selectedProductId()">
            <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Agregar
          </button>
        </div>

        @if (lines().length > 0) {
          <div class="draft">
            <div class="table-wrap">
              <table>
                <thead><tr><th>Producto</th><th class="num">Cantidad</th><th class="num">Subtotal</th><th><span class="sr-only">Acciones</span></th></tr></thead>
                <tbody>
                  @for (line of lines(); track line.product.id) {
                    <tr>
                      <td class="cell-strong">{{ line.product.name }}</td>
                      <td class="num"><span class="count-pill">{{ line.quantity }}</span></td>
                      <td class="num cell-strong">{{ line.product.price * line.quantity | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</td>
                      <td class="num">
                        <button class="btn btn-ghost btn-danger btn-icon" (click)="removeLine(line.product.id)" [attr.aria-label]="'Quitar ' + line.product.name" title="Quitar">
                          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="draft-footer">
              <div class="total-amount">
                <span>Total</span>
                <strong>{{ draftTotal() | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</strong>
              </div>
              <button class="btn btn-primary" (click)="submit()" [disabled]="saving()">
                <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                Crear pedido
              </button>
            </div>
          </div>
        } @else {
          <p class="draft-empty">
            <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.3 7 12 12l8.7-5M12 22V12" /></svg>
            Aún no agregas productos. Selecciona uno y presiona «Agregar».
          </p>
        }
      </section>
    }

    <section class="card card-table">
      <div class="card-header">
        <div class="card-title">
          <span class="card-icon" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></svg>
          </span>
          <div>
            <h2>{{ auth.hasAnyRole('Admin', 'Operador') ? 'Todos los pedidos' : 'Mis pedidos' }}</h2>
            <p class="card-subtitle">Filtra por estado o busca por número y cliente.</p>
          </div>
        </div>
      </div>
      <app-order-list [orders]="orders()" />
    </section>
  `,
})
export class OrdersComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly ordersApi = inject(OrdersService);
  private readonly catalogApi = inject(CatalogService);

  readonly orders = signal<Order[]>([]);
  readonly products = signal<Product[]>([]);
  readonly lines = signal<DraftLine[]>([]);
  readonly selectedProductId = signal<number | null>(null);
  readonly quantity = signal(1);
  readonly customerName = signal('');
  readonly saving = signal(false);
  readonly error = signal('');
  readonly message = signal('');

  readonly draftTotal = computed(() =>
    this.lines().reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  );

  async ngOnInit(): Promise<void> {
    await this.auth.loadClaims();
    this.loadOrders();
    if (this.auth.hasAnyRole('Cliente', 'Operador')) {
      this.catalogApi.list().subscribe({
        next: (products) => this.products.set(products),
        error: (err) => this.error.set(errorMessage(err)),
      });
    }
  }

  addLine(): void {
    const product = this.products().find((p) => p.id === this.selectedProductId());
    const quantity = Math.max(1, Number(this.quantity()) || 1);
    if (!product) {
      return;
    }
    this.lines.update((lines) => {
      const existing = lines.find((line) => line.product.id === product.id);
      return existing
        ? lines.map((line) => (line === existing ? { ...line, quantity: line.quantity + quantity } : line))
        : [...lines, { product, quantity }];
    });
    this.selectedProductId.set(null);
    this.quantity.set(1);
  }

  removeLine(productId: number): void {
    this.lines.update((lines) => lines.filter((line) => line.product.id !== productId));
  }

  submit(): void {
    this.saving.set(true);
    this.error.set('');
    this.ordersApi
      .create({
        customerName: this.customerName() || undefined,
        items: this.lines().map((line) => ({ productId: line.product.id, quantity: line.quantity })),
      })
      .subscribe({
        next: (order) => {
          this.message.set(`Pedido #${order.id} creado`);
          this.lines.set([]);
          this.customerName.set('');
          this.saving.set(false);
          this.loadOrders();
        },
        error: (err) => {
          this.error.set(errorMessage(err));
          this.saving.set(false);
        },
      });
  }

  private loadOrders(): void {
    this.ordersApi.list().subscribe({
      next: (orders) => this.orders.set(orders),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
