import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MenuComponent } from './Menu';
import { AuthService } from '../services/AuthService';
import { SessionService } from '../../auth/services/SessionService';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule, 
    MenuComponent,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './Layout.html',
  styles: [`
    .main-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    mat-sidenav-container {
      flex: 1;
    }
    mat-sidenav {
      width: 250px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    mat-toolbar {
      padding: 0 !important;
      height: 93px !important;
      background-image: url('/assets/images/index/backgrd_top.gif');
      background-repeat: repeat-x;
      border-bottom: 2px solid #516B86;
      color: #333; /* Dark text for better contrast against light background */
    }
    .toolbar-logo {
      height: 93px;
      display: flex;
      align-items: center;
      margin: 0;
      padding: 0;
    }
    .toolbar-logo img {
      height: 93px;
      width: 774px;
      vertical-align: middle;
      margin: 0;
      padding: 0;
      display: block;
    }
    .user-info-text {
      font-size: 14px;
      margin-right: 16px;
      font-weight: 500;
    }
  `]
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private sessionService = inject(SessionService);
  private router = inject(Router);

  user = computed(() => this.sessionService.usuario());
  menu = computed(() => this.sessionService.menu());
  isMobileMenuOpen = signal(false);

  constructor() {
    // Initial check from localStorage if service is empty (e.g. page refresh)
    if (!this.sessionService.usuario()) {
        const userStr = localStorage.getItem('usuario');
        const menuStr = localStorage.getItem('menu');
        
        if (userStr) this.sessionService.setUsuario(JSON.parse(userStr));
        if (menuStr) this.sessionService.setMenu(JSON.parse(menuStr));
    }

    if (!this.sessionService.usuario() && !this.authService.isAuthenticated()) {
        this.router.navigate(['/login']);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  async handleLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
