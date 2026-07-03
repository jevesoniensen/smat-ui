import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './AccessDenied.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AccessDeniedComponent {}
