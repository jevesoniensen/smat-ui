import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InvestigacaoService } from '../services/InvestigacaoService';
import { AcidenteService } from '../../acidente/services/AcidenteService';
import { PessoasService } from '../../pessoas/services/PessoasService';
import { Investigacao, AgenteSaude, Acidente } from '../../../types/models';

@Component({
  selector: 'app-investigacao-cadastro',
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
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './Cadastro.html',
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .details-section {
      margin-bottom: 24px;
      padding: 16px;
    }
    .form-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
    .w-100 {
      width: 100%;
    }
    .required {
      color: #f44336;
    }
  `]
})
export class CadastroInvestigacaoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private investigacaoService = inject(InvestigacaoService);
  private acidenteService = inject(AcidenteService);
  private pessoasService = inject(PessoasService);

  cadastroForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  
  acidente = signal<Acidente | null>(null);
  agentesSaude = signal<AgenteSaude[]>([]);
  form = signal<Partial<Investigacao>>({});

  ngOnInit() {
    this.initForm();
    const state = window.history.state;
    if (state) {
      this.fetchInitialData(state.acidenteId, state.investigacaoId);
    }
  }

  initForm() {
    this.cadastroForm = this.fb.group({
      agenteSaudeId: ['', [Validators.required]],
      motivo: ['', [Validators.required]],
      obsGerais: ['']
    });
  }

  async fetchInitialData(acidenteId?: string | number, investigacaoId?: string | number) {
    this.loading.set(true);
    try {
      const agentes = await this.pessoasService.listAgentesSaude();
      this.agentesSaude.set(agentes || []);

      if (investigacaoId) {
        const inv = await this.investigacaoService.getInvestigacao(investigacaoId);
        this.form.set(inv);
        this.cadastroForm.patchValue({
          agenteSaudeId: inv.responsavel?.id || '',
          obsGerais: inv.descricao || '',
          motivo: (inv as any).motivo || ''
        });
        if (inv.acidente) this.acidente.set(inv.acidente);
      } else if (acidenteId) {
        const ac = await this.acidenteService.getAcidente(acidenteId);
        this.acidente.set(ac);
      }
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  isFinalized() {
    return !!this.form().dataFim;
  }

  async handleSave() {
    if (this.cadastroForm.invalid || !this.acidente()) return;
    this.loading.set(true);
    try {
      const formValue = this.cadastroForm.value;
      const payload: any = {
          ...this.form(),
          acidente: this.acidente(),
          descricao: formValue.obsGerais,
          motivo: formValue.motivo,
          responsavel: { id: formValue.agenteSaudeId }
      };

      const id = this.form().id;
      if (id) {
        await this.investigacaoService.updateInvestigacao(id, payload);
        this.message.set('Investigação atualizada com sucesso!');
      } else {
        const created = await this.investigacaoService.createInvestigacao(payload);
        this.form.set(created);
        this.message.set('Investigação criada com sucesso!');
      }
    } catch (error) {
      this.message.set('Erro ao salvar investigação.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleFinalize() {
    const id = this.form().id;
    if (!id) return;
    this.loading.set(true);
    try {
      await this.investigacaoService.finalizeInvestigacao(id);
      this.message.set('Investigação finalizada com sucesso!');
      const updated = await this.investigacaoService.getInvestigacao(id);
      this.form.set(updated);
    } catch (error) {
      this.message.set('Erro ao finalizar investigação.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const id = this.form().id;
    if (!id) return;
    this.loading.set(true);
    try {
      await this.investigacaoService.deleteInvestigacao(id);
      this.message.set('Investigação excluída com sucesso!');
      this.handleReturn();
    } catch (error) {
      this.message.set('Erro ao excluir investigação.');
    } finally {
      this.loading.set(false);
    }
  }

  handleDetails() {
      const id = this.form().id;
      if (id) {
          this.router.navigate([`/investigacao/${id}/detalhes`], { state: { investigacaoId: id } });
      } else {
          this.message.set('Salve a investigação antes de acessar os detalhes.');
      }
  }

  handleViewAcidente() {
      const id = this.acidente()?.id;
      if (id) {
          this.router.navigate(['/visualizaacidente'], { state: { acidenteId: id } });
      }
  }

  handleReturn() {
    window.history.back();
  }
}
