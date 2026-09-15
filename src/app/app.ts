import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App implements OnInit {
  private readonly msal = inject(MsalService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Procesa la respuesta de Entra ID cuando volvemos a /auth/callback
    const onCallback = window.location.href.startsWith(environment.azure.redirectUri);
    this.msal.handleRedirectObservable({ navigateToLoginRequestUrl: false }).subscribe({
      next: (result) => {
        if (result?.account) {
          this.msal.instance.setActiveAccount(result.account);
        }
        if (onCallback) {
          this.router.navigateByUrl('/dashboard');
        }
      },
      error: (error) => {
        console.error('Error al procesar el login', error);
        this.router.navigateByUrl('/login');
      },
    });
  }
}
