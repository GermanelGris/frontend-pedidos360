import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

/** KPIs calculados por ms-pedidos360-report a partir de los eventos de RabbitMQ (exchange orders.events). */
export interface KpiResponse {
  totalOrders: number;
  activeOrders: number;
  salesTotal: number;
  avgLeadTimeMinutes: number | null;
  ordersByStatus: Record<string, number>;
  lastEventAt: string | null;
}

export interface HourlySales {
  hour: string;
  orders: number;
  sales: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  quantity: number;
  revenue: number;
}

/** Meta de venta con su avance: achieved = ventas del rango sin cancelados; progressPercent puede superar 100. */
export interface SalesGoal {
  id: number;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  achieved: number;
  progressPercent: number;
  createdBy: string | null;
  createdAt: string;
}

export interface CreateGoalRequest {
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/report`;

  kpis() {
    return this.http.get<KpiResponse>(`${this.baseUrl}/kpis`);
  }

  salesByHour(hours: number) {
    return this.http.get<HourlySales[]>(`${this.baseUrl}/sales-by-hour`, { params: new HttpParams().set('hours', hours) });
  }

  topProducts(limit: number) {
    return this.http.get<TopProduct[]>(`${this.baseUrl}/top-products`, { params: new HttpParams().set('limit', limit) });
  }

  goals() {
    return this.http.get<SalesGoal[]>(`${this.baseUrl}/goals`);
  }

  createGoal(request: CreateGoalRequest) {
    return this.http.post<SalesGoal>(`${this.baseUrl}/goals`, request);
  }

  deleteGoal(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/goals/${id}`);
  }
}
