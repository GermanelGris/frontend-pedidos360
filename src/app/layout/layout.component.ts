import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AppRole, AuthService } from '../auth/auth.service';

interface MenuItem {
  path: string;
  label: string;
  roles: AppRole[];
}

const MENU: MenuItem[] = [
  { path: '/dashboard', label: 'Inicio', roles: ['Admin', 'Operador', 'Cliente'] },
  { path: '/orders', label: 'Pedidos', roles: ['Admin', 'Operador', 'Cliente'] },
  { path: '/catalog', label: 'Catálogo', roles: ['Admin', 'Operador'] },
  { path: '/reports', label: 'Reportería', roles: ['Admin'] },
  { path: '/audit', label: 'Auditoría', roles: ['Admin'] },
];

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" routerLink="/dashboard" aria-label="Pedidos360 · Inicio">
          <span class="brand-mark" aria-hidden="true">
            <svg class="i" viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 4v5h-5" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
          </span>
          <span>
            <span class="brand-name">Pedidos<em>360</em></span>
            <span class="brand-tag">Gestión de pedidos</span>
          </span>
        </a>

        <p class="nav-label">Menú</p>
        <nav class="nav" aria-label="Navegación principal">
          @for (item of menu(); track item.path) {
            <a [routerLink]="item.path" routerLinkActive="active">
              @switch (item.path) {
                @case ('/dashboard') {
                  <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>
                }
                @case ('/orders') {
                  <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" /></svg>
                }
                @case ('/catalog') {
                  <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
                }
                @case ('/reports') {
                  <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18" /><path d="M18 17V9M13 17V5M8 17v-3" /></svg>
                }
                @default {
                  <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
                }
              }
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-foot">
          <span class="foot-icon" aria-hidden="true">
            <svg class="i i-sm" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </span>
          <div>
            <strong>Sesión segura</strong>
            <span>Microsoft Entra ID · OAuth 2.0</span>
          </div>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <div class="crumbs">
            <span>Pedidos360</span>
            <svg class="i i-sm" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
            @for (item of menu(); track item.path) {
              <a class="crumb" [routerLink]="item.path" routerLinkActive="current">{{ item.label }}</a>
            }
          </div>

          <div class="user">
            @if (auth.claims(); as user) {
              <div class="user-meta">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-roles">
                  @for (role of user.roles; track role) {
                    <span class="chip">{{ role }}</span>
                  } @empty {
                    <span class="chip chip-warn">Sin rol</span>
                  }
                </span>
              </div>
              @let parts = user.name.trim().split(' ');
              <span class="avatar" aria-hidden="true">{{ parts[0].charAt(0) }}{{ parts.length > 1 ? parts[parts.length - 1].charAt(0) : '' }}</span>
              <span class="topbar-divider" aria-hidden="true"></span>
            }
            <button class="btn btn-ghost btn-icon" (click)="auth.logout()" aria-label="Cerrar sesión" title="Cerrar sesión">
              <svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>
            </button>
          </div>
        </header>

        <main class="content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class LayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly menu = computed(() => MENU.filter((item) => this.auth.hasAnyRole(...item.roles)));

  ngOnInit(): void {
    this.auth.loadClaims();
  }
}
