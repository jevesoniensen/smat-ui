import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmpregadorService } from '../services/EmpregadorService';
import { Empregador } from '../../../types/models';

@Component({
  selector: 'app-pesquisa-empregador',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    MatTableModule, 
    MatButtonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './PesquisaEmpregador.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/empregador.css']
})
export class PesquisaEmpregadorComponent implements OnInit {
  private router = inject(Router);
  private empregadorService = inject(EmpregadorService);
  private snackBar = inject(MatSnackBar);

  razaoSocial = '';
  results = signal<Empregador[]>([]);
  loading = signal(false);
  returnPath: string | null = null;

  displayedColumns: string[] = ['razaoSocial', 'documento'];

  ngOnInit() {
    const state = window.history.state;
    if (state && state.returnPath) {
      this.returnPath = state.returnPath;
    }
  }

  async handleSearch() {
    this.loading.set(true);
    try {
      const data = await this.empregadorService.searchEmpregadores(this.razaoSocial);
      this.results.set(data || []);
      if (data.length === 0) {
        this.snackBar.open('Nenhum empregador encontrado.', 'Fechar', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Erro ao pesquisar empregadores.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleClear() {
    this.razaoSocial = '';
    this.results.set([]);
  }

  handleNew() {
    this.router.navigate(['/empregador'], { state: { returnPath: '/pesquisaempregador', nestedReturnPath: this.returnPath } });
  }

  handleSelect(emp: Empregador) {
    if (this.returnPath) {
      this.router.navigate([this.returnPath], { state: { selectedEmpregador: emp } });
    } else {
      this.router.navigate(['/empregador'], { state: { empregadorToEdit: emp, returnPath: '/pesquisaempregador' } });
    }
  }

  handleReturn() {
    if (this.returnPath) {
        this.router.navigate([this.returnPath]);
    } else {
        window.history.back();
    }
  }
}
