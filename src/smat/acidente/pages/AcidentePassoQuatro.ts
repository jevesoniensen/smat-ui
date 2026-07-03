import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AcidenteService } from '../services/AcidenteService';
import { 
  LocalAtendimento, 
  Diagnostico, 
  Estado, 
  Fonte 
} from '../../../types/models';
import { maskDate } from '../../common/formatting';

const STORAGE_KEY = 'objAcidente';

@Component({
  selector: 'app-acidente-passo-quatro',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './AcidentePassoQuatro.html',
  styleUrls: ['../css/acidente.css']
})
export class AcidentePassoQuatroComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private acidenteService = inject(AcidenteService);

  acidenteForm!: FormGroup;
  errors = signal<string[]>([]);
  loading = signal(false);

  // Collections State
  locaisAtendimento = signal<LocalAtendimento[]>([]);
  diagnosticos = signal<Diagnostico[]>([]);
  estados = signal<Estado[]>([]);
  fontes = signal<Fonte[]>([]);

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.acidenteForm = this.fb.group({
      dataAtestado: [''],
      horaAtestado: [''],
      localAtendimento: [''],
      internacao: [''],
      afastamento: [''],
      duracaoTratamento: [''],
      descNaturezaLesao: [''],
      diagnostico: [''],
      descricaoDiagnostico: [''],
      observacoes: [''],
      crm: [''],
      ufCRM: [''],
      medicoNome: [''],
      fonte: [''],
      numDocFonte: [''],
      dataEmissaoFonte: [''],
      acao: [''],
      destino: [''],
      paginaAtual: ['PASSOQUATRO']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const [resLocais, resDiagnosticos, resEstados, resFontes] = await Promise.all([
        this.acidenteService.getAllLocaisAtendimento(),
        this.acidenteService.getAllDiagnosticos(),
        this.acidenteService.getAllEstados(),
        this.acidenteService.getAllFontes()
      ]);

      this.locaisAtendimento.set(resLocais || []);
      this.diagnosticos.set(resDiagnosticos || []);
      this.estados.set(resEstados || []);
      this.fontes.set(resFontes || []);

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedData = JSON.parse(saved);
        const safeData = { ...savedData };
        
        // Convert stored date strings back to Date objects for Material Datepicker
        ['dataAtestado', 'dataEmissaoFonte'].forEach(field => {
          if (safeData[field]) {
            const date = new Date(safeData[field]);
            if (!isNaN(date.getTime())) {
              safeData[field] = date;
            }
          }
        });
        
        this.acidenteForm.patchValue(safeData);
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      this.errors.set(['Erro ao carregar dados do formulário']);
    } finally {
      this.loading.set(false);
    }
  }

  onMaskInput(event: any, field: string) {
    const value = event.target.value;
    let newValue = value;

    if (field === 'dataAtestado' || field === 'dataEmissaoFonte') {
      newValue = maskDate(value);
    } else if (field === 'horaAtestado') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 2) newValue = cleanValue;
      else newValue = `${cleanValue.substring(0, 2)}:${cleanValue.substring(2, 4)}`;
    }

    if (newValue !== value) {
      this.acidenteForm.get(field)?.setValue(newValue, { emitEvent: false });
    }
  }

  saveToStorage() {
    const current = localStorage.getItem(STORAGE_KEY);
    const existing = current ? JSON.parse(current) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...this.acidenteForm.value }));
  }

  handleVoltar() {
    this.saveToStorage();
    this.router.navigate(['/acidentepassotres']);
  }

  handleAvancar() {
    const formValues = this.acidenteForm.value;
    const newErrors = [];
    if (!formValues.internacao) newErrors.push('Campo Internação é obrigatório');
    if (!formValues.afastamento) newErrors.push('Campo Afastamento é obrigatório');
    if (!formValues.diagnostico) newErrors.push('Diagnóstico é obrigatório');
    if (!formValues.fonte) newErrors.push('Fonte é obrigatória');
    if (!formValues.numDocFonte) newErrors.push('Número do documento da fonte é obrigatório');
    if (!formValues.dataEmissaoFonte) newErrors.push('Data de emissão da fonte é obrigatória');

    if (newErrors.length > 0) {
      this.errors.set(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    this.saveToStorage();
    this.router.navigate(['/acidentegravar']);
  }
}
