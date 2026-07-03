import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PessoasService } from '../services/PessoasService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { Testemunha, Estado, Municipio } from '../../../types/models';

@Component({
  selector: 'app-cadastro-testemunha',
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
    MatSelectModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './CadastroTestemunha.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css']
})
export class CadastroTestemunhaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pessoasService = inject(PessoasService);
  private parametrosService = inject(ParametrosService);
  private snackBar = inject(MatSnackBar);

  testemunhaForm!: FormGroup;
  loading = signal(false);
  selectedId = signal<string | number | null>(null);

  testemunhas = signal<Testemunha[]>([]);
  estados = signal<Estado[]>([]);
  municipios = signal<Municipio[]>([]);

  displayedColumns: string[] = ['nome', 'municipio', 'telefone'];

  ngOnInit() {
    this.initForm();
    this.fetchInitialData();
  }

  initForm() {
    this.testemunhaForm = this.fb.group({
      nome: ['', [Validators.required]],
      estadoId: [''],
      municipioId: [''],
      rua: [''],
      bairro: [''],
      numero: [''],
      complemento: [''],
      cep: [''],
      ddd: [''],
      telefone: ['']
    });
  }

  async fetchInitialData() {
    this.loading.set(true);
    try {
      const [list, estadosList] = await Promise.all([
        this.pessoasService.listTestemunhas(),
        this.parametrosService.getEstados(),
      ]);
      this.testemunhas.set(list || []);
      this.estados.set(estadosList || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async onEstadoChange() {
    const val = this.testemunhaForm.get('estadoId')?.value;
    this.municipios.set([]);
    this.testemunhaForm.patchValue({ municipioId: '' });

    if (val) {
      this.loading.set(true);
      try {
        const muns = await this.parametrosService.getMunicipios(val);
        this.municipios.set(muns || []);
      } catch (error) {
        console.error(error);
      } finally {
        this.loading.set(false);
      }
    }
  }

  async handleSelect(item: Testemunha) {
    this.selectedId.set(item.id);
    this.testemunhaForm.patchValue({
        nome: item.nome,
        estadoId: item.estadoId,
        municipioId: item.municipioId,
        rua: item.rua,
        bairro: item.bairro,
        numero: item.numero,
        complemento: item.complemento,
        cep: item.cep,
        ddd: item.ddd,
        telefone: item.telefone
    });

    if (item.estadoId) {
        this.loading.set(true);
        try {
            const data = await this.parametrosService.getMunicipios(item.estadoId);
            this.municipios.set(data || []);
            this.testemunhaForm.patchValue({ municipioId: item.municipioId });
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }
  }

  handleClear() {
    this.selectedId.set(null);
    this.testemunhaForm.reset({
        nome: '',
        estadoId: '',
        municipioId: '',
        rua: '',
        bairro: '',
        numero: '',
        complemento: '',
        cep: '',
        ddd: '',
        telefone: ''
    });
    this.municipios.set([]);
  }

  async handleSave() {
    if (this.testemunhaForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.testemunhaForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.pessoasService.updateTestemunha(String(sid), val);
        this.snackBar.open('Testemunha atualizada com sucesso!', 'OK', { duration: 3000 });
      } else {
        await this.pessoasService.createTestemunha(val);
        this.snackBar.open('Testemunha criada com sucesso!', 'OK', { duration: 3000 });
      }
      this.handleClear();
      const list = await this.pessoasService.listTestemunhas();
      this.testemunhas.set(list || []);
    } catch (error) {
      this.snackBar.open('Erro ao salvar testemunha.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.pessoasService.deleteTestemunha(String(sid));
      this.snackBar.open('Testemunha excluída com sucesso!', 'OK', { duration: 3000 });
      this.handleClear();
      const list = await this.pessoasService.listTestemunhas();
      this.testemunhas.set(list || []);
    } catch (error) {
      this.snackBar.open('Erro ao excluir testemunha.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleReturn() {
    window.history.back();
  }
}
