import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import {
  catchError,
  EMPTY,
  filter,
  fromEvent,
  merge,
  Observable,
  Subject,
  switchMap,
  tap,
  timer,
} from 'rxjs';

/** Cada cuánto se vuelve a pedir la información (para ver los cambios de otros usuarios). */
export const POLL_INTERVAL_MS = 5000;
/**
 * Report y audit se actualizan de forma asíncrona vía RabbitMQ: tras un cambio se refresca al instante
 * y otra vez un momento después, cuando los consumidores ya procesaron el evento.
 */
export const ASYNC_FOLLOW_UP_MS = 1500;

/**
 * Refresco "en vivo" de las listas: polling cada {@link POLL_INTERVAL_MS} y, además, un refresco inmediato
 * cada vez que este navegador hace una petición que modifica datos (crear pedido, cambiar estado, etc.).
 * Mientras la pestaña está oculta no se consulta, para no gastar llamadas al API Gateway.
 */
@Injectable({ providedIn: 'root' })
export class LiveRefreshService {
  private readonly changes = new Subject<void>();

  /** Lo llama el interceptor después de una petición POST / PUT / PATCH / DELETE exitosa. */
  notifyChange(): void {
    this.changes.next();
    setTimeout(() => this.changes.next(), ASYNC_FOLLOW_UP_MS);
  }

  /**
   * Ejecuta {@code source} ahora, cada {@link POLL_INTERVAL_MS}, al volver a la pestaña, tras cada cambio
   * propio y cuando emita {@code extraTriggers} (p. ej. un filtro nuevo). Una consulta lenta se cancela
   * si llega otra, y un error no detiene el refresco. Se detiene sola al destruir el componente.
   */
  watch<T>(
    destroyRef: DestroyRef,
    source: () => Observable<T>,
    handlers: { next: (value: T) => void; error: (err: unknown) => void },
    extraTriggers: Observable<unknown> = EMPTY,
  ): void {
    merge(
      timer(0, POLL_INTERVAL_MS).pipe(filter(() => !document.hidden)),
      fromEvent(document, 'visibilitychange').pipe(filter(() => !document.hidden)),
      this.changes,
      extraTriggers,
    )
      .pipe(
        switchMap(() =>
          source().pipe(
            catchError((err) => {
              handlers.error(err);
              return EMPTY;
            }),
          ),
        ),
        tap(handlers.next),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe();
  }
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** Avisa a {@link LiveRefreshService} cuando una petición de cliente u operador modificó datos en la API. */
export const liveRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  if (!MUTATING_METHODS.has(req.method) || !req.url.includes('/api/')) {
    return next(req);
  }
  const live = inject(LiveRefreshService);
  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse && event.ok) {
        live.notifyChange();
      }
    }),
  );
};
