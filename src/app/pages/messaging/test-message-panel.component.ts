import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { errorMessage } from '../../core/models';
import { MQ_NAME_PATTERN, MQ_ROUTING_KEY_PATTERN, MqAdminService } from '../../core/mq-admin.service';

interface Preset {
  label: string;
  routingKey: string;
  type: string;
  payload: Record<string, unknown>;
}

const PRESETS: Preset[] = [
  { label: 'Email OK', routingKey: 'email.send', type: 'EmailNotification', payload: { orderId: 1, status: 'ACEPTADO', customerName: 'Demo' } },
  { label: 'Email: falla temporal (reintentos → DLQ)', routingKey: 'email.send', type: 'EmailNotification', payload: { orderId: 1, status: 'ACEPTADO', simulateFailure: 'transient' } },
  { label: 'Cocina: falla no recuperable (DLQ inmediata)', routingKey: 'kitchen.ticket', type: 'KitchenTicket', payload: { orderId: 1, items: [], simulateFailure: 'fatal' } },
  { label: 'Boleta sin campo "total" (DLQ inmediata)', routingKey: 'invoice.gen', type: 'InvoiceGeneration', payload: { orderId: 1 } },
];

@Component({
  selector: 'app-test-message-panel',
  imports: [FormsModule],
  template: `
    <form class="card" #form="ngForm" (ngSubmit)="form.valid && publish()">
      <div class="card-header">
        <div class="card-title">
          <div>
            <h2>Publicar mensaje de prueba</h2>
            <p class="card-subtitle">
              Se envía con el envelope del sistema (type, eventId, traceId...). Con
              <code>"simulateFailure": "transient"</code> o <code>"fatal"</code> se prueban los reintentos y la DLQ.
              El resultado se ve en los logs de ms-pedidos360-notify y en el contador de mensajes de cada cola.
            </p>
          </div>
        </div>
      </div>
      <div class="filter-pills">
        @for (preset of presets; track preset.label) {
          <button type="button" class="filter-pill" (click)="apply(preset)">{{ preset.label }}</button>
        }
      </div>
      <div class="form-grid">
        <label>Exchange <input name="exchange" [(ngModel)]="exchange" required [pattern]="namePattern" /></label>
        <label>Routing key <input name="routingKey" [(ngModel)]="routingKey" required [pattern]="routingKeyPattern" /></label>
        <label>Tipo <input name="type" [(ngModel)]="type" maxlength="100" /></label>
        <label class="full">Payload (JSON) <textarea name="payload" rows="5" class="mono" [(ngModel)]="payload" required></textarea></label>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">Publicar</button>
      </div>
    </form>
  `,
})
export class TestMessagePanelComponent {
  private readonly mq = inject(MqAdminService);

  readonly failed = output<string>();
  readonly done = output<string>();
  readonly presets = PRESETS;
  readonly namePattern = MQ_NAME_PATTERN;
  readonly routingKeyPattern = MQ_ROUTING_KEY_PATTERN;

  exchange = 'cmd.direct';
  routingKey = PRESETS[0].routingKey;
  type = PRESETS[0].type;
  payload = JSON.stringify(PRESETS[0].payload, null, 2);

  apply(preset: Preset): void {
    this.routingKey = preset.routingKey;
    this.type = preset.type;
    this.payload = JSON.stringify(preset.payload, null, 2);
  }

  publish(): void {
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(this.payload);
    } catch {
      this.failed.emit('El payload no es un JSON válido');
      return;
    }
    this.mq.publish({ exchange: this.exchange, routingKey: this.routingKey, type: this.type, payload }).subscribe({
      next: (result) => this.done.emit(`Mensaje ${result.eventId} publicado en ${result.exchange} (${result.routingKey})`),
      error: (err) => this.failed.emit(errorMessage(err)),
    });
  }
}
