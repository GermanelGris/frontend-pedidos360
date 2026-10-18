import { Component, signal } from '@angular/core';

import { BindingsPanelComponent } from './bindings-panel.component';
import { ExchangesPanelComponent } from './exchanges-panel.component';
import { QueuesPanelComponent } from './queues-panel.component';
import { TestMessagePanelComponent } from './test-message-panel.component';

type Tab = 'queues' | 'exchanges' | 'bindings' | 'test';

/** Administración de RabbitMQ (solo Admin): colas, exchanges, bindings y mensajes de prueba. */
@Component({
  selector: 'app-messaging',
  imports: [QueuesPanelComponent, ExchangesPanelComponent, BindingsPanelComponent, TestMessagePanelComponent],
  template: `
    <header class="page-header">
      <div>
        <h1>Mensajería</h1>
        <p class="page-subtitle">Colas, exchanges y bindings de RabbitMQ · las marcadas "sistema" no se pueden eliminar.</p>
      </div>
    </header>

    <div class="filter-pills" role="tablist" style="margin-bottom: 20px">
      @for (item of tabs; track item.id) {
        <button type="button" role="tab" class="filter-pill" [class.active]="tab() === item.id"
                [attr.aria-selected]="tab() === item.id" (click)="select(item.id)">{{ item.label }}</button>
      }
    </div>

    @if (error()) {
      <p class="alert" role="alert"><span>{{ error() }}</span></p>
    }
    @if (notice()) {
      <p class="alert alert-ok" role="status"><span>{{ notice() }}</span></p>
    }

    @switch (tab()) {
      @case ('queues') { <app-queues-panel (failed)="fail($event)" (done)="ok($event)" /> }
      @case ('exchanges') { <app-exchanges-panel (failed)="fail($event)" (done)="ok($event)" /> }
      @case ('bindings') { <app-bindings-panel (failed)="fail($event)" (done)="ok($event)" /> }
      @case ('test') { <app-test-message-panel (failed)="fail($event)" (done)="ok($event)" /> }
    }
  `,
})
export class MessagingComponent {
  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'queues', label: 'Colas' },
    { id: 'exchanges', label: 'Exchanges' },
    { id: 'bindings', label: 'Bindings' },
    { id: 'test', label: 'Mensaje de prueba' },
  ];
  readonly tab = signal<Tab>('queues');
  readonly error = signal('');
  readonly notice = signal('');

  select(tab: Tab): void {
    this.tab.set(tab);
    this.error.set('');
    this.notice.set('');
  }

  fail(message: string): void {
    this.notice.set('');
    this.error.set(message);
  }

  ok(message: string): void {
    this.error.set('');
    this.notice.set(message);
  }
}
