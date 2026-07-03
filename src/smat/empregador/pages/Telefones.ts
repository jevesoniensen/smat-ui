import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
import { TelefoneEmpregador, Empregador } from '../../../types/models';

@Component({
  selector: 'app-empregador-telefones',
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
  templateUrl: './Telefones.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/empregador.css']
})
export class TelefonesEmpregadorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private empregadorService = inject(EmpregadorService);
  private snackBar = inject(MatSnackBar);

  telefoneForm!: FormGroup;
  loading = signal(false);
  empregadorId = signal<string | number | null>(null);
  telefoneId = signal<string | number | null>(null);
  
  empregador = signal<Empregador | null>(null);
  telefones = signal<TelefoneEmpregador[]>([]);

  displayedColumns: string[] = ['ddd', 'numero', 'descricao', 'actions'];

  ngOnInit() {
    this.initForm();
    const id = this.route.snapshot.queryParamMap.get('empregador');
    if (id) {
      this.empregadorId.set(id);
      this.fetchData(id);
    }
  }

  initForm() {
    this.telefoneForm = this.fb.group({
      ddd: ['', [Validators.required, Validators.maxLength(2)]],
      numero: ['', [Validators.required, Validators.maxLength(9)]],
      descricao: ['', [Validators.required]]
    });
  }

  async fetchData(id: string | number) {
    this.loading.set(true);
    try {
      const [emp, tels] = await Promise.all([
        this.empregadorService.getEmpregador(id),
        this.empregadorService.getTelefones(id),
      ]);
      this.empregador.set(emp);
      this.telefones.set(tels || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(tel: TelefoneEmpregador) {
    this.telefoneId.set(tel.id);
    this.telefoneForm.patchValue({
      ddd: tel.ddd,
      numero: tel.numero,
      descricao: tel.descricao
    });
  }

  handleClear() {
    this.telefoneId.set(null);
    this.telefoneForm.reset({
      ddd: '',
      numero: '',
      descricao: ''
    });
  }

  async handleSave() {
    const eid = this.empregadorId();
    if (!eid || this.telefoneForm.invalid) return;

    this.loading.set(true);
    try {
      const val = this.telefoneForm.value;
      const tid = this.telefoneId();
      if (tid) {
        await this.empregadorService.updateTelefone(eid, tid, val);
        this.snackBar.open('Telefone atualizado com sucesso!', 'OK', { duration: 3000 });
      } else {
        await this.empregadorService.addTelefone(eid, val);
        this.snackBar.open('Telefone adicionado com sucesso!', 'OK', { duration: 3000 });
      }
      this.handleClear();
      this.fetchData(eid);
    } catch (error) {
      this.snackBar.open('Erro ao salvar telefone.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const eid = this.empregadorId();
    const tid = this.telefoneId();
    if (!eid || !tid) return;

    this.loading.set(true);
    try {
      await this.empregadorService.deleteTelefone(eid, tid);
      this.snackBar.open('Telefone excluído com sucesso!', 'OK', { duration: 3000 });
      this.handleClear();
      this.fetchData(eid);
    } catch (error) {
      this.snackBar.open('Erro ao excluir telefone.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleBack() {
    window.history.back();
  }
}
