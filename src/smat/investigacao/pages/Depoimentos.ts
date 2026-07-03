import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
import { Depoimento, TipoDepoimento, AgenteCausador } from '../../../types/models';

@Component({
  selector: 'app-investigacao-depoimentos',
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
  templateUrl: './Depoimentos.html',
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .flex-gap-10 {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .w-100 {
      width: 100%;
    }
    .flex-1 {
      flex: 1;
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
export class DepoimentosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private investigacaoService = inject(InvestigacaoService);
  private parametrosService = inject(ParametrosService);

  depoimentoForm!: FormGroup;
  investigacaoId = signal<string | number | null>(null);
  depoimentos = signal<Depoimento[]>([]);
  tiposDepoimento = signal<TipoDepoimento[]>([]);
  agentesCausadores = signal<AgenteCausador[]>([]);
  
  nomePessoa = signal('');
  selectedId = signal<string | number | null>(null);
  loading = signal(false);
  message = signal('');

  displayedColumns: string[] = ['data', 'tipo', 'nome'];

  ngOnInit() {
    this.initForm();
    const state = window.history.state;
    if (state) {
      if (state.investigacaoId) this.investigacaoId.set(state.investigacaoId);
      if (state.selectedPessoa) {
        this.depoimentoForm.patchValue({ pessoaId: state.selectedPessoa.id });
        this.nomePessoa.set(state.selectedPessoa.nome);
      }
    }

    if (this.investigacaoId()) {
      this.fetchInitialData();
    }
  }

  initForm() {
    this.depoimentoForm = this.fb.group({
      dataHoraStr: ['', [Validators.required]],
      tipoDepoimentoId: ['', [Validators.required]],
      pessoaId: ['', [Validators.required]],
      relato: [''],
      agenteCausadorId: ['']
    });
  }

  async fetchInitialData() {
    const iid = this.investigacaoId();
    if (!iid) return;
    this.loading.set(true);
    try {
      const [deps, tipos, agentes] = await Promise.all([
        this.investigacaoService.getDepoimentos(iid),
        this.parametrosService.getTiposDepoimento(),
        this.parametrosService.getAgentesCausadores(),
      ]);
      this.depoimentos.set(deps || []);
      this.tiposDepoimento.set(tipos || []);
      this.agentesCausadores.set(agentes || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  handleSearchPerson() {
    this.router.navigate(['/pessoas/pesquisa'], { state: { returnPath: '/investigacao/depoimentos', investigacaoId: this.investigacaoId() } });
  }

  handleSelect(item: Depoimento) {
    this.selectedId.set(item.id);
    this.depoimentoForm.patchValue({
        tipoDepoimentoId: item.tipoDepoimentoId,
        agenteCausadorId: item.agenteCausadorId,
        relato: item.relato,
        pessoaId: item.testemunha?.id,
        dataHoraStr: item.dataDepoimento ? new Date(item.dataDepoimento).toLocaleString('pt-BR') : ''
    });
    this.nomePessoa.set(item.testemunha?.nome || '');
  }

  handleClear() {
    this.selectedId.set(null);
    this.depoimentoForm.reset({
        dataHoraStr: '',
        tipoDepoimentoId: '',
        pessoaId: '',
        relato: '',
        agenteCausadorId: ''
    });
    this.nomePessoa.set('');
    this.message.set('');
  }

  async handleSave() {
    const iid = this.investigacaoId();
    if (!iid || this.depoimentoForm.invalid) return;

    this.loading.set(true);
    try {
      const formValue = this.depoimentoForm.value;
      const payload: any = {
          ...formValue,
          // dataDepoimento: ... logic to parse dataHoraStr
      };

      const sid = this.selectedId();
      if (sid) {
        await this.investigacaoService.updateDepoimento(iid, sid, payload);
        this.message.set('Depoimento atualizado com sucesso!');
      } else {
        await this.investigacaoService.addDepoimento(iid, payload);
        this.message.set('Depoimento adicionado com sucesso!');
      }
      this.handleClear();
      this.fetchInitialData();
    } catch (error) {
      this.message.set('Erro ao salvar depoimento.');
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
      await this.investigacaoService.deleteDepoimento(iid, sid);
      this.message.set('Depoimento excluído com sucesso!');
      this.handleClear();
      this.fetchInitialData();
    } catch (error) {
      this.message.set('Erro ao excluir depoimento.');
    } finally {
      this.loading.set(false);
    }
  }

  handleReturn() {
    window.history.back();
  }
}
