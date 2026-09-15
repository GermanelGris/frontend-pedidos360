import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Product } from '../../core/models';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe],
  template: `
    <article class="product-card" [class.inactive]="!product().active">
      <div class="product-thumb" [class]="'thumb-' + (product().id % 6)" aria-hidden="true">
        <span class="product-initial">{{ product().name.charAt(0) }}</span>
        <svg class="i thumb-icon" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
      </div>

      <div class="product-body">
        <div class="product-head">
          <h3>{{ product().name }}</h3>
          <p class="price">{{ product().price | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</p>
        </div>
        <p class="product-desc">{{ product().description || 'Sin descripción' }}</p>

        <div class="product-foot">
          <span class="stock" [class.low]="product().stock < 10" [class.out]="product().stock === 0">
            Stock: <strong>{{ product().stock }}</strong>
            @if (product().stock < 10) {
              <span>· bajo</span>
            }
          </span>
          @if (!product().active) {
            <span class="chip chip-warn">Inactivo</span>
          }
          @if (canEdit()) {
            <div class="product-actions">
              <button class="btn btn-ghost btn-icon" (click)="edit.emit(product())" [attr.aria-label]="'Editar ' + product().name" title="Editar">
                <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
              </button>
              <button class="btn btn-ghost btn-danger btn-icon" (click)="remove.emit(product())" [attr.aria-label]="'Eliminar ' + product().name" title="Eliminar">
                <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
              </button>
            </div>
          }
        </div>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  readonly canEdit = input(false);
  readonly edit = output<Product>();
  readonly remove = output<Product>();
}
