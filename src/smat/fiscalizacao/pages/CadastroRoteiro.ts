import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FiscalizacaoService } from '../services/FiscalizacaoService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { RamoAtividade, PontoFiscalizacao, ItemFiscalizacao } from '../../../types/models';

@Component({
  selector: 'app-fiscalizacao-roteiro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './CadastroRoteiro.html',
  styleUrls: ['../css/fiscalizacao.css']
})
export class CadastroRoteiroComponent implements OnInit {
  private fiscalizacaoService = inject(FiscalizacaoService);
  private parametrosService = inject(ParametrosService);
  private snackBar = inject(MatSnackBar);

  fiscalizacaoId = signal<string | number | null>(null);
  tramiteId = signal<string | number | null>(null);

  ramoSuperiores = signal<RamoAtividade[]>([]);
  ramosAtividade = signal<RamoAtividade[]>([]);
  pontosFiscalizacao = signal<PontoFiscalizacao[]>([]);
  availableItems = signal<ItemFiscalizacao[]>([]);
  existingItems = signal<ItemFiscalizacao[]>([]);

  selectedRamoSuperior = '';
  selectedRamoAtividade = '';
  selectedPonto = '';
  selectedItems = signal<string[]>([]);

  loading = signal(false);
  message = signal('');

  displayedExistingColumns: string[] = ['descricao', 'actions'];
  displayedAvailableColumns: string[] = ['select', 'descricao'];

  ngOnInit() {
    const state = window.history.state;
    if (state) {
      this.fiscalizacaoId.set(state.fiscalizacaoId);
      this.tramiteId.set(state.tramiteId);
    }

    if (this.fiscalizacaoId() && this.tramiteId()) {
      this.fetchInitialData();
      this.fetchExistingItems();
    }
  }

  async fetchInitialData() {
    try {
      const ramos = await this.parametrosService.getRamosAtividade();
      this.ramoSuperiores.set(ramos || []);
    } catch (error) {
      console.error('Error fetching ramos', error);
    }
  }

  async fetchExistingItems() {
    const tid = this.tramiteId();
    if (!tid) return;
    try {
      const items = await this.fiscalizacaoService.getTramiteItems(tid);
      this.existingItems.set(items || []);
    } catch (error) {
      console.error('Error fetching existing items', error);
    }
  }

  async onRamoSuperiorChange() {
    this.selectedRamoAtividade = '';
    this.selectedPonto = '';
    this.availableItems.set([]);
    this.ramosAtividade.set([]); 
  }

  async onRamoAtividadeChange() {
    this.selectedPonto = '';
    this.availableItems.set([]);

    if (this.selectedRamoAtividade) {
        try {
            const pontos = await this.parametrosService.getPontosFiscalizacao();
            this.pontosFiscalizacao.set(pontos || []);
        } catch (error) {
            console.error(error);
        }
    }
  }

  async onPontoChange() {
    if (this.selectedPonto) {
        this.loading.set(true);
        try {
            const items = await this.fiscalizacaoService.getItemsByPonto(this.selectedPonto);
            this.availableItems.set(items || []);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    } else {
        this.availableItems.set([]);
    }
  }

  isSelected(itemId: string | number) {
    return this.selectedItems().includes(String(itemId));
  }

  handleItemCheck(itemId: string | number) {
    const id = String(itemId);
    const current = this.selectedItems();
    if (current.includes(id)) {
      this.selectedItems.set(current.filter(i => i !== id));
    } else {
      this.selectedItems.set([...current, id]);
    }
  }

  async handleAdd() {
    const tid = this.tramiteId();
    if (!tid) return;
    this.loading.set(true);
    try {
        await Promise.all(this.selectedItems().map(itemId =>
            this.fiscalizacaoService.addItemToTramite(tid, itemId)
        ));
        this.snackBar.open('Itens adicionados com sucesso!', 'OK', { duration: 3000 });
        this.selectedItems.set([]);
        this.fetchExistingItems();
    } catch (error) {
        this.snackBar.open('Erro ao adicionar itens.', 'Fechar', { duration: 5000 });
    } finally {
        this.loading.set(false);
    }
  }

  async handleRemove(itemId: string | number) {
    const tid = this.tramiteId();
    if (!tid) return;
    if (!window.confirm('Confirma remoção?')) return;
    this.loading.set(true);
    try {
        await this.fiscalizacaoService.removeItemFromTramite(tid, itemId);
        this.snackBar.open('Item removido com sucesso!', 'OK', { duration: 3000 });
        this.fetchExistingItems();
    } catch (error) {
        this.snackBar.open('Erro ao remover item.', 'Fechar', { duration: 5000 });
    } finally {
        this.loading.set(false);
    }
  }

  handleReturn() {
    window.history.back();
  }
}
