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
import { LocalLesao } from '../../../../types/models';

@Component({
  selector: 'app-locais-lesao',
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
  templateUrl: './LocaisLesao.html',
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
export class LocaisLesaoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parametrosService = inject(ParametrosService);

  lesaoForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  selectedId = signal<string | number | null>(null);

  items = signal<LocalLesao[]>([]);
  parentItems = signal<LocalLesao[]>([]);

  displayedColumns: string[] = ['nome', 'principal'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.lesaoForm = this.fb.group({
      parentId: [''],
      nome: ['', [Validators.required]]
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const data = await this.parametrosService.getLocaisLesao();
      this.items.set(data || []);
      // Filter level 1 logic
      this.parentItems.set(data || []);
    } catch (error) {
      this.message.set('Erro ao carregar dados.');
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: LocalLesao) {
    this.selectedId.set(item.id);
    this.lesaoForm.patchValue({
      nome: item.nome
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.lesaoForm.reset({
      parentId: '',
      nome: ''
    });
    this.message.set('');
  }

  async handleSave() {
    if (this.lesaoForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.lesaoForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.parametrosService.updateLocalLesao(sid, val);
        this.message.set('Local de lesão atualizado com sucesso!');
      } else {
        await this.parametrosService.createLocalLesao(val);
        this.message.set('Local de lesão criado com sucesso!');
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao salvar local de lesão.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.parametrosService.deleteLocalLesao(sid);
      this.message.set('Local de lesão excluído com sucesso!');
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao excluir local de lesão.');
    } finally {
      this.loading.set(false);
    }
  }
}
