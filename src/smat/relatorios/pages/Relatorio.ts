import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-relatorio-view',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './Relatorio.html',
  styles: [`
    .report-container {
      background: white;
      padding: 20px;
    }
    .text-center { text-align: center; }
    .mb-20 { margin-bottom: 20px; }
    .mb-30 { margin-bottom: 30px; }
    .mt-50 { margin-top: 50px; }
    .w-100 { width: 100%; }
    .no-print {
      @media print {
        display: none;
      }
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }
    th, td {
      border: 1px solid #dee2e6;
      padding: 8px;
    }
    thead th {
      background-color: #f8f9fa;
    }
  `]
})
export class RelatorioViewComponent implements OnInit {
  relatorio = signal<any>(null);

  ngOnInit() {
    const state = window.history.state;
    if (state && state.relatorio) {
      this.relatorio.set(state.relatorio);
    }
  }

  handlePrint() {
    window.print();
  }

  handleBack() {
    window.history.back();
  }
}
