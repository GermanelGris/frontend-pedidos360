import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

export type ExchangeType = 'direct' | 'topic' | 'fanout' | 'headers';
export const EXCHANGE_TYPES: ExchangeType[] = ['direct', 'topic', 'fanout', 'headers'];

export interface MqQueue {
  name: string;
  durable: boolean;
  messages: number;
  consumers: number;
  arguments: Record<string, unknown>;
  protectedResource: boolean;
}

export interface MqExchange {
  name: string;
  type: string;
  durable: boolean;
  protectedResource: boolean;
}

export interface MqBinding {
  exchange: string;
  queue: string;
  routingKey: string;
}

export interface CreateQueueRequest {
  name: string;
  durable: boolean;
  deadLetterExchange?: string;
  deadLetterRoutingKey?: string;
  messageTtlMs?: number;
  maxLength?: number;
}

export interface CreateExchangeRequest {
  name: string;
  type: ExchangeType;
  durable: boolean;
}

export interface PublishMessageRequest {
  exchange: string;
  routingKey: string;
  type?: string;
  payload: Record<string, unknown>;
}

export interface PublishResult {
  eventId: string;
  exchange: string;
  routingKey: string;
}

/** Mismas reglas de nombre que valida ms-pedidos360-mq-admin. */
export const MQ_NAME_PATTERN = '^(?!amq\\.)[A-Za-z0-9._-]+$';
export const MQ_ROUTING_KEY_PATTERN = '^[A-Za-z0-9._*#-]*$';

/** Administración de RabbitMQ a través del BFF (/api/mq/**, solo rol Admin). */
@Injectable({ providedIn: 'root' })
export class MqAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/mq`;

  queues() {
    return this.http.get<MqQueue[]>(`${this.baseUrl}/queues`);
  }

  createQueue(request: CreateQueueRequest) {
    return this.http.post<MqQueue>(`${this.baseUrl}/queues`, request);
  }

  deleteQueue(name: string) {
    return this.http.delete<void>(`${this.baseUrl}/queues/${encodeURIComponent(name)}`);
  }

  purgeQueue(name: string) {
    return this.http.delete<{ queue: string; purgedMessages: number }>(
      `${this.baseUrl}/queues/${encodeURIComponent(name)}/messages`,
    );
  }

  exchanges() {
    return this.http.get<MqExchange[]>(`${this.baseUrl}/exchanges`);
  }

  createExchange(request: CreateExchangeRequest) {
    return this.http.post<MqExchange>(`${this.baseUrl}/exchanges`, request);
  }

  deleteExchange(name: string) {
    return this.http.delete<void>(`${this.baseUrl}/exchanges/${encodeURIComponent(name)}`);
  }

  bindings() {
    return this.http.get<MqBinding[]>(`${this.baseUrl}/bindings`);
  }

  createBinding(binding: MqBinding) {
    return this.http.post<MqBinding>(`${this.baseUrl}/bindings`, binding);
  }

  deleteBinding(binding: MqBinding) {
    const params = new HttpParams()
      .set('exchange', binding.exchange)
      .set('queue', binding.queue)
      .set('routingKey', binding.routingKey);
    return this.http.delete<void>(`${this.baseUrl}/bindings`, { params });
  }

  publish(request: PublishMessageRequest) {
    return this.http.post<PublishResult>(`${this.baseUrl}/messages`, request);
  }
}
