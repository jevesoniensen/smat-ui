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
import { RamoAtividade } from '../../../../types/models';

@Component({
  selector: 'app-ramo-atividade',
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
  templateUrl: './RamoAtividade.html',
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
export class RamoAtividadeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parametrosService = inject(ParametrosService);

  ramoForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  selectedId = signal<string | number | null>(null);

  items = signal<RamoAtividade[]>([]);
  parentItems = signal<RamoAtividade[]>([]);

  displayedColumns: string[] = ['area', 'ramo'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.ramoForm = this.fb.group({
      parentId: [''],
      nome: ['', [Validators.required]],
      cnae: ['', [Validators.maxLength(5)]]
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const data = await this.parametrosService.getRamosAtividade();
      this.items.set(data || []);
      // Typically Level 1 items are those without a parent
      this.parentItems.set((data || []).filter(r => !r.ramoSuperior || r.ramoSuperior === '0'));
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: RamoAtividade) {
    this.selectedId.set(item.id);
    this.ramoForm.patchValue({
      parentId: item.ramoSuperior || '',
      nome: item.nome,
      cnae: item.cnae
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.ramoForm.reset({
      parentId: '',
      nome: '',
      cnae: ''
    });
    this.message.set('');
  }

  async handleSave() {
    if (this.ramoForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.ramoForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.parametrosService.updateRamoAtividade(sid, val);
        this.message.set('Ramo de atividade atualizado com sucesso!');
      } else {
        await this.parametrosService.createRamoAtividade(val);
        this.message.set('Ramo de atividade criado com sucesso!');
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao salvar ramo de atividade.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.parametrosService.deleteRamoAtividade(sid);
      this.message.set('Ramo de atividade excluído com sucesso!');
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao excluir ramo de atividade.');
    } finally {
      this.loading.set(false);
    }
  }

  getParentName(parentId?: string | number) {
    if (!parentId || parentId === '0') return '-';
    return this.items().find(p => String(p.id) === String(parentId))?.nome || '-';
  }
}
