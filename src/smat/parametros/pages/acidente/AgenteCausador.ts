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
import { ParametrosService } from '../../services/ParametrosService';
import { AgenteCausador } from '../../../../types/models';

@Component({
  selector: 'app-agente-causador',
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
  templateUrl: './AgenteCausador.html',
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
    .selected-row {
      background: rgba(0, 0, 0, 0.08) !important;
    }
  `]
})
export class AgenteCausadorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parametrosService = inject(ParametrosService);

  agenteForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  selectedId = signal<string | number | null>(null);

  items = signal<AgenteCausador[]>([]);
  level1Items = signal<AgenteCausador[]>([]);
  level2Items = signal<AgenteCausador[]>([]);

  displayedColumns: string[] = ['descricao', 'tipo', 'causa'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.agenteForm = this.fb.group({
      voId: [''],
      paiId: [''],
      descricao: ['', [Validators.required]],
      obs: ['']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const data = await this.parametrosService.getAgentesCausadores();
      this.items.set(data || []);
      // Filter level 1 logic
      this.level1Items.set(data || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  async onVoChange() {
    const val = this.agenteForm.get('voId')?.value;
    this.level2Items.set([]);
    this.agenteForm.patchValue({ paiId: '' });
    if (val) {
        // Logic to fetch or filter level 2 items
    }
  }

  handleSelect(item: AgenteCausador) {
    this.selectedId.set(item.id);
    this.agenteForm.patchValue({
      descricao: item.descricao,
      obs: (item as any).categoria || ''
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.agenteForm.reset({
      voId: '',
      paiId: '',
      descricao: '',
      obs: ''
    });
    this.message.set('');
  }

  async handleSave() {
    if (this.agenteForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.agenteForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.parametrosService.updateAgenteCausador(sid, val);
        this.message.set('Agente causador atualizado com sucesso!');
      } else {
        await this.parametrosService.createAgenteCausador(val);
        this.message.set('Agente causador criado com sucesso!');
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao salvar agente causador.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.parametrosService.deleteAgenteCausador(sid);
      this.message.set('Agente causador excluído com sucesso!');
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao excluir agente causador.');
    } finally {
      this.loading.set(false);
    }
  }
}
