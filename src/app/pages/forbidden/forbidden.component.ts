import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <main class="center-page">
      <section class="status-card">
        <div class="status-icon" aria-hidden="true">
          <svg class="i" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        </div>
        <p class="eyebrow" style="color: var(--danger)">Error 403</p>
        <h1>Acceso denegado</h1>
        <p>Tu rol ({{ auth.roles().join(', ') || 'sin rol asignado' }}) no tiene permiso para ver esta sección.</p>
        @if (auth.activeAccount(); as account) {
          <p class="muted small">Sesión iniciada como <strong>{{ account.username }}</strong></p>
        }
        <div class="form-row" style="justify-content: center">
          <a class="btn btn-primary" routerLink="/dashboard">
            <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 19-7-7 7-7M19 12H5" /></svg>
            Volver al inicio
          </a>
          <button type="button" class="btn" (click)="auth.logout()">
            <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
            Cerrar sesión
          </button>
        </div>
      </section>
    </main>
  `,
})
export class ForbiddenComponent {
  readonly auth = inject(AuthService);
}
