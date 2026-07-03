import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ParametrosService } from '../../services/ParametrosService';
import { PontoFiscalizacao } from '../../../../types/models';

@Component({
  selector: 'app-pontos-fiscalizacao',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './Pontos.html',
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
export class PontosFiscalizacaoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parametrosService = inject(ParametrosService);

  pontoForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  selectedId = signal<string | number | null>(null);
  items = signal<PontoFiscalizacao[]>([]);

  displayedColumns: string[] = ['descricao', 'responsavel'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.pontoForm = this.fb.group({
      descricao: ['', [Validators.required]],
      endereco: [''],
      telefone: [''],
      responsavel: ['']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const data = await this.parametrosService.getPontosFiscalizacao();
      this.items.set(data || []);
    } catch (error) {
      this.message.set('Erro ao carregar pontos de fiscalização.');
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: PontoFiscalizacao) {
    this.selectedId.set(item.id);
    this.pontoForm.patchValue({
      descricao: item.descricao,
      endereco: item.endereco,
      telefone: item.telefone,
      responsavel: item.responsavel
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.pontoForm.reset({
      descricao: '',
      endereco: '',
      telefone: '',
      responsavel: ''
    });
    this.message.set('');
  }

  async handleSave() {
    if (this.pontoForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.pontoForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.parametrosService.updatePontoFiscalizacao(sid, val);
        this.message.set('Ponto atualizado com sucesso!');
      } else {
        await this.parametrosService.createPontoFiscalizacao(val);
        this.message.set('Ponto criado com sucesso!');
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao salvar ponto.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.parametrosService.deletePontoFiscalizacao(sid);
      this.message.set('Ponto excluído com sucesso!');
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao excluir ponto.');
    } finally {
      this.loading.set(false);
    }
  }
}
