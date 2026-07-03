import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InvestigacaoService } from '../services/InvestigacaoService';
import { Investigacao } from '../../../types/models';

@Component({
  selector: 'app-investigacao-detalhes',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './Detalhes.html',
  styles: [`
    .details-card {
      margin-bottom: 24px;
    }
    .w-100 {
      width: 100%;
    }
    .w-150px {
      width: 150px;
    }
    .mb-20 {
      margin-bottom: 20px;
    }
    .mt-10 {
      margin-top: 10px;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
    }
    .table-details td {
      padding: 8px 0;
    }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: rgba(0, 0, 0, 0.04);
    }
    .selected-row {
      background: rgba(0, 0, 0, 0.08) !important;
    }
  `]
})
export class DetalhesInvestigacaoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private investigacaoService = inject(InvestigacaoService);

  investigacoes = signal<Investigacao[]>([]);
  selected = signal<Investigacao | null>(null);
  loading = signal(false);
  message = signal('');

  ngOnInit() {
    this.fetchList();
    const state = window.history.state;
    if (state && state.investigacaoId) {
      this.handleSelect(state.investigacaoId);
    } else {
        // Also check route params if needed
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.handleSelect(id);
    }
  }

  async fetchList() {
    this.loading.set(true);
    try {
      const data = await this.investigacaoService.listInvestigacoes();
      this.investigacoes.set(data || []);
    } catch (error) {
      this.message.set('Erro ao carregar lista de investigações.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleSelect(id: string | number) {
    this.loading.set(true);
    try {
      const details = await this.investigacaoService.getInvestigacao(id);
      this.selected.set(details);
    } catch (error) {
      this.message.set('Erro ao carregar detalhes da investigação.');
    } finally {
      this.loading.set(false);
    }
  }

  handleUpdate() {
    const sel = this.selected();
    if (sel) {
      this.router.navigate(['/investigacao/cadastro'], { state: { investigacaoId: sel.id } });
    }
  }

  handleDepoimentos() {
    const sel = this.selected();
    if (sel) {
      this.router.navigate(['/investigacao/depoimentos'], { state: { investigacaoId: sel.id } });
    }
  }

  handleMedidas() {
    const sel = this.selected();
    if (sel) {
      this.router.navigate(['/investigacao/medidas'], { state: { investigacaoId: sel.id } });
    }
  }
}
