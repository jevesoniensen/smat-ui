import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
import { removeNonDigits } from '../../common/formatting';

@Component({
  selector: 'app-investigacao-medidas-corretivas',
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
  templateUrl: './MedidasCorretivas.html',
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
export class MedidasCorretivasInvestigacaoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private investigacaoService = inject(InvestigacaoService);
  private parametrosService = inject(ParametrosService);

  medidaForm!: FormGroup;
  investigacaoId = signal<string | number | null>(null);
  medidas = signal<MedidaCorretivaInvestigacao[]>([]);
  tiposMedida = signal<TipoMedidaCorretiva[]>([]);
  selectedId = signal<string | number | null>(null);

  loading = signal(false);
  message = signal('');

  displayedColumns: string[] = ['tipo', 'prazo'];

  ngOnInit() {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    const state = window.history.state;
    if (state && state.investigacaoId) {
        this.investigacaoId.set(state.investigacaoId);
    } else if (id) {
        this.investigacaoId.set(id);
    }

    if (this.investigacaoId()) {
      this.fetchData();
    }
  }

  initForm() {
    this.medidaForm = this.fb.group({
      tipoId: ['', [Validators.required]],
      prazoDias: ['', [Validators.required]],
      observacao: ['', [Validators.required]]
    });
  }

  async fetchData() {
    const iid = this.investigacaoId();
    if (!iid) return;
    this.loading.set(true);
    try {
      const [medidasData, tiposData] = await Promise.all([
        this.investigacaoService.getMedidasCorretivas(iid),
        this.parametrosService.getTiposMedidaCorretiva()
      ]);
      this.medidas.set(medidasData || []);
      this.tiposMedida.set(tiposData || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  onPrazoInput(event: any) {
    const val = removeNonDigits(event.target.value);
    this.medidaForm.get('prazoDias')?.setValue(val, { emitEvent: false });
  }

  handleSelect(item: MedidaCorretivaInvestigacao) {
    this.selectedId.set(item.id);
    this.medidaForm.patchValue({
      tipoId: item.tipoId,
      prazoDias: item.prazoDias?.toString() || '',
      observacao: item.observacao
    });
    this.message.set('');
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
      const formValue = this.medidaForm.value;
      const payload: any = {
          ...formValue,
          prazoDias: parseInt(formValue.prazoDias, 10)
      };

      const sid = this.selectedId();
      if (sid) {
        await this.investigacaoService.updateMedidaCorretiva(iid, sid, payload);
        this.message.set('Medida corretiva atualizada com sucesso!');
      } else {
        await this.investigacaoService.addMedidaCorretiva(iid, payload);
        this.message.set('Medida corretiva salva com sucesso!');
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao salvar medida corretiva.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const iid = this.investigacaoId();
    const sid = this.selectedId();
    if (!iid || !sid || !window.confirm('Tem certeza que deseja excluir esta medida corretiva?')) return;

    this.loading.set(true);
    try {
      await this.investigacaoService.deleteMedidaCorretiva(iid, sid);
      this.message.set('Medida corretiva excluída com sucesso!');
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao excluir medida corretiva.');
    } finally {
      this.loading.set(false);
    }
  }

  getTipoDescricao(tipoId: string | number) {
    return this.tiposMedida().find(t => String(t.id) === String(tipoId))?.descricao || tipoId;
  }

  handleReturn() {
    window.history.back();
  }
}
