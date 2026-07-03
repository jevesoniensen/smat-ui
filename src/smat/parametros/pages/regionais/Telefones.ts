import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ParametrosService } from '../../services/ParametrosService';
import { TelefoneRegional } from '../../../../types/models';

@Component({
  selector: 'app-regional-telefones',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './Telefones.html',
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
export class TelefonesRegionalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private parametrosService = inject(ParametrosService);

  telefoneForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  regionalId = signal<string | number | null>(null);
  selectedId = signal<string | number | null>(null);
  telefones = signal<TelefoneRegional[]>([]);

  displayedColumns: string[] = ['numero', 'ramal'];

  ngOnInit() {
    this.initForm();
    const id = this.route.snapshot.queryParamMap.get('regionalId');
    if (id) {
      this.regionalId.set(id);
      this.fetchData(id);
    }
  }

  initForm() {
    this.telefoneForm = this.fb.group({
      numero: ['', [Validators.required, Validators.maxLength(20)]],
      ramal: ['', [Validators.maxLength(10)]]
    });
  }

  async fetchData(id: string | number) {
    this.loading.set(true);
    try {
      const data = await this.parametrosService.getTelefonesRegional(id);
      this.telefones.set(data || []);
    } catch (error) {
      this.message.set('Erro ao carregar telefones.');
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: TelefoneRegional) {
    this.selectedId.set(item.id);
    this.telefoneForm.patchValue({
      numero: item.numero,
      ramal: item.ramal
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.telefoneForm.reset({
      numero: '',
      ramal: ''
    });
    this.message.set('');
  }

  async handleSave() {
    const rid = this.regionalId();
    if (!rid || this.telefoneForm.invalid) return;

    this.loading.set(true);
    try {
      const val = this.telefoneForm.value;
      if (this.selectedId()) {
          this.message.set('Atualização não suportada, exclua e adicione novamente.');
      } else {
          await this.parametrosService.addTelefoneRegional(rid, val);
          this.message.set('Telefone adicionado com sucesso!');
          this.handleClear();
          this.fetchData(rid);
      }
    } catch (error) {
      this.message.set('Erro ao salvar telefone.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const rid = this.regionalId();
    const tid = this.selectedId();
    if (!rid || !tid) return;

    this.loading.set(true);
    try {
      await this.parametrosService.deleteTelefoneRegional(rid, tid);
      this.message.set('Telefone excluído com sucesso!');
      this.handleClear();
      this.fetchData(rid);
    } catch (error) {
      this.message.set('Erro ao excluir telefone.');
    } finally {
      this.loading.set(false);
    }
  }

  handleBack() {
    window.history.back();
  }
}
