import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AcidenteService } from '../services/AcidenteService';
import { 
  Emitente, 
  EstadoCivil, 
  Ocupacao, 
  VinculoEmpregaticio, 
  Area, 
  Estado,
  Municipio
} from '../../../types/models';
import { maskDate, formatCPF, formatCEP, maskPhone } from '../../common/formatting';
import { isValidCPF } from '../../common/validation';

const STORAGE_KEY = 'objAcidente';

@Component({
  selector: 'app-acidente-passo-um',
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
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './AcidentePassoUm.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/acidente.css']
})
export class AcidentePassoUmComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private acidenteService = inject(AcidenteService);
  private snackBar = inject(MatSnackBar);

  acidenteForm!: FormGroup;
  errors = signal<string[]>([]);
  loading = signal(false);

  // Collections State
  emitentes = signal<Emitente[]>([]);
  estadosCivis = signal<EstadoCivil[]>([]);
  ocupacoes = signal<Ocupacao[]>([]);
  vinculos = signal<VinculoEmpregaticio[]>([]);
  areas = signal<Area[]>([]);
  estados = signal<Estado[]>([]);
  municipios = signal<Municipio[]>([]);

  async ngOnInit() {
    this.initForm();
    this.loading.set(true);
    try {
      await this.loadCollections();
      this.loadSavedData();
      this.handleNavigationState();
    } finally {
      this.loading.set(false);
    }
  }

  initForm() {
    this.acidenteForm = this.fb.group({
      emitente: ['0'],
      empregadorId: [''],
      documento: [''],
      razaoSocial: [''],
      nome: [''],
      nomeResponsavel: [''],
      dataNascimento: ['', Validators.required],
      estadoCivil: ['0'],
      ctps: [''],
      serie: [''],
      dataEmissaoCTPS: [''],
      ufCTPS: ['0'],
      remuneracaoMensal: [''],
      pisPasepNit: [''],
      rg: [''],
      dataEmissaoRG: [''],
      orgaoExpedidorRG: [''],
      ufRG: ['0'],
      cpf: [''],
      sexo: [''],
      ocupacao: ['0'],
      aposentado: [''],
      area: ['0'],
      vinculoEmpregaticio: ['0'],
      estado: [''],
      municipio: ['0'],
      rua: [''],
      bairro: [''],
      numero: [''],
      complemento: [''],
      cep: [''],
      ddd: [''],
      telefone: [''],
      acao: [''],
      destino: [''],
      paginaAtual: ['PASSOUM']
    });
  }

  async loadCollections() {
    try {
      const [e, ec, o, v, a, st] = await Promise.all([
        this.acidenteService.getAllEmitentes(),
        this.acidenteService.getAllEstadosCivis(),
        this.acidenteService.getAllOcupacoes(),
        this.acidenteService.getAllVinculosEmpregaticios(),
        this.acidenteService.getAllAreas(),
        this.acidenteService.getAllEstados()
      ]);
      this.emitentes.set(e || []);
      this.estadosCivis.set(ec || []);
      this.ocupacoes.set(o || []);
      this.vinculos.set(v || []);
      this.areas.set(a || []);
      this.estados.set(st || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  }

  loadSavedData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedData = JSON.parse(saved);
      const safeData = { ...savedData };
      
      // Convert stored date strings back to Date objects for Material Datepicker
      ['dataNascimento', 'dataEmissaoCTPS', 'dataEmissaoRG'].forEach(field => {
        if (safeData[field]) {
          const date = new Date(safeData[field]);
          if (!isNaN(date.getTime())) {
            safeData[field] = date;
          }
        }
      });
      
      this.acidenteForm.patchValue(safeData);

      if (safeData.estado && safeData.estado !== '0' && safeData.estado !== '') {
        this.acidenteService.getMunicipios(safeData.estado).then(m => this.municipios.set(m)).catch(console.error);
      }
    }
  }

  handleNavigationState() {
    const state = window.history.state;
    if (state && state.selectedEmpregador) {
      const emp = state.selectedEmpregador;
      this.acidenteForm.patchValue({
        empregadorId: emp.id || '',
        documento: emp.documento || '',
        razaoSocial: emp.razaoSocial || ''
      });
    }
  }

  onMaskInput(event: any, field: string) {
    const value = event.target.value;
    let newValue = value;

    if (field === 'cpf') {
      newValue = formatCPF(value);
    } else if (field === 'cep') {
      newValue = formatCEP(value);
    } else if (field === 'telefone') {
      newValue = maskPhone(value);
    }

    if (newValue !== value) {
      this.acidenteForm.get(field)?.setValue(newValue, { emitEvent: false });
    }
  }

  async onEstadoChange() {
    const sigla = this.acidenteForm.get('estado')?.value;
    if (sigla) {
      try {
        const m = await this.acidenteService.getMunicipios(sigla);
        this.municipios.set(m || []);
      } catch (error) {
        console.error('Error loading municipios:', error);
        this.municipios.set([]);
      }
    } else {
      this.municipios.set([]);
    }
    this.acidenteForm.get('municipio')?.setValue('0');
  }

  handlePesquisarEmpresa() {
    this.saveToStorage();
    this.router.navigate(['/pesquisaempregador'], { state: { returnPath: '/acidentepassoum' } });
  }

  saveToStorage() {
    const current = localStorage.getItem(STORAGE_KEY);
    const existing = current ? JSON.parse(current) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...this.acidenteForm.value }));
  }

  handleAvancar() {
    const formValues = this.acidenteForm.value;
    const newErrors = [];

    if (formValues.emitente === '0') newErrors.push('Emitente é obrigatório');
    if (!formValues.nome) newErrors.push('Nome é obrigatório');
    if (!formValues.dataNascimento) newErrors.push('Data de nascimento é obrigatória');
    if (!formValues.sexo) newErrors.push('Sexo é obrigatório');
    if (formValues.ocupacao === '0') newErrors.push('Ocupação é obrigatória');
    if (!formValues.aposentado) newErrors.push('Campo Aposentado é obrigatório');
    if (formValues.area === '0') newErrors.push('Área é obrigatória');
    if (formValues.vinculoEmpregaticio === '0') newErrors.push('Vínculo empregatício é obrigatório');
    
    if (formValues.cpf && !isValidCPF(formValues.cpf)) {
      newErrors.push('CPF inválido');
    }

    if (newErrors.length > 0) {
      this.errors.set(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    this.saveToStorage();
    this.router.navigate(['/acidentepassodois']);
  }
}
