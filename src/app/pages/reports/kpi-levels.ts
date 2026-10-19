/** Semáforo común de los medidores: rojo, amarillo o verde, siempre acompañado de un texto. */
export type Tone = 'danger' | 'warn' | 'ok';

export interface Level {
  tone: Tone;
  label: string;
}

/**
 * Umbrales de stock por producto:
 * - menos de 10: rojo "Sin stock"
 * - 10 a 20: amarillo "Stock bajo"
 * - 21 a 139: verde "Normal"
 * - 140 a 149: amarillo "Stock alto" (se acerca al límite)
 * - 150 o más: rojo "Sobrestock"
 */
export const STOCK_LIMITS = { empty: 10, low: 20, high: 140, max: 150 } as const;

export function stockLevel(stock: number): Level {
  if (stock < STOCK_LIMITS.empty) {
    return { tone: 'danger', label: 'Sin stock' };
  }
  if (stock <= STOCK_LIMITS.low) {
    return { tone: 'warn', label: 'Stock bajo' };
  }
  if (stock >= STOCK_LIMITS.max) {
    return { tone: 'danger', label: 'Sobrestock' };
  }
  if (stock >= STOCK_LIMITS.high) {
    return { tone: 'warn', label: 'Stock alto' };
  }
  return { tone: 'ok', label: 'Normal' };
}

/** Avance de una meta de venta: menos de 50 % rojo, 50 % a 99 % amarillo, 100 % o más verde. */
export const GOAL_LIMITS = { atRisk: 50, done: 100 } as const;

export function goalLevel(progressPercent: number): Level {
  if (progressPercent >= GOAL_LIMITS.done) {
    return { tone: 'ok', label: 'Cumplida' };
  }
  if (progressPercent >= GOAL_LIMITS.atRisk) {
    return { tone: 'warn', label: 'En progreso' };
  }
  return { tone: 'danger', label: 'En riesgo' };
}

/** Orden para listar: primero lo que requiere atención (rojo, luego amarillo, luego verde). */
export const TONE_ORDER: Record<Tone, number> = { danger: 0, warn: 1, ok: 2 };
