import { Component, inject, OnInit, signal } from '@angular/core';

import { AuthService } from '../../auth/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { errorMessage, Product, ProductRequest } from '../../core/models';
import { ProductCardComponent } from './product-card.component';
import { ProductFormComponent } from './product-form.component';

@Component({
  selector: 'app-catalog',
  imports: [ProductCardComponent, ProductFormComponent],
  template: `
    <header class="page-header">
      <div>
        <h1>Catálogo de productos</h1>
        <p class="page-subtitle">{{ products().length }} producto(s) · precios, stock y disponibilidad.</p>
      </div>
      @if (isAdmin() && !showForm()) {
        <button class="btn btn-primary" (click)="openForm(null)">
          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Nuevo producto
        </button>
      }
    </header>

    @if (error()) {
      <p class="alert" role="alert">
        <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        <span>{{ error() }}</span>
      </p>
    }

    @if (showForm()) {
      <app-product-form [product]="editing()" (save)="save($event)" (cancel)="showForm.set(false)" />
    }

    <section class="grid">
      @for (product of products(); track product.id) {
        <app-product-card [product]="product" [canEdit]="isAdmin()" (edit)="openForm($event)" (remove)="remove($event)" />
      } @empty {
        <div class="card empty" style="grid-column: 1 / -1">
          <span class="empty-icon" aria-hidden="true">
            <svg class="i i-lg" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.3 7 12 12l8.7-5M12 22V12" /></svg>
          </span>
          <p class="empty-title">No hay productos.</p>
          <p class="empty-text">Los productos del catálogo aparecerán aquí.</p>
        </div>
      }
    </section>
  `,
})
export class CatalogComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly catalogApi = inject(CatalogService);

  readonly products = signal<Product[]>([]);
  readonly editing = signal<Product | null>(null);
  readonly showForm = signal(false);
  readonly error = signal('');
  readonly isAdmin = () => this.auth.hasAnyRole('Admin');

  async ngOnInit(): Promise<void> {
    await this.auth.loadClaims();
    this.load();
  }

  openForm(product: Product | null): void {
    this.editing.set(product);
    this.showForm.set(true);
  }

  save(request: ProductRequest): void {
    const current = this.editing();
    const call = current ? this.catalogApi.update(current.id, request) : this.catalogApi.create(request);
    call.subscribe({
      next: () => {
        this.showForm.set(false);
        this.load();
      },
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  remove(product: Product): void {
    if (!confirm(`¿Eliminar ${product.name}?`)) {
      return;
    }
    this.catalogApi.delete(product.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  private load(): void {
    this.error.set('');
    this.catalogApi.list().subscribe({
      next: (products) => this.products.set(products),
      error: (err) => this.error.set(errorMessage(err)),
    });
  }
}
