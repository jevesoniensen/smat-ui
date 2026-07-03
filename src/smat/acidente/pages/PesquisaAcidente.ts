import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AcidenteService } from '../services/AcidenteService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { Estado, Regional, Municipio, TipoAcidente } from '../../../types/models';

@Component({
  selector: 'app-pesquisa-acidente',
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
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './PesquisaAcidente.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/acidente.css']
})
export class PesquisaAcidenteComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private acidenteService = inject(AcidenteService);
  private parametrosService = inject(ParametrosService);
  private snackBar = inject(MatSnackBar);

  pesquisaForm!: FormGroup;
  loading = signal(false);

  // Collections State
  estados = signal<Estado[]>([]);
  regionais = signal<Regional[]>([]);
  municipios = signal<Municipio[]>([]);
  tiposAcidente = signal<TipoAcidente[]>([]);

  ngOnInit() {
    this.initForm();
    this.fetchInitialData();
  }

  initForm() {
    this.pesquisaForm = this.fb.group({
      estado: [''],
      regional: [''],
      municipio: [''],
      dataInicial: [''],
      dataFinal: [''],
      amputacao: [''],
      obito: [''],
      registroPolicial: [''],
      internacao: [''],
      tipoAcidente: ['']
    });
  }

  async fetchInitialData() {
    this.loading.set(true);
    try {
      const [est, tipos] = await Promise.all([
        this.parametrosService.getEstados(),
        this.parametrosService.getTiposAcidente()
      ]);
      this.estados.set(est || []);
      this.tiposAcidente.set(tipos || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados iniciais.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async onEstadoChange() {
    const val = this.pesquisaForm.get('estado')?.value;
    this.pesquisaForm.patchValue({ regional: '', municipio: '' });
    this.regionais.set([]);
    this.municipios.set([]);

    if (val) {
      try {
        const regs = await this.parametrosService.getRegionaisByEstado(val);
        this.regionais.set(regs || []);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async onRegionalChange() {
    const estadoId = this.pesquisaForm.get('estado')?.value;
    this.pesquisaForm.patchValue({ municipio: '' });
    
    if (estadoId) {
      try {
        const muns = await this.parametrosService.getMunicipios(estadoId);
        this.municipios.set(muns || []);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async handleConsultar() {
    this.loading.set(true);
    try {
      const filters = this.pesquisaForm.value;
      const results = await this.acidenteService.listAcidentes(filters);
      this.router.navigate(['/resultadopesquisa'], { state: { results, filters } });
    } catch (error) {
      this.snackBar.open('Erro ao realizar consulta.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleLimpar() {
    this.pesquisaForm.reset({
      estado: '',
      regional: '',
      municipio: '',
      dataInicial: '',
      dataFinal: '',
      amputacao: '',
      obito: '',
      registroPolicial: '',
      internacao: '',
      tipoAcidente: ''
    });
    this.regionais.set([]);
    this.municipios.set([]);
  }
}
