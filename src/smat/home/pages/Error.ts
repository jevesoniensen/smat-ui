import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './Error.html',
  styles: [`
    :host {
      display: block;
    }
    .mt-100 { margin-top: 100px; }
    .text-center { text-align: center; }
  `]
})
export class ErrorComponent {}
