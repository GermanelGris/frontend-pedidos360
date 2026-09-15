import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { Product, ProductRequest } from './models';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/catalog/products`;

  list() {
    return this.http.get<Product[]>(this.baseUrl);
  }

  create(request: ProductRequest) {
    return this.http.post<Product>(this.baseUrl, request);
  }

  update(id: number, request: ProductRequest) {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
