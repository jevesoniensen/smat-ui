import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './Welcome.html',
  styles: [`
    :host {
      display: block;
    }
    .mt-50 { margin-top: 50px; }
    .text-center { text-align: center; }
  `]
})
export class WelcomeComponent {}
