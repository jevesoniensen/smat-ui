import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AcidenteService } from '../services/AcidenteService';
import { Estado, Municipio } from '../../../types/models';
import { formatCEP, maskPhone } from '../../common/formatting';

const TESTEMUNHAS_STORAGE_KEY = 'vTestemunhas';

@Component({
  selector: 'app-acidente-passo-tres',
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
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './AcidentePassoTres.html',
  styleUrls: ['../css/acidente.css']
})
export class AcidentePassoTresComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private acidenteService = inject(AcidenteService);

  testemunhaForm!: FormGroup;
  errors = signal<string[]>([]);
  loading = signal(false);

  // Collections State
  estados = signal<Estado[]>([]);
  municipiosTestemunha = signal<Municipio[]>([]);
  vTestemunhas = signal<any[]>([]);

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.testemunhaForm = this.fb.group({
      nomeTestemunha: [''],
      estadoTestemunha: [''],
      municipioTestemunha: [''],
      ruaTestemunha: [''],
      bairroTestemunha: [''],
      numeroTestemunha: [''],
      complementoTestemunha: [''],
      cepTestemunha: [''],
      dddTestemunha: [''],
      telefoneTestemunha: [''],
      acao: [''],
      destino: [''],
      paginaAtual: ['PASSOTRES']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const statesData = await this.acidenteService.getAllEstados();
      this.estados.set(statesData || []);

      const savedTestemunhas = localStorage.getItem(TESTEMUNHAS_STORAGE_KEY);
      if (savedTestemunhas) {
        this.vTestemunhas.set(JSON.parse(savedTestemunhas));
      }
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onMaskInput(event: any, field: string) {
    const value = event.target.value;
    let newValue = value;

    if (field === 'cepTestemunha') {
      newValue = formatCEP(value);
    } else if (field === 'telefoneTestemunha') {
      newValue = maskPhone(value);
    }

    if (newValue !== value) {
      this.testemunhaForm.get(field)?.setValue(newValue, { emitEvent: false });
    }
  }

  async onEstadoChange() {
    const sigla = this.testemunhaForm.get('estadoTestemunha')?.value;
    if (sigla) {
      try {
        const data = await this.acidenteService.getMunicipios(sigla);
        this.municipiosTestemunha.set(data || []);
      } catch (error) {
        console.error('Error loading municipios:', error);
        this.municipiosTestemunha.set([]);
      }
    } else {
      this.municipiosTestemunha.set([]);
    }
    this.testemunhaForm.get('municipioTestemunha')?.setValue('');
  }

  handleInserirTestemunha() {
    const formValue = this.testemunhaForm.value;
    if (!formValue.nomeTestemunha) {
      this.errors.set(['Nome da testemunha é obrigatório para inserir']);
      return;
    }

    const newList = [...this.vTestemunhas(), { ...formValue }];
    this.vTestemunhas.set(newList);
    localStorage.setItem(TESTEMUNHAS_STORAGE_KEY, JSON.stringify(newList));
    this.handleLimparForm();
    this.errors.set([]);
  }

  handleExcluirTestemunha(index: number) {
    const newList = this.vTestemunhas().filter((_, i) => i !== index);
    this.vTestemunhas.set(newList);
    localStorage.setItem(TESTEMUNHAS_STORAGE_KEY, JSON.stringify(newList));
  }

  handleLimparForm() {
    this.testemunhaForm.patchValue({
      nomeTestemunha: '',
      estadoTestemunha: '',
      municipioTestemunha: '',
      ruaTestemunha: '',
      bairroTestemunha: '',
      numeroTestemunha: '',
      complementoTestemunha: '',
      cepTestemunha: '',
      dddTestemunha: '',
      telefoneTestemunha: ''
    });
    this.municipiosTestemunha.set([]);
  }

  handleVoltar() {
    this.router.navigate(['/acidentepassodois']);
  }

  handleAvancar() {
    this.router.navigate(['/acidentepassoquatro']);
  }
}
