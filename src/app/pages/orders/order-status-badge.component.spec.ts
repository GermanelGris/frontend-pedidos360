import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStatusBadgeComponent } from './order-status-badge.component';

describe('OrderStatusBadgeComponent', () => {
  let fixture: ComponentFixture<OrderStatusBadgeComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderStatusBadgeComponent);
  });

  it('muestra la etiqueta y el estilo del estado', () => {
    fixture.componentRef.setInput('status', 'EN_PREPARACION');
    fixture.detectChanges();

    const badge: HTMLElement = fixture.nativeElement.querySelector('.badge');
    expect(badge.textContent?.trim()).toBe('En preparación');
    expect(badge.classList).toContain('status-en_preparacion');
  });
});
