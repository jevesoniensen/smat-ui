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
import { LocalAtendimento, Estado, Municipio } from '../../../../types/models';

@Component({
  selector: 'app-local-atendimento',
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
  templateUrl: './LocalAtendimento.html',
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
export class LocalAtendimentoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parametrosService = inject(ParametrosService);

  atendimentoForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  selectedId = signal<string | number | null>(null);

  items = signal<LocalAtendimento[]>([]);
  estados = signal<Estado[]>([]);
  municipios = signal<Municipio[]>([]);

  displayedColumns: string[] = ['nome', 'municipio'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.atendimentoForm = this.fb.group({
      nome: ['', [Validators.required]],
      estadoId: ['', [Validators.required]],
      municipioId: ['', [Validators.required]]
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const [list, ufs] = await Promise.all([
        this.parametrosService.getLocaisAtendimento(),
        this.parametrosService.getEstados(),
      ]);
      this.items.set(list || []);
      this.estados.set(ufs || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  async onEstadoChange() {
    const val = this.atendimentoForm.get('estadoId')?.value;
    this.municipios.set([]);
    this.atendimentoForm.patchValue({ municipioId: '' });
    if (val) {
        this.loading.set(true);
        try {
            const data = await this.parametrosService.getMunicipios(val);
            this.municipios.set(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            this.loading.set(false);
        }
    }
  }

  handleSelect(item: LocalAtendimento) {
    this.selectedId.set(item.id);
    this.atendimentoForm.patchValue({
      nome: item.nome
    });
    // Would need to load state/municipality based on item
  }

  handleClear() {
    this.selectedId.set(null);
    this.atendimentoForm.reset({
      nome: '',
      estadoId: '',
      municipioId: ''
    });
    this.municipios.set([]);
    this.message.set('');
  }

  async handleSave() {
    if (this.atendimentoForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.atendimentoForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.parametrosService.updateLocalAtendimento(sid, val);
        this.message.set('Local de atendimento atualizado com sucesso!');
      } else {
        await this.parametrosService.createLocalAtendimento(val);
        this.message.set('Local de atendimento criado com sucesso!');
      }
      this.handleClear();
      const list = await this.parametrosService.getLocaisAtendimento();
      this.items.set(list || []);
    } catch (error) {
      this.message.set('Erro ao salvar local de atendimento.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.parametrosService.deleteLocalAtendimento(sid);
      this.message.set('Local de atendimento excluído com sucesso!');
      this.handleClear();
      const list = await this.parametrosService.getLocaisAtendimento();
      this.items.set(list || []);
    } catch (error) {
      this.message.set('Erro ao excluir local de atendimento.');
    } finally {
      this.loading.set(false);
    }
  }
}
