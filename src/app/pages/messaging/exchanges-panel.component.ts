import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { errorMessage } from '../../core/models';
import { CreateExchangeRequest, EXCHANGE_TYPES, MQ_NAME_PATTERN, MqAdminService, MqExchange } from '../../core/mq-admin.service';

@Component({
  selector: 'app-exchanges-panel',
  imports: [FormsModule],
  template: `
    <form class="card" #form="ngForm" (ngSubmit)="form.valid && create()">
      <div class="card-header">
        <div class="card-title"><h2>Nuevo exchange</h2></div>
      </div>
      <div class="form-grid">
        <label>Nombre <input name="name" [(ngModel)]="model.name" required maxlength="200" [pattern]="namePattern" placeholder="ex.demo" /></label>
        <label>Tipo
          <select name="type" [(ngModel)]="model.type" required>
            @for (type of types; track type) { <option [value]="type">{{ type }}</option> }
          </select>
        </label>
        <label class="checkbox"><input class="switch" name="durable" type="checkbox" [(ngModel)]="model.durable" /> Durable</label>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Crear exchange</button>
      </div>
    </form>

    <div class="card card-table">
      <div class="card-header">
        <div class="card-title"><h2>Exchanges</h2></div>
        <button class="btn btn-ghost" (click)="load()">Actualizar</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nombre</th><th>Tipo</th><th>Durable</th><th></th></tr></thead>
          <tbody>
            @for (exchange of exchanges(); track exchange.name) {
              <tr>
                <td class="mono cell-strong">
                  {{ exchange.name }}
                  @if (exchange.protectedResource) { <span class="chip chip-muted">sistema</span> }
                </td>
                <td><span class="chip">{{ exchange.type }}</span></td>
                <td>{{ exchange.durable ? 'Sí' : 'No' }}</td>
                <td class="num">
                  @if (!exchange.protectedResource) {
                    <button class="btn btn-danger" (click)="remove(exchange)">Eliminar</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr class="empty-row"><td colspan="4"><div class="empty"><p class="empty-title">No hay exchanges</p></div></td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class ExchangesPanelComponent implements OnInit {
  private readonly mq = inject(MqAdminService);

  readonly failed = output<string>();
  readonly done = output<string>();
  readonly exchanges = signal<MqExchange[]>([]);
  readonly types = EXCHANGE_TYPES;
  readonly namePattern = MQ_NAME_PATTERN;

  model: CreateExchangeRequest = { name: '', type: 'direct', durable: true };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.mq.exchanges().subscribe({
      next: (exchanges) => this.exchanges.set(exchanges),
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }

  create(): void {
    this.mq.createExchange({ ...this.model, name: this.model.name.trim() }).subscribe({
      next: (exchange) => {
        this.done.emit(`Exchange ${exchange.name} (${exchange.type}) creado`);
        this.model = { name: '', type: 'direct', durable: true };
        this.load();
      },
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }

  remove(exchange: MqExchange): void {
    if (!confirm(`¿Eliminar el exchange ${exchange.name}? Se eliminan también sus bindings.`)) {
      return;
    }
    this.mq.deleteExchange(exchange.name).subscribe({
      next: () => {
        this.done.emit(`Exchange ${exchange.name} eliminado`);
        this.load();
      },
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }
}
