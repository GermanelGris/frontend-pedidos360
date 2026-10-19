import { DestroyRef } from '@angular/core';
import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ASYNC_FOLLOW_UP_MS, liveRefreshInterceptor, LiveRefreshService, POLL_INTERVAL_MS } from './live-refresh.service';

describe('LiveRefreshService', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let live: LiveRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([liveRefreshInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    live = TestBed.inject(LiveRefreshService);
  });

  afterEach(() => httpMock.verify());

  it('avisa un cambio tras un POST exitoso a la API', () => {
    spyOn(live, 'notifyChange');

    http.post('/api/orders', {}).subscribe();
    httpMock.expectOne('/api/orders').flush({ id: 1 });

    expect(live.notifyChange).toHaveBeenCalledTimes(1);
  });

  it('no avisa en lecturas ni en peticiones fallidas', () => {
    spyOn(live, 'notifyChange');

    http.get('/api/orders').subscribe();
    httpMock.expectOne('/api/orders').flush([]);
    http.patch('/api/orders/1/status', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/orders/1/status').flush({ message: 'conflicto' }, { status: 409, statusText: 'Conflict' });

    expect(live.notifyChange).not.toHaveBeenCalled();
  });

  it('consulta al inicio, cada intervalo y tras un cambio propio (ahora y un momento después)', fakeAsync(() => {
    const destroyRef = TestBed.inject(DestroyRef);
    let calls = 0;

    spyOnProperty(document, 'hidden').and.returnValue(false);

    live.watch(destroyRef, () => of(++calls), { next: () => undefined, error: () => undefined });
    tick(0);
    expect(calls).toBe(1);

    tick(POLL_INTERVAL_MS);
    expect(calls).toBe(2);

    live.notifyChange();
    expect(calls).toBe(3);
    tick(ASYNC_FOLLOW_UP_MS);
    expect(calls).toBe(4);

    discardPeriodicTasks();
  }));
});
