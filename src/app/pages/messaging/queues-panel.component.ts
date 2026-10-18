import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { errorMessage } from '../../core/models';
import { CreateQueueRequest, MQ_NAME_PATTERN, MQ_ROUTING_KEY_PATTERN, MqAdminService, MqQueue } from '../../core/mq-admin.service';

@Component({
  selector: 'app-queues-panel',
  imports: [FormsModule],
  template: `
    <form class="card" #form="ngForm" (ngSubmit)="form.valid && create()">
      <div class="card-header">
        <div class="card-title">
          <div>
            <h2>Nueva cola</h2>
            <p class="card-subtitle">Letras, números, '.', '_' y '-'. No puede comenzar con 'amq.'.</p>
          </div>
        </div>
      </div>
      <div class="form-grid">
        <label>Nombre <input name="name" [(ngModel)]="model.name" required maxlength="200" [pattern]="namePattern" placeholder="q.demo" /></label>
        <label>Dead-letter exchange <input name="dlx" [(ngModel)]="model.deadLetterExchange" maxlength="200" [pattern]="namePattern" placeholder="cmd.dead.dlx (opcional)" /></label>
        <label>Dead-letter routing key <input name="dlrk" [(ngModel)]="model.deadLetterRoutingKey" maxlength="255" [pattern]="routingKeyPattern" placeholder="opcional" /></label>
        <label>TTL de mensajes (ms) <input name="ttl" type="number" min="1" max="86400000" [(ngModel)]="model.messageTtlMs" placeholder="opcional" /></label>
        <label>Máx. mensajes <input name="max" type="number" min="1" max="1000000" [(ngModel)]="model.maxLength" placeholder="opcional" /></label>
        <label class="checkbox"><input class="switch" name="durable" type="checkbox" [(ngModel)]="model.durable" /> Durable</label>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Crear cola</button>
      </div>
    </form>

    <div class="card card-table">
      <div class="card-header">
        <div class="card-title"><h2>Colas</h2></div>
        <button class="btn btn-ghost" (click)="load()">Actualizar</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th class="num">Mensajes</th><th class="num">Consumidores</th><th>Argumentos</th><th></th></tr>
          </thead>
          <tbody>
            @for (queue of queues(); track queue.name) {
              <tr>
                <td class="mono cell-strong">
                  {{ queue.name }}
                  @if (queue.protectedResource) { <span class="chip chip-muted">sistema</span> }
                </td>
                <td class="num"><span class="count-pill">{{ queue.messages }}</span></td>
                <td class="num">{{ queue.consumers }}</td>
                <td class="cell-muted mono small">{{ describe(queue) }}</td>
                <td class="num">
                  <button class="btn btn-ghost" [disabled]="queue.messages === 0" (click)="purge(queue)">Vaciar</button>
                  @if (!queue.protectedResource) {
                    <button class="btn btn-danger" (click)="remove(queue)">Eliminar</button>
                  }
                </td>
              </tr>
            } @empty {
              <tr class="empty-row"><td colspan="5"><div class="empty"><p class="empty-title">No hay colas</p></div></td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class QueuesPanelComponent implements OnInit {
  private readonly mq = inject(MqAdminService);

  readonly failed = output<string>();
  readonly done = output<string>();
  readonly queues = signal<MqQueue[]>([]);
  readonly namePattern = MQ_NAME_PATTERN;
  readonly routingKeyPattern = MQ_ROUTING_KEY_PATTERN;

  model: CreateQueueRequest = this.empty();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.mq.queues().subscribe({
      next: (queues) => this.queues.set(queues),
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }

  create(): void {
    const request: CreateQueueRequest = {
      name: this.model.name.trim(),
      durable: this.model.durable,
      deadLetterExchange: this.model.deadLetterExchange || undefined,
      deadLetterRoutingKey: this.model.deadLetterRoutingKey || undefined,
      messageTtlMs: this.model.messageTtlMs || undefined,
      maxLength: this.model.maxLength || undefined,
    };
    this.mq.createQueue(request).subscribe({
      next: (queue) => {
        this.done.emit(`Cola ${queue.name} creada`);
        this.model = this.empty();
        this.load();
      },
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }

  purge(queue: MqQueue): void {
    if (!confirm(`¿Vaciar los ${queue.messages} mensaje(s) de ${queue.name}?`)) {
      return;
    }
    this.mq.purgeQueue(queue.name).subscribe({
      next: (result) => {
        this.done.emit(`${result.purgedMessages} mensaje(s) eliminados de ${result.queue}`);
        this.load();
      },
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }

  remove(queue: MqQueue): void {
    if (!confirm(`¿Eliminar la cola ${queue.name}?`)) {
      return;
    }
    this.mq.deleteQueue(queue.name).subscribe({
      next: () => {
        this.done.emit(`Cola ${queue.name} eliminada`);
        this.load();
      },
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }

  describe(queue: MqQueue): string {
    const args = Object.entries(queue.arguments ?? {});
    return args.length ? args.map(([key, value]) => `${key.replace('x-', '')}=${value}`).join(' · ') : '—';
  }

  private empty(): CreateQueueRequest {
    return { name: '', durable: true };
  }
}
