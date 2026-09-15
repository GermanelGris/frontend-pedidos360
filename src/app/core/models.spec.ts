import { HttpErrorResponse } from '@angular/common/http';

import { errorMessage } from './models';

describe('errorMessage', () => {
  it('usa el mensaje que devuelve el backend', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { status: 409, message: 'Transición inválida CREADO -> DESPACHADO' },
    });
    expect(errorMessage(error)).toBe('409 - Transición inválida CREADO -> DESPACHADO');
  });

  it('explica cuando la API no responde', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('No se pudo conectar');
  });

  it('entrega un mensaje genérico para errores no HTTP', () => {
    expect(errorMessage(new Error('x'))).toBe('Error inesperado');
  });
});
