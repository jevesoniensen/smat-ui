import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MonitorService } from '../services/MonitorService';
import { Monitor, Campo, AuxCampo } from '../../../types/models';

@Component({
  selector: 'app-monitor',
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
    MatTableModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './Monitor.html',
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .w-100 {
      width: 100%;
    }
    .clickable-row {
      cursor: pointer;
    }
    .clickable-row:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class MonitorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private monitorService = inject(MonitorService);

  monitorForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  monitorId = signal<string | number | null>(null);

  monitores = signal<Monitor[]>([]);
  campos = signal<Campo[]>([]);
  queryCampos = signal<AuxCampo[]>([]);

  displayedColumns: string[] = ['monitor', 'informacao', 'registro', 'ultimaExecucao'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.monitorForm = this.fb.group({
      periodicidade: [0, [Validators.required, Validators.min(1)]],
      campo: [0, [Validators.required, Validators.min(1)]],
      queryCampo: [0, [Validators.required, Validators.min(1)]],
      maxAcidente: [0, [Validators.required, Validators.min(1)]],
      ultimaExecucao: ['']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const [monitorsData, camposData] = await Promise.all([
        this.monitorService.getMonitores(),
        this.monitorService.getCampos(),
      ]);
      this.monitores.set(monitorsData || []);
      this.campos.set(camposData || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  async onCampoChange() {
    const campoId = this.monitorForm.get('campo')?.value;
    this.queryCampos.set([]);
    this.monitorForm.patchValue({ queryCampo: 0 });

    if (campoId > 0) {
      this.loading.set(true);
      try {
        const queryData = await this.monitorService.getQueryCampos(campoId.toString());
        this.queryCampos.set(queryData || []);
      } catch (error) {
        console.error(error);
      } finally {
        this.loading.set(false);
      }
    }
  }

  async handleSelectMonitor(monitor: Monitor) {
    this.monitorId.set(monitor.monitor || null);
    this.monitorForm.patchValue({
      periodicidade: monitor.periodicidade,
      campo: monitor.campo,
      maxAcidente: monitor.maxAcidente,
      ultimaExecucao: (monitor as any).ultimaExecucao || ''
    });

    if (monitor.campo) {
        this.loading.set(true);
        try {
            const data = await this.monitorService.getQueryCampos(monitor.campo.toString());
            this.queryCampos.set(data || []);
            this.monitorForm.patchValue({ queryCampo: monitor.queryCampo });
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }
  }

  handleClear() {
    this.monitorId.set(null);
    this.monitorForm.reset({
      periodicidade: 0,
      campo: 0,
      queryCampo: 0,
      maxAcidente: 0,
      ultimaExecucao: ''
    });
    this.queryCampos.set([]);
    this.message.set('');
  }

  async handleSave() {
    if (this.monitorForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.monitorForm.value;
      const id = this.monitorId();
      if (id) {
        await this.monitorService.updateMonitor(id, val);
        this.message.set('Monitor atualizado com sucesso!');
      } else {
        await this.monitorService.createMonitor(val);
        this.message.set('Monitor criado com sucesso!');
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao salvar monitor.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const id = this.monitorId();
    if (!id) return;
    this.loading.set(true);
    try {
      await this.monitorService.deleteMonitor(id);
      this.message.set('Monitor excluído com sucesso!');
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao excluir monitor.');
    } finally {
      this.loading.set(false);
    }
  }
}
