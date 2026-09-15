import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Product, ProductRequest } from '../../core/models';

@Component({
  selector: 'app-product-form',
  imports: [FormsModule],
  template: `
    <form class="card" #form="ngForm" (ngSubmit)="form.valid && save.emit(model)">
      <div class="card-header">
        <div class="card-title">
          <span class="card-icon" aria-hidden="true">
            @if (product()) {
              <svg class="i" viewBox="0 0 24 24"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
            } @else {
              <svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            }
          </span>
          <div>
            <h2>{{ product() ? 'Editar producto' : 'Nuevo producto' }}</h2>
            <p class="card-subtitle">Los campos nombre, precio y stock son obligatorios.</p>
          </div>
        </div>
      </div>
      <div class="form-grid">
        <label>Nombre <input name="name" [(ngModel)]="model.name" required maxlength="150" placeholder="Ej: Pizza napolitana" /></label>
        <label>Precio (CLP) <input name="price" type="number" min="0" [(ngModel)]="model.price" required /></label>
        <label>Stock <input name="stock" type="number" min="0" [(ngModel)]="model.stock" required /></label>
        <label class="checkbox"><input class="switch" name="active" type="checkbox" [(ngModel)]="model.active" /> Activo</label>
        <label class="full">Descripción <textarea name="description" [(ngModel)]="model.description" maxlength="500" placeholder="Describe ingredientes o tamaño"></textarea></label>
      </div>
      <div class="form-actions">
        <button type="button" class="btn" (click)="cancel.emit()">Cancelar</button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          Guardar
        </button>
      </div>
    </form>
  `,
})
export class ProductFormComponent {
  readonly product = input<Product | null>(null);
  readonly save = output<ProductRequest>();
  readonly cancel = output<void>();

  model: ProductRequest = { name: '', description: '', price: 0, stock: 0, active: true };

  constructor() {
    effect(() => {
      const product = this.product();
      this.model = product
        ? { name: product.name, description: product.description, price: product.price, stock: product.stock, active: product.active }
        : { name: '', description: '', price: 0, stock: 0, active: true };
    });
  }
}
