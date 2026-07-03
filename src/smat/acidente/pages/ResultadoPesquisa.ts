import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resultado-pesquisa',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './ResultadoPesquisa.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/acidente.css']
})
export class ResultadoPesquisaComponent implements OnInit {
  private router = inject(Router);

  results = signal<any[]>([]);
  filters = signal<any>({});

  displayedColumns: string[] = ['id', 'data', 'empregador', 'actions'];

  ngOnInit() {
    const state = window.history.state;
    if (state) {
      this.results.set(state.results || []);
      this.filters.set(state.filters || {});
    }
  }

  handleBack() {
    this.router.navigate(['/pesquisaacidente'], { state: { filters: this.filters() } });
  }

  handleView(acidenteId: string) {
    this.router.navigate(['/visualizaacidente'], { state: { acidenteId } });
  }
}
