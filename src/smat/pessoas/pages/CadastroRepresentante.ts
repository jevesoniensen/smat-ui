import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PessoasService } from '../services/PessoasService';
import { RepresentanteEmpresa } from '../../../types/models';

@Component({
  selector: 'app-cadastro-representante',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatTableModule, 
    MatButtonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './CadastroRepresentante.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css']
})
export class CadastroRepresentanteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pessoasService = inject(PessoasService);
  private snackBar = inject(MatSnackBar);

  representanteForm!: FormGroup;
  loading = signal(false);
  selectedId = signal<string | number | null>(null);

  empregadorId = signal<string | number | null>(null);
  empregadorNome = signal<string | null>(null);
  representantes = signal<RepresentanteEmpresa[]>([]);

  displayedColumns: string[] = ['nome'];

  ngOnInit() {
    this.initForm();
    const state = window.history.state;
    if (state && state.empregadorId) {
      this.empregadorId.set(state.empregadorId);
      this.empregadorNome.set(state.empregadorNome);
      this.fetchInitialData(state.empregadorId);
    }
  }

  initForm() {
    this.representanteForm = this.fb.group({
      nome: ['', [Validators.required]]
    });
  }

  async fetchInitialData(id: string | number) {
    this.loading.set(true);
    try {
      const list = await this.pessoasService.listRepresentantes(String(id));
      this.representantes.set(list || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: RepresentanteEmpresa) {
    this.selectedId.set(item.id);
    this.representanteForm.patchValue({
        nome: item.nome
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.representanteForm.reset({
        nome: ''
    });
  }

  async handleSave() {
    const eid = this.empregadorId();
    if (!eid || this.representanteForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.representanteForm.value;
      const payload: any = { ...val, empresa: { id: eid } };
      
      const sid = this.selectedId();
      if (sid) {
        await this.pessoasService.updateRepresentante(String(sid), payload);
        this.snackBar.open('Representante atualizado com sucesso!', 'OK', { duration: 3000 });
      } else {
        await this.pessoasService.createRepresentante(payload);
        this.snackBar.open('Representante criado com sucesso!', 'OK', { duration: 3000 });
      }
      this.handleClear();
      this.fetchInitialData(eid);
    } catch (error) {
      this.snackBar.open('Erro ao salvar representante.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const eid = this.empregadorId();
    const sid = this.selectedId();
    if (!eid || !sid) return;
    this.loading.set(true);
    try {
      await this.pessoasService.deleteRepresentante(String(sid));
      this.snackBar.open('Representante excluído com sucesso!', 'OK', { duration: 3000 });
      this.handleClear();
      this.fetchInitialData(eid);
    } catch (error) {
      this.snackBar.open('Erro ao excluir representante.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleReturn() {
    window.history.back();
  }
}
