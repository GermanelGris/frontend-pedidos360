import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { CreateOrderRequest, Order, OrderStatus } from './models';

/** El token lo agrega MsalInterceptor: aquí no se toca el header Authorization. */
@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/orders`;

  list() {
    return this.http.get<Order[]>(this.baseUrl);
  }

  get(id: number) {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateOrderRequest) {
    return this.http.post<Order>(this.baseUrl, request);
  }

  changeStatus(id: number, status: OrderStatus) {
    return this.http.patch<Order>(`${this.baseUrl}/${id}/status`, { status });
  }
}
