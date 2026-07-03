import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmpregadorService } from '../services/EmpregadorService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { AcidenteService } from '../../acidente/services/AcidenteService';
import { Empregador, TipoEmpregador, RamoAtividade, Estado, Municipio } from '../../../types/models';

@Component({
  selector: 'app-empregador',
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
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './Empregador.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/empregador.css']
})
export class EmpregadorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private empregadorService = inject(EmpregadorService);
  private parametrosService = inject(ParametrosService);
  private acidenteService = inject(AcidenteService);
  private snackBar = inject(MatSnackBar);

  empregadorForm!: FormGroup;
  loading = signal(false);
  empregadorId = signal<string | number | null>(null);
  returnPath = signal<string | null>(null);
  documentLabel = signal('Documento');

  empregadores = signal<Empregador[]>([]);
  tiposEmpregador = signal<TipoEmpregador[]>([]);
  ramosSuperiores = signal<RamoAtividade[]>([]);
  allRamosAtividade = signal<RamoAtividade[]>([]);
  filteredRamosAtividade = signal<RamoAtividade[]>([]);
  estados = signal<Estado[]>([]);
  municipios = signal<Municipio[]>([]);

  displayedColumns: string[] = ['razaoSocial', 'documento', 'municipio', 'actions'];

  ngOnInit() {
    this.initForm();
    this.fetchInitialData();
  }

  initForm() {
    this.empregadorForm = this.fb.group({
      tipoEmpregadorId: ['', [Validators.required]],
      ramoSuperiorId: ['', [Validators.required]],
      ramoAtividadeId: ['', [Validators.required]],
      estadoId: ['', [Validators.required]],
      municipioId: ['', [Validators.required]],
      documento: [''],
      razaoSocial: ['', [Validators.required]],
      rua: ['', [Validators.required]],
      bairro: ['', [Validators.required]],
      numero: ['', [Validators.required]],
      complemento: [''],
      cep: ['', [Validators.required]]
    });
  }

  async fetchInitialData() {
    this.loading.set(true);
    try {
      const [tipos, ramos, sts, emps] = await Promise.all([
        this.parametrosService.getTiposEmpregador(),
        this.parametrosService.getRamosAtividade(),
        this.acidenteService.getAllEstados(),
        this.empregadorService.listEmpregadores()
      ]);

      this.tiposEmpregador.set(tipos || []);
      this.allRamosAtividade.set(ramos || []);
      this.ramosSuperiores.set((ramos || []).filter(r => !r.ramoSuperior || r.ramoSuperior === '0'));
      this.estados.set(sts || []);
      this.empregadores.set(emps || []);

      const state = window.history.state;
      if (state) {
        if (state.returnPath) this.returnPath.set(state.returnPath);
        if (state.empregadorToEdit) {
            this.handleSelectEmpregador(state.empregadorToEdit);
        }
      }
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados iniciais.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  onTipoEmpregadorChange() {
    const val = this.empregadorForm.get('tipoEmpregadorId')?.value;
    const selectedType = this.tiposEmpregador().find(t => String(t.id || (t as any).tipoEmpregador) === val);
    if (selectedType) {
        if (selectedType.codigo === 'PF') this.documentLabel.set('CPF');
        else if (selectedType.codigo === 'PJ') this.documentLabel.set('CNPJ');
        else this.documentLabel.set('Documento');
    } else {
        this.documentLabel.set('Documento');
    }
  }

  onRamoSuperiorChange() {
    const val = this.empregadorForm.get('ramoSuperiorId')?.value;
    if (val) {
      const subRamos = this.allRamosAtividade().filter(r => String(r.ramoSuperior) === val);
      this.filteredRamosAtividade.set(subRamos);
    } else {
      this.filteredRamosAtividade.set([]);
    }
    this.empregadorForm.patchValue({ ramoAtividadeId: '' });
  }

  async onEstadoChange() {
    const val = this.empregadorForm.get('estadoId')?.value;
    if (val) {
      try {
        const muns = await this.acidenteService.getMunicipios(val);
        this.municipios.set(muns || []);
      } catch (error) {
        console.error(error);
        this.municipios.set([]);
      }
    } else {
      this.municipios.set([]);
    }
    this.empregadorForm.patchValue({ municipioId: '' });
  }

  async handleSelectEmpregador(emp: Empregador) {
    this.empregadorId.set(emp.id);
    
    const currentRamo = this.allRamosAtividade().find(r => String(r.id) === String(emp.ramoAtividade));
    const supId = currentRamo?.ramoSuperior || '';

    this.empregadorForm.patchValue({
        tipoEmpregadorId: String(emp.tipoEmpregador || ''),
        ramoSuperiorId: String(supId),
        ramoAtividadeId: String(emp.ramoAtividade || ''),
        estadoId: String(emp.estado || '').trim(),
        municipioId: String(emp.municipio || ''),
        documento: emp.documento,
        razaoSocial: emp.razaoSocial,
        rua: emp.rua,
        numero: String(emp.numero || ''),
        bairro: emp.bairro,
        complemento: emp.complemento || '',
        cep: emp.cep,
    });

    this.onTipoEmpregadorChange();
    this.onRamoSuperiorChange();
    if (emp.estado) {
        try {
            const muns = await this.acidenteService.getMunicipios(emp.estado);
            this.municipios.set(muns || []);
            this.empregadorForm.patchValue({ municipioId: String(emp.municipio || '') });
        } catch (error) {
            console.error(error);
        }
    }
  }

  async handleSave() {
    if (this.empregadorForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.empregadorForm.value;
      const payload: any = {
          ramoAtividade: Number(val.ramoAtividadeId),
          estado: val.estadoId,
          municipio: Number(val.municipioId),
          razaoSocial: val.razaoSocial,
          documento: val.documento,
          numero: Number(val.numero),
          rua: val.rua,
          bairro: val.bairro,
          cep: val.cep,
          complemento: val.complemento || '',
          tipoEmpregador: Number(val.tipoEmpregadorId)
      };

      const id = this.empregadorId();
      if (id) {
        await this.empregadorService.updateEmpregador(id, payload);
        this.snackBar.open('Empregador atualizado com sucesso!', 'OK', { duration: 3000 });
      } else {
        await this.empregadorService.createEmpregador(payload);
        this.snackBar.open('Empregador criado com sucesso!', 'OK', { duration: 3000 });
      }
      this.handleClear();
      const list = await this.empregadorService.listEmpregadores();
      this.empregadores.set(list || []);
    } catch (error) {
      this.snackBar.open('Erro ao salvar empregador.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const id = this.empregadorId();
    if (!id) return;
    this.loading.set(true);
    try {
      await this.empregadorService.deleteEmpregador(id);
      this.snackBar.open('Empregador excluído com sucesso!', 'OK', { duration: 3000 });
      this.handleClear();
      const list = await this.empregadorService.listEmpregadores();
      this.empregadores.set(list || []);
    } catch (error) {
      this.snackBar.open('Erro ao excluir empregador.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleClear() {
    this.empregadorId.set(null);
    this.empregadorForm.reset({
      tipoEmpregadorId: '',
      ramoSuperiorId: '',
      ramoAtividadeId: '',
      estadoId: '',
      municipioId: '',
      documento: '',
      razaoSocial: '',
      rua: '',
      numero: '',
      bairro: '',
      complemento: '',
      cep: '',
    });
    this.filteredRamosAtividade.set([]);
    this.municipios.set([]);
    this.documentLabel.set('Documento');
  }

  handleReturn() {
    const rp = this.returnPath();
    if (rp) {
      this.router.navigate([rp]);
    } else {
      window.history.back();
    }
  }

  handleAddTelefone(id: string | number) {
      this.router.navigate(['/telefonesempregador'], { queryParams: { empregador: id } });
  }
}
