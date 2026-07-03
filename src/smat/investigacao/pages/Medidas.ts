import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InvestigacaoService } from '../services/InvestigacaoService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { MedidaCorretivaInvestigacao, TipoMedidaCorretiva } from '../../../types/models';

@Component({
  selector: 'app-investigacao-medidas-alt',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './Medidas.html',
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
export class MedidasInvestigacaoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private investigacaoService = inject(InvestigacaoService);
  private parametrosService = inject(ParametrosService);

  medidaForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  selectedId = signal<string | number | null>(null);
  investigacaoId = signal<string | number | null>(null);

  medidas = signal<MedidaCorretivaInvestigacao[]>([]);
  tiposMedida = signal<TipoMedidaCorretiva[]>([]);

  displayedColumns: string[] = ['descricao', 'dataPrevista'];

  ngOnInit() {
    this.initForm();
    const state = window.history.state;
    if (state && state.investigacaoId) {
      this.investigacaoId.set(state.investigacaoId);
      this.fetchInitialData(state.investigacaoId);
    }
  }

  initForm() {
    this.medidaForm = this.fb.group({
      tipoId: ['', [Validators.required]],
      prazoDias: ['', [Validators.required]],
      observacao: ['', [Validators.required]]
    });
  }

  async fetchInitialData(id: string | number) {
    this.loading.set(true);
    try {
      const [medidasData, tiposData] = await Promise.all([
        this.investigacaoService.getMedidasCorretivas(id),
        this.parametrosService.getTiposMedidaCorretiva(),
      ]);
      this.medidas.set(medidasData || []);
      this.tiposMedida.set(tiposData || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: MedidaCorretivaInvestigacao) {
    this.selectedId.set(item.id);
    this.medidaForm.patchValue({
      tipoId: (item as any).tipoId || '',
      prazoDias: (item as any).prazoDias || '',
      observacao: item.descricao
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.medidaForm.reset({
      tipoId: '',
      prazoDias: '',
      observacao: ''
    });
    this.message.set('');
  }

  async handleSave() {
    const iid = this.investigacaoId();
    if (!iid || this.medidaForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.medidaForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.investigacaoService.updateMedidaCorretiva(iid, sid, val);
        this.message.set('Medida corretiva atualizada com sucesso!');
      } else {
        await this.investigacaoService.addMedidaCorretiva(iid, val);
        this.message.set('Medida corretiva salva com sucesso!');
      }
      this.handleClear();
      this.fetchInitialData(iid);
    } catch (error) {
      this.message.set('Erro ao salvar medida corretiva.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const iid = this.investigacaoId();
    const sid = this.selectedId();
    if (!iid || !sid) return;
    this.loading.set(true);
    try {
      await this.investigacaoService.deleteMedidaCorretiva(iid, sid);
      this.message.set('Medida corretiva excluída com sucesso!');
      this.handleClear();
      this.fetchInitialData(iid);
    } catch (error) {
      this.message.set('Erro ao excluir medida corretiva.');
    } finally {
      this.loading.set(false);
    }
  }

  handleReturn() {
    window.history.back();
  }
}
