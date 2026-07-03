import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FiscalizacaoService } from '../services/FiscalizacaoService';
import { Fiscalizacao } from '../../../types/models';

@Component({
  selector: 'app-fiscalizacoes',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatTableModule, 
    MatButtonModule, 
    MatCardModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './Fiscalizacoes.html',
  styleUrls: ['../css/fiscalizacao.css']
})
export class FiscalizacoesComponent implements OnInit {
  private router = inject(Router);
  private fiscalizacaoService = inject(FiscalizacaoService);
  private snackBar = inject(MatSnackBar);

  fiscalizacoes = signal<Fiscalizacao[]>([]);
  selected = signal<Fiscalizacao | null>(null);
  loading = signal(false);

  displayedColumns: string[] = ['id', 'titulo', 'empregador', 'dataFiscalizacao'];

  ngOnInit() {
    this.fetchData();
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const data = await this.fiscalizacaoService.listFiscalizacoes();
      this.fiscalizacoes.set(data || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar fiscalizações.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleSelect(id: string | number) {
    this.loading.set(true);
    try {
      const data = await this.fiscalizacaoService.getFiscalizacao(id);
      this.selected.set(data);
    } catch (error) {
      this.snackBar.open('Erro ao carregar detalhes da fiscalização.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleFinalize() {
    const sel = this.selected();
    if (!sel?.id) return;
    this.loading.set(true);
    try {
      await this.fiscalizacaoService.finalizeFiscalizacao(sel.id);
      this.snackBar.open('Fiscalização finalizada com sucesso!', 'OK', { duration: 3000 });
      const updated = await this.fiscalizacaoService.getFiscalizacao(sel.id);
      this.selected.set(updated);
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao finalizar fiscalização.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleEdit() {
    const sel = this.selected();
    if (sel) {
      this.router.navigate(['/fiscalizacao/cadastro'], { state: { fiscalizacaoToEdit: sel } });
    }
  }

  handleTramite() {
    const sel = this.selected();
    if (sel) {
      this.router.navigate([`/fiscalizacao/${sel.id}/tramite`]);
    }
  }
}
