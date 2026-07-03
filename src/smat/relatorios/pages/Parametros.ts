import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RelatorioService } from '../services/RelatorioService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { MonitorService } from '../../monitor/services/MonitorService';
import { Estado, Regional, Municipio, Campo, AuxCampo } from '../../../types/models';

@Component({
  selector: 'app-relatorio-parametros',
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
    MatRadioModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './Parametros.html',
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .grid-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 8px 0;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .w-100 {
      width: 100%;
    }
  `]
})
export class ParametrosRelatorioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private relatorioService = inject(RelatorioService);
  private parametrosService = inject(ParametrosService);
  private monitorService = inject(MonitorService);

  relatorioForm!: FormGroup;
  loading = signal(false);
  message = signal('');

  estados = signal<Estado[]>([]);
  campos = signal<Campo[]>([]);
  regionaisAvailable = signal<Regional[]>([]);
  municipiosAvailable = signal<Municipio[]>([]);
  registros1Available = signal<AuxCampo[]>([]);
  registros2Available = signal<AuxCampo[]>([]);

  ngOnInit() {
    this.initForm();
    this.fetchInitialData();
  }

  initForm() {
    this.relatorioForm = this.fb.group({
      periodicidade: [''],
      mesAnoInicial: [''],
      mesAnoFinal: [''],
      anoInicial: [''],
      anoFinal: [''],
      agrupamento: ['1'],
      estadoId: [''],
      regionais: [[]],
      municipios: [[]],
      campo1Id: [''],
      registros1: [[]],
      campo2Id: [''],
      registros2: [[]],
      titulo: ['', [Validators.required]],
      texto: ['']
    });
  }

  async fetchInitialData() {
    this.loading.set(true);
    try {
      const [est, cps] = await Promise.all([
        this.parametrosService.getEstados(),
        this.monitorService.getCampos(),
      ]);
      this.estados.set(est || []);
      this.campos.set(cps || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados iniciais.');
    } finally {
      this.loading.set(false);
    }
  }

  async onEstadoChange() {
    const val = this.relatorioForm.get('estadoId')?.value;
    this.regionaisAvailable.set([]);
    this.municipiosAvailable.set([]);
    this.relatorioForm.patchValue({ regionais: [], municipios: [] });

    if (val) {
      try {
        const [regs, muns] = await Promise.all([
            this.parametrosService.getRegionaisByEstado(val),
            this.parametrosService.getMunicipios(val)
        ]);
        this.regionaisAvailable.set(regs || []);
        this.municipiosAvailable.set(muns || []);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async onCampoChange(fieldNum: number) {
      const id = this.relatorioForm.get(`campo${fieldNum}Id`)?.value;
      if (fieldNum === 1) {
          this.registros1Available.set([]);
          this.relatorioForm.patchValue({ registros1: [] });
          if (id) {
              const regs = await this.monitorService.getQueryCampos(id);
              this.registros1Available.set(regs || []);
          }
      } else {
          this.registros2Available.set([]);
          this.relatorioForm.patchValue({ registros2: [] });
          if (id) {
              const regs = await this.monitorService.getQueryCampos(id);
              this.registros2Available.set(regs || []);
          }
      }
  }

  async handleGenerate() {
    if (this.relatorioForm.invalid) return;
    this.loading.set(true);
    try {
        const payload = this.relatorioForm.value;
        const reportData = await this.relatorioService.generateReport(payload);
        this.router.navigate(['/relatorios/relatorio'], { state: { relatorio: reportData } });
    } catch (error) {
        this.message.set('Erro ao gerar relatório.');
    } finally {
        this.loading.set(false);
    }
  }

  async handleSave() {
    if (this.relatorioForm.invalid) return;
    this.loading.set(true);
    try {
      const formValue = this.relatorioForm.value;
      const payload: any = {
          nomeRelatorio: formValue.titulo,
          parametros: {
              filtros: formValue
          }
      };
      await this.relatorioService.saveReport(payload);
      this.message.set('Relatório salvo com sucesso!');
    } catch (error) {
        this.message.set('Erro ao salvar relatório.');
    } finally {
        this.loading.set(false);
    }
  }

  handleClear() {
    this.relatorioForm.reset({
        agrupamento: '1',
        regionais: [],
        municipios: [],
        registros1: [],
        registros2: []
    });
    this.regionaisAvailable.set([]);
    this.municipiosAvailable.set([]);
    this.registros1Available.set([]);
    this.registros2Available.set([]);
    this.message.set('');
  }
}
