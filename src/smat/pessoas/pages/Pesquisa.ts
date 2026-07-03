import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PessoasService } from '../services/PessoasService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { Pessoa, TipoDepoimento } from '../../../types/models';

@Component({
  selector: 'app-pesquisa-pessoa',
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
    MatSelectModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './Pesquisa.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css']
})
export class PesquisaPessoaComponent implements OnInit {
  private router = inject(Router);
  private pessoasService = inject(PessoasService);
  private parametrosService = inject(ParametrosService);
  private snackBar = inject(MatSnackBar);

  nome = '';
  tipoDepoimentoId = '';
  tiposDepoimento = signal<TipoDepoimento[]>([]);
  resultados = signal<Pessoa[]>([]);
  loading = signal(false);
  returnPath: string | null = null;
  navigationState: any = null;

  displayedColumns: string[] = ['nome', 'tipo'];

  ngOnInit() {
    this.fetchInitialData();
    const state = window.history.state;
    if (state) {
      this.returnPath = state.returnPath;
      this.navigationState = state;
    }
  }

  async fetchInitialData() {
    try {
      const tipos = await this.parametrosService.getTiposDepoimento();
      this.tiposDepoimento.set(tipos || []);
    } catch (error) {
      console.error('Error fetching tipos depoimento', error);
    }
  }

  async handleSearch() {
    this.loading.set(true);
    try {
      const data = await this.pessoasService.searchPessoas(this.nome, this.tipoDepoimentoId);
      this.resultados.set(data || []);
      if (data.length === 0) {
        this.snackBar.open('Nenhuma pessoa encontrada.', 'Fechar', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Erro ao pesquisar pessoas.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(pessoa: Pessoa) {
    if (this.returnPath) {
      this.router.navigate([this.returnPath], { state: { ...this.navigationState, selectedPessoa: pessoa } });
    }
  }

  handleCreate() {
    this.router.navigate(['/pessoas/cadastrotestemunha']);
  }

  handleReturn() {
    if (this.returnPath) {
        this.router.navigate([this.returnPath], { state: this.navigationState });
    } else {
        window.history.back();
    }
  }
}
