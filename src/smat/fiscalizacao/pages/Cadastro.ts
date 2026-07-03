import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FiscalizacaoService } from '../services/FiscalizacaoService';
import { PessoasService } from '../../pessoas/services/PessoasService';
import { AgenteSaude, Empregador } from '../../../types/models';

@Component({
  selector: 'app-fiscalizacao-cadastro',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatButtonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './Cadastro.html',
  styleUrls: ['../css/fiscalizacao.css']
})
export class CadastroFiscalizacaoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private fiscalizacaoService = inject(FiscalizacaoService);
  private pessoasService = inject(PessoasService);
  private snackBar = inject(MatSnackBar);

  cadastroForm!: FormGroup;
  loading = signal(false);
  fiscalizacaoId = signal<string | number | null>(null);
  selectedEmpregador = signal<Empregador | null>(null);
  agentesSaude = signal<AgenteSaude[]>([]);

  ngOnInit() {
    this.initForm();
    this.fetchInitialData();
    this.handleNavigationState();
  }

  initForm() {
    this.cadastroForm = this.fb.group({
      agenteSaudeId: [''],
      dataAberturaStr: ['', [Validators.required]],
      titulo: ['', [Validators.required]],
      obsGerais: ['', [Validators.required]]
    });
  }

  async fetchInitialData() {
    this.loading.set(true);
    try {
      const agentes = await this.pessoasService.listAgentesSaude();
      this.agentesSaude.set(agentes || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar agentes de saúde.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleNavigationState() {
    const state = window.history.state;
    if (state) {
        if (state.selectedEmpregador) {
            this.selectedEmpregador.set(state.selectedEmpregador);
        }
        if (state.fiscalizacaoToEdit) {
            const f = state.fiscalizacaoToEdit;
            this.fiscalizacaoId.set(f.id);
            this.selectedEmpregador.set(f.empregador);
            this.cadastroForm.patchValue({
                agenteSaudeId: f.fiscal?.id || '',
                titulo: f.titulo,
                obsGerais: f.obsGerais,
                dataAberturaStr: f.dataFiscalizacao ? new Date(f.dataFiscalizacao).toLocaleDateString('pt-BR') : ''
            });
        }
    }
  }

  handleSearchEmpregador() {
    this.router.navigate(['/pesquisaempregador'], { state: { returnPath: '/fiscalizacao/cadastro' } });
  }

  async handleSave() {
    if (!this.selectedEmpregador()) {
        this.snackBar.open('Selecione um empregador.', 'Fechar', { duration: 3000 });
        return;
    }
    if (this.cadastroForm.invalid) {
        this.snackBar.open('Preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
        return;
    }

    this.loading.set(true);
    try {
      const formValue = this.cadastroForm.value;
      const payload: any = {
          titulo: formValue.titulo,
          obsGerais: formValue.obsGerais,
          empregador: this.selectedEmpregador(),
          fiscal: { id: formValue.agenteSaudeId }
      };

      const id = this.fiscalizacaoId();
      if (id) {
        await this.fiscalizacaoService.updateFiscalizacao(id, payload);
        this.snackBar.open('Fiscalização atualizada com sucesso!', 'OK', { duration: 3000 });
      } else {
        const created = await this.fiscalizacaoService.createFiscalizacao(payload);
        this.fiscalizacaoId.set(created.id);
        this.snackBar.open('Fiscalização cadastrada com sucesso!', 'OK', { duration: 3000 });
      }
    } catch (error) {
      this.snackBar.open('Erro ao salvar fiscalização.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const id = this.fiscalizacaoId();
    if (!id) return;
    this.loading.set(true);
    try {
      await this.fiscalizacaoService.deleteFiscalizacao(id);
      this.snackBar.open('Fiscalização excluída com sucesso!', 'OK', { duration: 3000 });
      this.handleClear();
    } catch (error) {
      this.snackBar.open('Erro ao excluir fiscalização.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleClear() {
    this.cadastroForm.reset({
        agenteSaudeId: '',
        dataAberturaStr: '',
        titulo: '',
        obsGerais: ''
    });
    this.selectedEmpregador.set(null);
    this.fiscalizacaoId.set(null);
  }

  handleDetails() {
      const id = this.fiscalizacaoId();
      if (id) {
          this.router.navigate([`/fiscalizacao/${id}/detalhes`]);
      } else {
          this.snackBar.open('Salve a fiscalização antes de acessar os detalhes.', 'Fechar', { duration: 3000 });
      }
  }
}
