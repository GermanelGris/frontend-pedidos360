import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { errorMessage } from '../../core/models';
import { MQ_NAME_PATTERN, MQ_ROUTING_KEY_PATTERN, MqAdminService, MqBinding } from '../../core/mq-admin.service';

@Component({
  selector: 'app-bindings-panel',
  imports: [FormsModule],
  template: `
    <form class="card" #form="ngForm" (ngSubmit)="form.valid && create()">
      <div class="card-header">
        <div class="card-title">
          <div>
            <h2>Nuevo binding</h2>
            <p class="card-subtitle">El exchange y la cola deben existir. En exchanges topic se admiten * y #.</p>
          </div>
        </div>
      </div>
      <div class="form-grid">
        <label>Exchange <input name="exchange" [(ngModel)]="model.exchange" required [pattern]="namePattern" placeholder="ex.demo" /></label>
        <label>Cola <input name="queue" [(ngModel)]="model.queue" required [pattern]="namePattern" placeholder="q.demo" /></label>
        <label>Routing key <input name="routingKey" [(ngModel)]="model.routingKey" maxlength="255" [pattern]="routingKeyPattern" placeholder="demo.#" /></label>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Crear binding</button>
      </div>
    </form>

    <div class="card card-table">
      <div class="card-header">
        <div class="card-title"><h2>Bindings</h2></div>
        <button class="btn btn-ghost" (click)="load()">Actualizar</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Exchange</th><th>Routing key</th><th>Cola</th><th></th></tr></thead>
          <tbody>
            @for (binding of bindings(); track binding.exchange + binding.queue + binding.routingKey) {
              <tr>
                <td class="mono">{{ binding.exchange }}</td>
                <td class="mono"><span class="chip chip-mono">{{ binding.routingKey || '(vacía)' }}</span></td>
                <td class="mono cell-strong">{{ binding.queue }}</td>
                <td class="num"><button class="btn btn-danger" (click)="remove(binding)">Eliminar</button></td>
              </tr>
            } @empty {
              <tr class="empty-row"><td colspan="4"><div class="empty"><p class="empty-title">No hay bindings</p></div></td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class BindingsPanelComponent implements OnInit {
  private readonly mq = inject(MqAdminService);

  readonly failed = output<string>();
  readonly done = output<string>();
  readonly bindings = signal<MqBinding[]>([]);
  readonly namePattern = MQ_NAME_PATTERN;
  readonly routingKeyPattern = MQ_ROUTING_KEY_PATTERN;

  model: MqBinding = { exchange: '', queue: '', routingKey: '' };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.mq.bindings().subscribe({
      next: (bindings) => this.bindings.set(bindings),
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }

  create(): void {
    this.mq.createBinding({ ...this.model, exchange: this.model.exchange.trim(), queue: this.model.queue.trim() }).subscribe({
      next: (binding) => {
        this.done.emit(`Binding ${binding.exchange} → ${binding.queue} creado`);
        this.model = { exchange: '', queue: '', routingKey: '' };
        this.load();
      },
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }

  remove(binding: MqBinding): void {
    if (!confirm(`¿Eliminar el binding ${binding.exchange} → ${binding.queue} (${binding.routingKey})?`)) {
      return;
    }
    this.mq.deleteBinding(binding).subscribe({
      next: () => {
        this.done.emit('Binding eliminado');
        this.load();
      },
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }
}
