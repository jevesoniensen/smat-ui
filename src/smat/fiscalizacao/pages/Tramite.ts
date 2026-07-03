import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FiscalizacaoService } from '../services/FiscalizacaoService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { TramiteFiscalizacao, Status, ItemFiscalizacao } from '../../../types/models';

@Component({
  selector: 'app-fiscalizacao-tramite',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule, 
    MatTableModule, 
    MatButtonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatInputModule, 
    MatCheckboxModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './Tramite.html',
  styleUrls: ['../css/fiscalizacao.css']
})
export class TramiteComponent implements OnInit {
  private router = inject(Router);
  private fiscalizacaoService = inject(FiscalizacaoService);
  private parametrosService = inject(ParametrosService);
  private snackBar = inject(MatSnackBar);

  fiscalizacaoId = signal<string | number | null>(null);
  tramites = signal<TramiteFiscalizacao[]>([]);
  selectedTramite = signal<TramiteFiscalizacao | null>(null);
  itemsRoteiro = signal<ItemFiscalizacao[]>([]);
  statusOptions = signal<Status[]>([]);
  evaluations = signal<Record<string, string>>({});
  newStatus = '';

  loading = signal(false);

  displayedColumns: string[] = ['id', 'dataTramite', 'agente', 'status'];
  displayedRoteiroColumns: string[] = ['conformidade', 'descricao'];

  ngOnInit() {
    const state = window.history.state;
    // Also try to get from URL params if available
    if (state && state.fiscalizacaoId) {
      this.fiscalizacaoId.set(state.fiscalizacaoId);
    }
    
    if (this.fiscalizacaoId()) {
      this.fetchInitialData();
    }
  }

  async fetchInitialData() {
    const fid = this.fiscalizacaoId();
    if (!fid) return;
    this.loading.set(true);
    try {
      const [list, statusList] = await Promise.all([
        this.fiscalizacaoService.listTramites(fid),
        this.parametrosService.getStatus(),
      ]);
      this.tramites.set(list || []);
      this.statusOptions.set(statusList || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar trâmites.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleSelect(tramite: TramiteFiscalizacao) {
    this.loading.set(true);
    try {
      const details = await this.fiscalizacaoService.getTramite(tramite.id);
      this.selectedTramite.set(details);
      this.newStatus = details.statusId || '';
      if (details.roteiroItems) {
          this.itemsRoteiro.set(details.roteiroItems);
          const initEval: Record<string, string> = {};
          details.roteiroItems.forEach(item => {
              if (item.grauConformidadeId) {
                  initEval[item.id] = item.grauConformidadeId;
              }
          });
          this.evaluations.set(initEval);
      } else {
          this.itemsRoteiro.set([]);
          this.evaluations.set({});
      }
    } catch (error) {
      this.snackBar.open('Erro ao carregar detalhes do trâmite.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleEvaluationChange(itemId: string | number, checked: boolean) {
    const id = String(itemId);
    const val = checked ? 'true' : 'false';
    this.evaluations.set({ ...this.evaluations(), [id]: val });
  }

  isEditable() {
    const sel = this.selectedTramite();
    return sel && sel.status !== 'CONCLUIDO';
  }

  handleRoteiro() {
    const sel = this.selectedTramite();
    if (sel) {
      this.router.navigate(['/fiscalizacao/roteiro'], {
        state: { fiscalizacaoId: this.fiscalizacaoId(), tramiteId: sel.id }
      });
    }
  }

  handleMedidas() {
    this.router.navigate(['/fiscalizacao/medidas'], {
      state: { fiscalizacaoId: this.fiscalizacaoId(), tramiteId: this.selectedTramite()?.id }
    });
  }

  async handleSave() {
    const sel = this.selectedTramite();
    if (!sel) return;
    this.loading.set(true);
    try {
      const evals = this.evaluations();
      const evalList = Object.keys(evals).map(key => ({
          itemId: key,
          grauConformidadeId: evals[key]
      }));
      await this.fiscalizacaoService.saveTramiteEvaluation(sel.id, evalList);
      this.snackBar.open('Avaliação salva com sucesso!', 'OK', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Erro ao salvar avaliação.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleUpdateStatus() {
    const sel = this.selectedTramite();
    if (!sel || !this.newStatus) return;
    this.loading.set(true);
    try {
      await this.fiscalizacaoService.updateTramiteStatus(sel.id, this.newStatus);
      this.snackBar.open('Status atualizado com sucesso!', 'OK', { duration: 3000 });
      this.fetchInitialData();
      this.handleSelect({ ...sel, statusId: this.newStatus } as any);
    } catch (error) {
      this.snackBar.open('Erro ao atualizar status.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleReturn() {
    window.history.back();
  }
}
