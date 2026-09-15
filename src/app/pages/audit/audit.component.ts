import { Component } from '@angular/core';

/** Placeholder: el timeline se alimenta desde ms-pedidos360-audit (Kafka) en una etapa posterior. */
@Component({
  selector: 'app-audit',
  template: `
    <header class="page-header">
      <div>
        <p class="eyebrow">Trazabilidad</p>
        <h1>Auditoría</h1>
        <p class="page-subtitle">Historial de eventos de negocio: quién hizo qué y cuándo.</p>
      </div>
      <span class="chip chip-lg">Próximamente</span>
    </header>

    <div class="soon-banner">
      <span class="soon-icon" aria-hidden="true">
        <svg class="i i-lg" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
      </span>
      <div>
        <strong>Módulo en construcción</strong>
        <p>Disponible en la próxima etapa: timeline de eventos de negocio desde ms-pedidos360-audit (Kafka).</p>
      </div>
    </div>

    <section class="card placeholder">
      <div class="card-header" style="margin-bottom: 0">
        <div>
          <h2>Timeline de eventos</h2>
          <p class="card-subtitle">Filtros: usuario · rango de fechas · tipo de evento</p>
        </div>
      </div>

      <div class="filter-pills" aria-hidden="true">
        <span class="filter-pill">
          <svg class="i i-sm" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></svg>
          Usuario
        </span>
        <span class="filter-pill">
          <svg class="i i-sm" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          Rango de fechas
        </span>
        <span class="filter-pill">
          <svg class="i i-sm" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
          Tipo de evento
        </span>
      </div>

      <ul class="timeline" aria-hidden="true">
        <li>
          <span class="timeline-dot tone-indigo"><svg class="i i-sm" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span>
          <div class="skeleton"><span style="width: 45%"></span><span style="width: 70%"></span></div>
        </li>
        <li>
          <span class="timeline-dot tone-amber"><svg class="i i-sm" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg></span>
          <div class="skeleton"><span style="width: 38%"></span><span style="width: 60%"></span></div>
        </li>
        <li>
          <span class="timeline-dot tone-green"><svg class="i i-sm" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg></span>
          <div class="skeleton"><span style="width: 52%"></span><span style="width: 44%"></span></div>
        </li>
      </ul>
    </section>
  `,
})
export class AuditComponent {}
