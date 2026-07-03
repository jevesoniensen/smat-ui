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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmpregadorService } from '../services/EmpregadorService';
import { TipoEmpregador } from '../../../types/models';

@Component({
  selector: 'app-tipo-empregador',
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
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './Tipo.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/empregador.css']
})
export class TipoEmpregadorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private empregadorService = inject(EmpregadorService);
  private snackBar = inject(MatSnackBar);

  tipoForm!: FormGroup;
  loading = signal(false);
  selectedId = signal<string | number | null>(null);
  tipos = signal<TipoEmpregador[]>([]);

  displayedColumns: string[] = ['codigo', 'descricao', 'actions'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.tipoForm = this.fb.group({
      descricao: ['', [Validators.required]],
      codigo: ['']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const data = await this.empregadorService.listTiposEmpregador();
      this.tipos.set(data || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar tipos de empregador.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: TipoEmpregador) {
    this.selectedId.set(item.id);
    this.tipoForm.patchValue({
      descricao: item.descricao,
      codigo: item.codigo
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.tipoForm.reset({
      descricao: '',
      codigo: ''
    });
  }

  async handleSave() {
    if (this.tipoForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.tipoForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.empregadorService.updateTipoEmpregador(sid, val);
        this.snackBar.open('Tipo de empregador atualizado com sucesso!', 'OK', { duration: 3000 });
      } else {
        await this.empregadorService.createTipoEmpregador(val);
        this.snackBar.open('Tipo de empregador criado com sucesso!', 'OK', { duration: 3000 });
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao salvar tipo de empregador.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.empregadorService.deleteTipoEmpregador(sid);
      this.snackBar.open('Tipo de empregador excluído com sucesso!', 'OK', { duration: 3000 });
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao excluir tipo de empregador.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}
