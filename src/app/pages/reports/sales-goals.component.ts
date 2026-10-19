import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { errorMessage } from '../../core/models';
import { ReportService, SalesGoal } from '../../core/report.service';
import { GOAL_LIMITS, goalLevel } from './kpi-levels';

/** Fecha local en formato yyyy-MM-dd (lo que espera un input type="date"). */
function isoDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * KPI de metas de venta: formulario para agregar una meta (nombre, monto, rango de fechas) y un medidor
 * semicircular por meta con el avance real. Al crear o eliminar, el interceptor de refresco recarga la página.
 */
@Component({
  selector: 'app-sales-goals',
  imports: [FormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <article class="card kpi-card">
      <div class="card-title">
        <span class="kpi-icon tone-green" aria-hidden="true">
          <svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
        </span>
        <div>
          <h3>Metas de venta</h3>
          <span class="card-subtitle">Ventas reales del período (sin cancelados) frente a la meta</span>
        </div>
      </div>

      <form class="goal-form" (ngSubmit)="add()" #form="ngForm">
        <label class="field field-grow">
          Nombre
          <input name="name" [(ngModel)]="name" required maxlength="80" placeholder="Ventas de octubre" />
        </label>
        <label class="field">
          Meta ($)
          <input name="amount" type="number" min="1" step="1000" [(ngModel)]="amount" required />
        </label>
        <label class="field">
          Desde
          <input name="startDate" type="date" [(ngModel)]="startDate" required />
        </label>
        <label class="field">
          Hasta
          <input name="endDate" type="date" [(ngModel)]="endDate" required />
        </label>
        <button class="btn btn-primary" type="submit" [disabled]="saving() || form.invalid">
          <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Agregar meta
        </button>
      </form>
      @if (error()) {
        <p class="alert" role="alert">{{ error() }}</p>
      }

      <div class="goals">
        @for (goal of goals(); track goal.id) {
          <div class="goal" [title]="goal.name + ': ' + (goal.progressPercent | number: '1.0-1') + '% de la meta'">
            <svg class="gauge" viewBox="0 0 120 70" role="meter" aria-valuemin="0" aria-valuemax="100"
                 [attr.aria-valuenow]="goal.progressPercent" [attr.aria-valuetext]="(goal.progressPercent | number: '1.0-1') + '%, ' + level(goal).label">
              <path class="gauge-track" d="M10 62 A50 50 0 0 1 110 62" pathLength="100" />
              <path class="gauge-value tone-{{ level(goal).tone }}" d="M10 62 A50 50 0 0 1 110 62" pathLength="100"
                    [attr.stroke-dasharray]="arc(goal) + ' 100'" />
              <text x="60" y="56" text-anchor="middle" class="gauge-pct">{{ goal.progressPercent | number: '1.0-0' }}%</text>
            </svg>
            <div class="goal-body">
              <div class="goal-head">
                <strong>{{ goal.name }}</strong>
                <span class="status tone-{{ level(goal).tone }}">{{ level(goal).label }}</span>
              </div>
              <span class="goal-amounts">
                {{ goal.achieved | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }} de {{ goal.amount | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }}
              </span>
              <span class="muted goal-meta">
                @if (goal.achieved < goal.amount) {
                  Faltan {{ goal.amount - goal.achieved | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }} ·
                } @else {
                  Superada por {{ goal.achieved - goal.amount | currency: 'CLP' : 'symbol-narrow' : '1.0-0' }} ·
                }
                {{ goal.startDate | date: 'dd-MM-yyyy' }} al {{ goal.endDate | date: 'dd-MM-yyyy' }}
              </span>
            </div>
            <button class="btn btn-ghost btn-icon" type="button" (click)="remove(goal)" [attr.aria-label]="'Eliminar meta ' + goal.name" title="Eliminar meta">
              <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
            </button>
          </div>
        } @empty {
          <p class="muted">Aún no hay metas. Agrega la primera con el formulario.</p>
        }
      </div>

      <p class="scale-note">Rojo &lt; {{ limits.atRisk }}% (en riesgo) · amarillo {{ limits.atRisk }}–{{ limits.done - 1 }}% (en progreso) · verde ≥ {{ limits.done }}% (cumplida)</p>
    </article>
  `,
  styles: `
    .kpi-card { margin: 0; display: flex; flex-direction: column; gap: 14px; }
    .goal-form { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
    .goal-form input[type='number'] { width: 130px; }
    .goals { display: flex; flex-direction: column; gap: 12px; }
    .goal { display: flex; align-items: center; gap: 14px; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface-2); }
    .gauge { width: 112px; flex-shrink: 0; }
    .gauge-track, .gauge-value { fill: none; stroke-width: 12; stroke-linecap: round; }
    .gauge-track { stroke: var(--surface-3); }
    .gauge-value.tone-danger { stroke: var(--danger); }
    .gauge-value.tone-warn { stroke: var(--warn); }
    .gauge-value.tone-ok { stroke: var(--ok); }
    .gauge-pct { font-size: 18px; font-weight: 700; fill: var(--text); }
    .goal-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; font-size: 0.875rem; }
    .goal-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .goal-amounts { color: var(--text); font-variant-numeric: tabular-nums; }
    .goal-meta { font-size: 0.8125rem; }
    .status { font-size: 0.75rem; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid; }
    .status.tone-danger { color: var(--danger-700); background: var(--danger-bg); border-color: var(--danger-border); }
    .status.tone-warn { color: var(--warn-700); background: var(--warn-bg); border-color: var(--warn-border); }
    .status.tone-ok { color: var(--ok-700); background: var(--ok-bg); border-color: var(--ok-border); }
    .scale-note { margin: 0; font-size: 0.75rem; color: var(--muted); }
  `,
})
export class SalesGoalsComponent {
  private readonly api = inject(ReportService);

  readonly goals = input.required<SalesGoal[]>();
  readonly limits = GOAL_LIMITS;
  readonly saving = signal(false);
  readonly error = signal('');

  name = '';
  amount: number | null = null;
  startDate = isoDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  endDate = isoDate(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  level(goal: SalesGoal) {
    return goalLevel(goal.progressPercent);
  }

  /** Largo del arco (0–100): el medidor llega al tope al cumplir la meta; el % real se muestra en el centro. */
  arc(goal: SalesGoal): number {
    return Math.min(100, Math.max(goal.progressPercent > 0 ? 1 : 0, goal.progressPercent));
  }

  add(): void {
    if (!this.amount) {
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.api
      .createGoal({ name: this.name.trim(), amount: this.amount, startDate: this.startDate, endDate: this.endDate })
      .subscribe({
        next: () => {
          this.name = '';
          this.amount = null;
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(errorMessage(err));
          this.saving.set(false);
        },
      });
  }

  remove(goal: SalesGoal): void {
    if (!confirm(`¿Eliminar la meta "${goal.name}"?`)) {
      return;
    }
    this.api.deleteGoal(goal.id).subscribe({ error: (err) => this.error.set(errorMessage(err)) });
  }
}
