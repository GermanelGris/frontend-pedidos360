import { Component } from '@angular/core';

/** Placeholder: los KPIs en tiempo real llegan desde ms-pedidos360-report (Kafka) en una etapa posterior. */
@Component({
  selector: 'app-reports',
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Analítica</p>
        <h1>Reportería y KPIs</h1>
        <p class="page-subtitle">Indicadores de ventas y operación en tiempo real.</p>
      </div>
      <span class="chip chip-lg">Próximamente</span>
    </header>

    <div class="soon-banner">
      <span class="soon-icon" aria-hidden="true">
        <svg class="i i-lg" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
      </span>
      <div>
        <strong>Módulo en construcción</strong>
        <p>Disponible en la próxima etapa: datos por streaming (Kafka) desde ms-pedidos360-report.</p>
      </div>
    </div>

    <section class="grid">
      <article class="card soon-card">
        <div class="card-title">
          <span class="kpi-icon tone-green" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></svg>
          </span>
          <div>
            <h3>Ventas por hora</h3>
            <span class="soon-code">SalesChart · Ventas por hora</span>
          </div>
        </div>
        <div class="mini-chart" aria-hidden="true">
          <span style="--h: 35%"></span><span style="--h: 55%"></span><span style="--h: 42%"></span><span style="--h: 70%"></span>
          <span style="--h: 88%"></span><span style="--h: 64%"></span><span style="--h: 76%"></span><span style="--h: 50%"></span>
        </div>
      </article>

      <article class="card soon-card">
        <div class="card-title">
          <span class="kpi-icon tone-sky" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          </span>
          <div>
            <h3>Lead time</h3>
            <span class="soon-code">LeadTimeChart · Lead time</span>
          </div>
        </div>
        <div class="mini-line" aria-hidden="true">
          <svg viewBox="0 0 200 96" preserveAspectRatio="none">
            <defs>
              <linearGradient id="lt-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stop-color="#818cf8" stop-opacity="0.3" />
                <stop offset="1" stop-color="#818cf8" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 70 L25 60 L50 64 L75 44 L100 50 L125 32 L150 38 L175 24 L200 28 L200 96 L0 96 Z" fill="url(#lt-fill)" />
            <path d="M0 70 L25 60 L50 64 L75 44 L100 50 L125 32 L150 38 L175 24 L200 28" fill="none" stroke="#a5b4fc" stroke-width="2.5" vector-effect="non-scaling-stroke" />
          </svg>
        </div>
      </article>

      <article class="card soon-card">
        <div class="card-title">
          <span class="kpi-icon tone-amber" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
          </span>
          <div>
            <h3>Productos más vendidos</h3>
            <span class="soon-code">TopProductsChart · Productos más vendidos</span>
          </div>
        </div>
        <div class="mini-rank" aria-hidden="true">
          <span style="--w: 92%"></span><span style="--w: 74%"></span><span style="--w: 58%"></span><span style="--w: 40%"></span><span style="--w: 26%"></span>
        </div>
      </article>
    </section>
  `,
})
export class ReportsComponent {}
