import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <main class="login">
      <section class="login-hero">
        <div class="login-hero-inner">
          <div class="brand">
            <span class="brand-mark">
              <svg class="i" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
            </span>
            <span class="brand-name">Pedidos<em>360</em></span>
          </div>

          <div>
            <span class="hero-pill"><b>Nuevo</b> Seguimiento de pedidos de punta a punta</span>
            <h1 class="hero-title">Todos tus pedidos,<br /><span>en una sola vista.</span></h1>
            <p class="hero-text">
              Recibe, prepara y despacha pedidos con trazabilidad completa: catálogo, stock y estados siempre al día.
            </p>

            <ul class="hero-points">
              <li>
                <span class="hero-point-icon">
                  <svg class="i" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                </span>
                <div>
                  <strong>Seguimiento en tiempo real</strong>
                  <span>Del pedido creado a la entrega, con cada cambio de estado.</span>
                </div>
              </li>
              <li>
                <span class="hero-point-icon">
                  <svg class="i" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="M3.3 7 12 12l8.7-5M12 22V12" /></svg>
                </span>
                <div>
                  <strong>Catálogo y stock al día</strong>
                  <span>Productos, precios y alertas de stock bajo.</span>
                </div>
              </li>
              <li>
                <span class="hero-point-icon">
                  <svg class="i" viewBox="0 0 24 24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
                </span>
                <div>
                  <strong>Acceso por roles</strong>
                  <span>Admin, Operador y Cliente, con permisos asignados desde Entra ID.</span>
                </div>
              </li>
            </ul>
          </div>

          <div>
            <div class="hero-preview">
              <span class="product-initial">P</span>
              <div>
                <strong>Pedido #1024</strong>
                <span class="muted">Pizza napolitana × 2 · Bebida × 2</span>
              </div>
              <span class="badge status-en_preparacion">En preparación</span>
            </div>
            <p class="hero-foot" style="margin-top: 20px">Pedidos360 · Plataforma de gestión de pedidos</p>
          </div>
        </div>
      </section>

      <section class="login-panel">
        <div class="login-card">
          <div class="brand">
            <span class="brand-mark" aria-hidden="true">
              <svg class="i" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
            </span>
            <span class="brand-name">Pedidos<em>360</em></span>
          </div>

          <p class="eyebrow">Acceso a la plataforma</p>
          <h2>Bienvenido de vuelta</h2>
          <p class="page-subtitle">Gestión de pedidos, catálogo y seguimiento. Inicia sesión con tu cuenta corporativa para continuar.</p>

          <button class="btn btn-ms btn-lg btn-block" (click)="auth.login()">
            <svg viewBox="0 0 21 21" aria-hidden="true">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            Iniciar sesión con Microsoft
          </button>

          <div class="login-divider">Acceso seguro</div>

          <div class="login-note">
            <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
            <p>
              <strong>Microsoft Entra ID</strong>
              Autenticación corporativa con Microsoft Entra ID (MSAL). Tus permisos (Admin, Operador o Cliente) se leen desde el token.
            </p>
          </div>
        </div>

        <div class="login-legal">
          <span class="chip chip-muted">OAuth 2.0</span>
          <span class="chip chip-muted">OpenID Connect</span>
          <span class="chip chip-muted">PKCE</span>
        </div>
      </section>
    </main>
  `,
})
export class LoginComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.auth.activeAccount()) {
      this.router.navigateByUrl('/dashboard');
    }
  }
}
