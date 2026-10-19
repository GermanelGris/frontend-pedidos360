import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';

import { LiveRefreshService } from '../../core/live-refresh.service';
import { errorMessage } from '../../core/models';
import { HourlySales, KpiResponse, ReportService, TopProduct } from '../../core/report.service';

const STATUS_LABELS: Record<string, string> = {
  CREADO: 'Creado',
  ACEPTADO: 'Aceptado',
  EN_PREPARACION: 'En preparación',
  DESPACHADO: 'Despachado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

/** KPIs de ms-pedidos360-report: se alimentan de forma asíncrona con los eventos de RabbitMQ (orders.events). */
@Component({
  selector: 'app-reports',
  imports: [CurrencyPipe, DatePipe],
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Analítica</p>
        <h1>Reportería y KPIs</h1>
        <p class="page-subtitle">
          Indicadores calculados a partir de los eventos de pedidos publicados en RabbitMQ.
          @if (kpis()?.lastEventAt) {
            Último evento: {{ kpis()!.lastEventAt | date: 'dd-MM-yyyy HH:mm:ss' }}.
          }
        </p>
      </div>
      <div class="form-row" style="margin: 0">
        <select [value]="hours()" (change)="changeHours($any($event.target).value)" aria-label="Rango de horas">
          <option value="12">Últimas 12 h</option>
          <option value="24">Últimas 24 h</option>
          <option value="72">Últimos 3 días</option>
          <option value="168">Últimos 7 días</option>
        </select>
        <button class="btn btn-light" type="button" (click)="load()" [disabled]="loading()">
          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
          {{ loading() ? 'Actualizando…' : 'Actualizar' }}
        </button>
      </div>
    </header>

    @if (error()) {
      <p class="alert" role="alert">
        <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        <span>{{ error() }}</span>
      </p>
    }

    @if (kpis(); as k) {
      <section class="kpis">
        <div class="kpi">
          <div class="kpi-body">
            <span class="kpi-label">Pedidos totales</span>
            <strong class="kpi-value">{{ k.totalOrders }}</strong>
            <span class="kpi-hint">Proyectados desde los eventos</span>
          </div>
          <span class="kpi-icon tone-indigo" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /></svg>
          </span>
        </div>
        <div class="kpi">
          <div class="kpi-body">
            <span class="kpi-label">Ventas</span>
            <strong class="kpi-value">{{ k.salesTotal | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</strong>
            <span class="kpi-hint">Excluye pedidos cancelados</span>
          </div>
          <span class="kpi-icon tone-green" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="m22 7-8.5 8.5-5-5L2 17" /><path d="M16 7h6v6" /></svg>
          </span>
        </div>
        <div class="kpi">
          <div class="kpi-body">
            <span class="kpi-label">Pedidos activos</span>
            <strong class="kpi-value">{{ k.activeOrders }}</strong>
            <span class="kpi-hint">Aún no entregados ni cancelados</span>
          </div>
          <span class="kpi-icon tone-amber" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </span>
        </div>
        <div class="kpi">
          <div class="kpi-body">
            <span class="kpi-label">Lead time promedio</span>
            <strong class="kpi-value">{{ k.avgLeadTimeMinutes ?? '—' }} <small>min</small></strong>
            <span class="kpi-hint">Desde creación hasta entrega</span>
          </div>
          <span class="kpi-icon tone-sky" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </span>
        </div>
      </section>
    }

    <section class="grid report-grid">
      <article class="card">
        <div class="card-title">
          <span class="kpi-icon tone-green" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></svg>
          </span>
          <div>
            <h3>Ventas por hora</h3>
            <span class="card-subtitle">{{ salesInRange() | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }} en el rango · {{ ordersInRange() }} pedido(s)</span>
          </div>
        </div>
        <div class="mini-chart sales-chart" role="img" [attr.aria-label]="'Ventas por hora, últimas ' + hours() + ' horas'">
          @for (bar of sales(); track bar.hour) {
            <span [style.--h.%]="barHeight(bar)" [title]="bar.hour + ' · ' + bar.orders + ' pedido(s) · $' + bar.sales"></span>
          }
        </div>
        <div class="axis">
          <span>{{ sales()[0]?.hour?.slice(5) }}</span>
          <span>{{ sales()[sales().length - 1]?.hour?.slice(5) }}</span>
        </div>
      </article>

      <article class="card">
        <div class="card-title">
          <span class="kpi-icon tone-amber" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
          </span>
          <div>
            <h3>Productos más vendidos</h3>
            <span class="card-subtitle">Por unidades, excluye cancelados</span>
          </div>
        </div>
        <ol class="rank">
          @for (product of top(); track product.productId) {
            <li>
              <div class="rank-row">
                <span>{{ product.productName }}</span>
                <span class="muted">{{ product.quantity }} u · {{ product.revenue | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}</span>
              </div>
              <span class="rank-bar" [style.width.%]="rankWidth(product)"></span>
            </li>
          } @empty {
            <li class="muted">Aún no hay ventas registradas.</li>
          }
        </ol>
      </article>

      <article class="card">
        <div class="card-title">
          <span class="kpi-icon tone-sky" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-9-9" /><path d="M21 3 12 12" /></svg>
          </span>
          <div>
            <h3>Pedidos por estado</h3>
            <span class="card-subtitle">Estado actual de cada pedido</span>
          </div>
        </div>
        <ul class="status-list">
          @for (status of statuses(); track status.key) {
            <li>
              <span>{{ status.label }}</span>
              <span class="chip" [class.chip-muted]="status.count === 0">{{ status.count }}</span>
            </li>
          }
        </ul>
      </article>
    </section>
  `,
  styles: `
    .report-grid { grid-template-columns: repeat(auto-fill, minmax(min(320px, 100%), 1fr)); margin-top: 20px; }
    .report-grid .card { margin: 0; display: flex; flex-direction: column; gap: 14px; }
    .sales-chart { height: 140px; gap: 3px; }
    .sales-chart span { min-height: 2px; }
    .axis { display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--subtle); font-family: var(--mono); }
    .rank, .status-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
    .rank-row { display: flex; justify-content: space-between; gap: 12px; font-size: 0.875rem; margin-bottom: 4px; }
    .rank-bar { display: block; height: 8px; border-radius: 999px; background: linear-gradient(90deg, var(--brand-200), var(--brand-100)); }
    .status-list li { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
  `,
})
export class ReportsComponent implements OnInit {
  private readonly api = inject(ReportService);
  private readonly live = inject(LiveRefreshService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload = new Subject<void>();

  readonly hours = signal(24);
  readonly kpis = signal<KpiResponse | null>(null);
  readonly sales = signal<HourlySales[]>([]);
  readonly top = signal<TopProduct[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');

  private readonly maxSales = computed(() => Math.max(0, ...this.sales().map((s) => s.sales)));
  private readonly maxQuantity = computed(() => Math.max(0, ...this.top().map((p) => p.quantity)));
  readonly salesInRange = computed(() => this.sales().reduce((sum, s) => sum + s.sales, 0));
  readonly ordersInRange = computed(() => this.sales().reduce((sum, s) => sum + s.orders, 0));
  readonly statuses = computed(() =>
    Object.entries(STATUS_LABELS).map(([key, label]) => ({ key, label, count: this.kpis()?.ordersByStatus?.[key] ?? 0 })),
  );

  ngOnInit(): void {
    // Polling cada 5 s; también al cambiar el rango, al pulsar Actualizar y tras cada cambio propio
    this.live.watch(
      this.destroyRef,
      () => forkJoin({ kpis: this.api.kpis(), sales: this.api.salesByHour(this.hours()), top: this.api.topProducts(5) }),
      {
        next: ({ kpis, sales, top }) => {
          this.kpis.set(kpis);
          this.sales.set(sales);
          this.top.set(top);
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

  changeHours(value: string): void {
    this.hours.set(Number(value));
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.reload.next();
  }

  barHeight(bar: HourlySales): number {
    return this.maxSales() > 0 ? Math.max(2, (bar.sales / this.maxSales()) * 100) : 2;
  }

  rankWidth(product: TopProduct): number {
    return this.maxQuantity() > 0 ? Math.max(4, (product.quantity / this.maxQuantity()) * 100) : 4;
  }
}
