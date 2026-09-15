import { Component } from '@angular/core';

/** MSAL redirige aquí tras el login. App procesa la respuesta y navega al dashboard. */
@Component({
  selector: 'app-callback',
  template: `
    <main class="center-page">
      <section class="status-card" role="status" aria-live="polite">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
          </span>
          <span class="brand-name">Pedidos<em>360</em></span>
        </div>
        <div class="spinner" aria-hidden="true"></div>
        <h1>Procesando inicio de sesión…</h1>
        <p>Validando tu identidad con Microsoft Entra ID. Serás redirigido en un momento.</p>
      </section>
    </main>
  `,
})
export class CallbackComponent {}
