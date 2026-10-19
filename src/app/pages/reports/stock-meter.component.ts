import { Component, computed, input } from '@angular/core';

import { Product } from '../../core/models';
import { Level, STOCK_LIMITS, stockLevel, Tone, TONE_ORDER } from './kpi-levels';

interface StockRow {
  product: Product;
  level: Level;
}

/** Bandas del medidor (en unidades): rojo, amarillo, verde, amarillo, rojo. */
const BANDS: { from: number; to: number | null; tone: Tone }[] = [
  { from: 0, to: STOCK_LIMITS.empty, tone: 'danger' },
  { from: STOCK_LIMITS.empty, to: STOCK_LIMITS.low + 1, tone: 'warn' },
  { from: STOCK_LIMITS.low + 1, to: STOCK_LIMITS.high, tone: 'ok' },
  { from: STOCK_LIMITS.high, to: STOCK_LIMITS.max, tone: 'warn' },
  { from: STOCK_LIMITS.max, to: null, tone: 'danger' },
];

/** KPI de stock: un medidor rojo / amarillo / verde por producto activo, con lo que requiere atención primero. */
@Component({
  selector: 'app-stock-meter',
  template: `
    <article class="card kpi-card">
      <div class="card-title">
        <span class="kpi-icon tone-amber" aria-hidden="true">
          <svg class="i" viewBox="0 0 24 24"><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>
        </span>
        <div>
          <h3>Stock por producto</h3>
          <span class="card-subtitle">Productos activos del catálogo · lo que requiere atención aparece primero</span>
        </div>
      </div>

      <div class="tally" role="list">
        @for (t of tally(); track t.label) {
          <span class="tally-item tone-{{ t.tone }}" role="listitem">
            <span class="dot" aria-hidden="true"></span>{{ t.label }} <strong>{{ t.count }}</strong>
          </span>
        }
      </div>

      <ul class="meters">
        @for (row of rows(); track row.product.id) {
          <li [title]="row.product.name + ': ' + row.product.stock + ' unidades · ' + row.level.label">
            <div class="meter-head">
              <span class="meter-name">{{ row.product.name }}</span>
              <span class="status tone-{{ row.level.tone }}">
                @switch (row.level.tone) {
                  @case ('danger') { <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg> }
                  @case ('warn') { <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20z" /><path d="M12 10v4M12 17h.01" /></svg> }
                  @default { <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></svg> }
                }
                {{ row.level.label }}
              </span>
              <span class="meter-value">{{ row.product.stock }} <small>u</small></span>
            </div>
            <div class="track" role="meter" [attr.aria-valuenow]="row.product.stock" aria-valuemin="0"
                 [attr.aria-valuemax]="scaleMax()" [attr.aria-valuetext]="row.product.stock + ' unidades, ' + row.level.label">
              @for (band of bands; track band.from) {
                <span class="band tone-{{ band.tone }}" [style.left.%]="pct(band.from)" [style.width.%]="pct(band.to ?? scaleMax()) - pct(band.from)"></span>
              }
              <span class="marker" [style.left.%]="pct(row.product.stock)"></span>
            </div>
          </li>
        } @empty {
          <li class="muted">No hay productos activos en el catálogo.</li>
        }
      </ul>

      <p class="scale-note">
        Rojo &lt; {{ limits.empty }} (sin stock) · amarillo {{ limits.empty }}–{{ limits.low }} · verde {{ limits.low + 1 }}–{{ limits.high - 1 }} ·
        amarillo {{ limits.high }}–{{ limits.max - 1 }} (stock alto) · rojo ≥ {{ limits.max }} (sobrestock)
      </p>
    </article>
  `,
  styles: `
    .kpi-card { margin: 0; display: flex; flex-direction: column; gap: 14px; }
    .tally { display: flex; flex-wrap: wrap; gap: 8px; }
    .tally-item { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 999px; font-size: 0.8125rem; border: 1px solid var(--border); color: var(--text-2); background: var(--surface-2); }
    .tally-item strong { color: var(--text); }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .tally-item.tone-danger .dot { background: var(--danger); }
    .tally-item.tone-warn .dot { background: var(--warn); }
    .tally-item.tone-ok .dot { background: var(--ok); }
    .meters { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; max-height: 420px; overflow-y: auto; }
    .meter-head { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; margin-bottom: 6px; }
    .meter-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text); }
    .meter-value { font-weight: 600; color: var(--text); font-variant-numeric: tabular-nums; min-width: 52px; text-align: right; }
    .status { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; padding: 1px 8px; border-radius: 999px; border: 1px solid; }
    .status.tone-danger { color: var(--danger-700); background: var(--danger-bg); border-color: var(--danger-border); }
    .status.tone-warn { color: var(--warn-700); background: var(--warn-bg); border-color: var(--warn-border); }
    .status.tone-ok { color: var(--ok-700); background: var(--ok-bg); border-color: var(--ok-border); }
    .track { position: relative; height: 10px; border-radius: 999px; overflow: hidden; background: var(--surface-3); }
    .band { position: absolute; top: 0; bottom: 0; opacity: 0.35; border-right: 2px solid var(--surface); }
    .band.tone-danger { background: var(--danger); }
    .band.tone-warn { background: var(--warn); }
    .band.tone-ok { background: var(--ok); }
    .marker { position: absolute; top: -1px; bottom: -1px; width: 4px; margin-left: -2px; border-radius: 2px; background: var(--text); box-shadow: 0 0 0 2px var(--surface); }
    .scale-note { margin: 0; font-size: 0.75rem; color: var(--muted); }
  `,
})
export class StockMeterComponent {
  readonly products = input.required<Product[]>();

  readonly limits = STOCK_LIMITS;
  readonly bands = BANDS;

  /** Escala del medidor: al menos hasta 160 u; si un producto supera eso, se amplía para que el marcador quepa. */
  readonly scaleMax = computed(() =>
    Math.max(STOCK_LIMITS.max + 10, ...this.products().filter((p) => p.active).map((p) => Math.ceil(p.stock * 1.05))),
  );

  readonly rows = computed<StockRow[]>(() =>
    this.products()
      .filter((p) => p.active)
      .map((product) => ({ product, level: stockLevel(product.stock) }))
      .sort((a, b) => TONE_ORDER[a.level.tone] - TONE_ORDER[b.level.tone] || a.product.stock - b.product.stock),
  );

  readonly tally = computed(() => {
    const count = (label: string) => this.rows().filter((r) => r.level.label === label).length;
    return [
      { label: 'Sin stock', tone: 'danger', count: count('Sin stock') },
      { label: 'Stock bajo', tone: 'warn', count: count('Stock bajo') },
      { label: 'Normal', tone: 'ok', count: count('Normal') },
      { label: 'Stock alto', tone: 'warn', count: count('Stock alto') },
      { label: 'Sobrestock', tone: 'danger', count: count('Sobrestock') },
    ];
  });

  pct(units: number): number {
    return Math.min(100, Math.max(0, (units / this.scaleMax()) * 100));
  }
}
