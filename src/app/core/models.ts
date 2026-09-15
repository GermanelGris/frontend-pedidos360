import { HttpErrorResponse } from '@angular/common/http';

export type OrderStatus = 'CREADO' | 'ACEPTADO' | 'EN_PREPARACION' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO';

export const ORDER_STATUSES: OrderStatus[] = [
  'CREADO',
  'ACEPTADO',
  'EN_PREPARACION',
  'DESPACHADO',
  'ENTREGADO',
  'CANCELADO',
];

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  customerId: string;
  customerName: string | null;
  status: OrderStatus;
  nextStatuses: OrderStatus[];
  total: number;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
  leadTimeMinutes: number | null;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  customerName?: string;
  items: { productId: number; quantity: number }[];
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  active: boolean;
}

export interface ProductRequest {
  name: string;
  description: string | null;
  price: number;
  stock: number;
  active: boolean;
}

/** Extrae el mensaje de error que devuelven el API Gateway, el BFF o los microservicios. */
export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'No se pudo conectar con la API (¿BFF/API Gateway encendido? ¿CORS?)';
    }
    const body = error.error;
    const detail = body?.message ?? (typeof body === 'string' ? body : error.message);
    return `${error.status} - ${detail}`;
  }
  return 'Error inesperado';
}
