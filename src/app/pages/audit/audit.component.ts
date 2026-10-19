import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';

import { AUDIT_EVENT_TYPES, AuditEvent, AuditFilters, AuditService } from '../../core/audit.service';
import { LiveRefreshService } from '../../core/live-refresh.service';
import { errorMessage } from '../../core/models';

/** Timeline de ms-pedidos360-audit: cada evento de pedido llega por RabbitMQ (orders.events) y queda registrado. */
@Component({
  selector: 'app-audit',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Trazabilidad</p>
        <h1>Auditoría</h1>
        <p class="page-subtitle">Historial de eventos de negocio: quién hizo qué y cuándo.</p>
      </div>
    </header>

    @if (error()) {
      <p class="alert" role="alert">
        <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        <span>{{ error() }}</span>
      </p>
    }

    <section class="card">
      <form class="toolbar" (ngSubmit)="search()">
        <label class="field field-grow">
          Usuario
          <input name="user" [(ngModel)]="filters.user" placeholder="Nombre o id" />
        </label>
        <label class="field">
          Tipo de evento
          <select name="type" [(ngModel)]="filters.type">
            <option value="">Todos</option>
            @for (type of types; track type.value) {
              <option [value]="type.value">{{ type.label }}</option>
            }
          </select>
        </label>
        <label class="field">
          N° pedido
          <input name="entityId" class="input-sm" [(ngModel)]="filters.entityId" inputmode="numeric" />
        </label>
        <label class="field">
          Desde
          <input name="from" type="date" [(ngModel)]="filters.from" />
        </label>
        <label class="field">
          Hasta
          <input name="to" type="date" [(ngModel)]="filters.to" />
        </label>
        <button class="btn btn-primary" type="submit" [disabled]="loading()">Buscar</button>
        <button class="btn btn-ghost" type="button" (click)="clear()">Limpiar</button>
      </form>

      <p class="card-subtitle">{{ events().length }} evento(s){{ events().length === limit ? ' (máximo mostrado)' : '' }}</p>

      <ul class="timeline">
        @for (event of events(); track event.eventId) {
          <li>
            <span class="timeline-dot" [class.tone-indigo]="event.action === 'OrderCreated'"
                  [class.tone-amber]="event.action !== 'OrderCreated'" aria-hidden="true">
              @if (event.action === 'OrderCreated') {
                <svg class="i i-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
              } @else {
                <svg class="i i-sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
              }
            </span>
            <div class="event">
              <strong>{{ event.summary }}</strong>
              <span class="muted">
                {{ event.occurredAt | date: 'dd-MM-yyyy HH:mm:ss' }}
                · {{ event.actorName ?? 'Sistema' }}
                @for (role of event.actorRoles; track role) {
                  <span class="chip chip-muted">{{ role }}</span>
                }
                @if (event.entityType === 'ORDER') {
                  · <a [routerLink]="['/orders', event.entityId]">pedido #{{ event.entityId }}</a>
                }
              </span>
              <span class="chip chip-mono chip-muted" [title]="'traceId ' + event.traceId">{{ event.action }} · {{ event.service }}</span>
            </div>
          </li>
        } @empty {
          <li class="muted">{{ loading() ? 'Cargando…' : 'No hay eventos para los filtros seleccionados.' }}</li>
        }
      </ul>
    </section>
  `,
  styles: `
    .event { display: flex; flex-direction: column; gap: 4px; padding-top: 4px; font-size: 0.875rem; min-width: 0; }
    .event .chip { align-self: flex-start; }
  `,
})
export class AuditComponent implements OnInit {
  private readonly api = inject(AuditService);
  private readonly live = inject(LiveRefreshService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();

  readonly types = AUDIT_EVENT_TYPES;
  readonly limit = 100;
  filters: AuditFilters = { user: '', type: '', entityId: '', from: '', to: '' };

  readonly events = signal<AuditEvent[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    this.loading.set(true);
    // Polling cada 5 s con los filtros vigentes; también al pulsar Buscar y tras cada cambio propio
    this.live.watch(
      this.destroyRef,
      () => this.api.events(this.filters, this.limit),
      {
        next: (events) => {
          this.events.set(events);
          this.error.set('');
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(errorMessage(err));
          this.loading.set(false);
        },
      },
      this.reload,
    );
  }

  search(): void {
    this.loading.set(true);
    this.reload.next();
  }

  clear(): void {
    this.filters = { user: '', type: '', entityId: '', from: '', to: '' };
    this.search();
  }
}
