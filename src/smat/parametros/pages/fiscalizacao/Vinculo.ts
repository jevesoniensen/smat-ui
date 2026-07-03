import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { ParametrosService } from '../../services/ParametrosService';
import { PontoFiscalizacao, ItemFiscalizacao } from '../../../../types/models';

@Component({
  selector: 'app-vinculo-fiscalizacao',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './Vinculo.html',
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .w-100 {
      width: 100%;
    }
    .w-50px {
      width: 50px;
    }
  `]
})
export class VinculoFiscalizacaoComponent implements OnInit {
  private parametrosService = inject(ParametrosService);

  pontos = signal<PontoFiscalizacao[]>([]);
  allItems = signal<ItemFiscalizacao[]>([]);
  linkedItemIds = signal<string[]>([]);
  
  selectedPontoId = '';
  loading = signal(false);
  message = signal('');

  displayedColumns: string[] = ['select', 'descricao'];

  ngOnInit() {
    this.fetchInitialData();
  }

  async fetchInitialData() {
    this.loading.set(true);
    try {
      const [pts, items] = await Promise.all([
        this.parametrosService.getPontosFiscalizacao(),
        this.parametrosService.getItensFiscalizacao(),
      ]);
      this.pontos.set(pts || []);
      this.allItems.set(items || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados iniciais.');
    } finally {
      this.loading.set(false);
    }
  }

  async onPontoChange() {
    this.linkedItemIds.set([]);
    if (this.selectedPontoId) {
      this.loading.set(true);
      try {
        const linked = await this.parametrosService.getVinculosItemPonto(this.selectedPontoId);
        this.linkedItemIds.set(linked.map(i => String(i.id)));
      } catch (error) {
        this.message.set('Erro ao carregar vínculos.');
      } finally {
        this.loading.set(false);
      }
    }
  }

  isLinked(itemId: string | number) {
    return this.linkedItemIds().includes(String(itemId));
  }

  toggleLink(itemId: string | number) {
    const id = String(itemId);
    const current = this.linkedItemIds();
    if (current.includes(id)) {
      this.linkedItemIds.set(current.filter(i => i !== id));
    } else {
      this.linkedItemIds.set([...current, id]);
    }
  }

  async handleSave() {
    if (!this.selectedPontoId) return;
    this.loading.set(true);
    try {
      await this.parametrosService.updateVinculoItemPonto(this.selectedPontoId, this.linkedItemIds());
      this.message.set('Vínculos salvos com sucesso!');
    } catch (error) {
      this.message.set('Erro ao salvar vínculos.');
    } finally {
      this.loading.set(false);
    }
  }
}
