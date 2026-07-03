import { Component, Input, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MenuItem } from '../../../types/models';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatExpansionModule],
  templateUrl: './Menu.html',
  styles: [`
    :host {
      display: block;
    }
    .mat-expansion-panel-header {
      font-family: Verdana, sans-serif;
      font-size: 11px;
      height: 40px !important;
    }
    .submenu {
      padding-left: 16px;
    }
    .active {
      font-weight: bold;
      background: rgba(0, 0, 0, 0.04);
    }
    ::ng-deep .mat-expansion-panel-body {
      padding: 0 !important;
    }
    a[mat-list-item] {
      font-family: Verdana, sans-serif;
      font-size: 11px;
      height: 40px;
    }
  `]
})
export class MenuComponent {
  @Input() items: MenuItem[] = [];
  @Output() onItemClick = new EventEmitter<void>();

  openSubmenuId = signal<string | null>(null);

  toggleSubmenu(id: string) {
    this.openSubmenuId.set(this.openSubmenuId() === id ? null : id);
  }

  getSafePath(path: string | undefined): string {
    let safePath = path || '#';
    if (safePath !== '#' && !safePath.startsWith('/')) {
      safePath = '/' + safePath;
    }
    if (safePath.startsWith('//')) {
      safePath = safePath.replace(/^\/+/, '/');
    }
    return safePath;
  }
}
