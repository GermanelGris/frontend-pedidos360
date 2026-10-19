import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

/** Evento del timeline de ms-pedidos360-audit: quién / qué / cuándo / sobre qué pedido. */
export interface AuditEvent {
  eventId: string;
  occurredAt: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorRoles: string[];
  sourceIp: string | null;
  service: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  summary: string | null;
  traceId: string | null;
  correlationId: string | null;
}

export interface AuditFilters {
  user: string;
  type: string;
  entityId: string;
  from: string;
  to: string;
}

export const AUDIT_EVENT_TYPES = [
  { value: 'OrderCreated', label: 'Pedido creado' },
  { value: 'OrderStatusChanged', label: 'Cambio de estado' },
];

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/audit`;

  events(filters: AuditFilters, limit = 100) {
    let params = new HttpParams().set('limit', limit);
    for (const [key, value] of Object.entries(filters)) {
      if (value.trim()) {
        params = params.set(key, value.trim());
      }
    }
    return this.http.get<AuditEvent[]>(`${this.baseUrl}/events`, { params });
  }

  orderTimeline(orderId: number) {
    return this.http.get<AuditEvent[]>(`${this.baseUrl}/orders/${orderId}/timeline`);
  }
}
