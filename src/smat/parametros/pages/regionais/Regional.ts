import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ParametrosService } from '../../services/ParametrosService';
import { Regional } from '../../../../types/models';

@Component({
  selector: 'app-regional',
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
  templateUrl: './Regional.html',
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
export class RegionalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private parametrosService = inject(ParametrosService);

  regionalForm!: FormGroup;
  loading = signal(false);
  message = signal('');
  selectedId = signal<string | number | null>(null);
  items = signal<Regional[]>([]);

  displayedColumns: string[] = ['nome', 'endereco', 'telefones'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.regionalForm = this.fb.group({
      nome: ['', [Validators.required]],
      endereco: ['']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const data = await this.parametrosService.getRegionais();
      this.items.set(data || []);
    } catch (error) {
      this.message.set('Erro ao carregar regionais.');
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: Regional) {
    this.selectedId.set(item.id);
    this.regionalForm.patchValue({
      nome: item.nome,
      endereco: item.endereco
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.regionalForm.reset({
      nome: '',
      endereco: ''
    });
    this.message.set('');
  }

  async handleSave() {
    if (this.regionalForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.regionalForm.value;
      const sid = this.selectedId();
      if (sid) {
        await this.parametrosService.updateRegional(sid, val);
        this.message.set('Regional atualizada com sucesso!');
      } else {
        await this.parametrosService.createRegional(val);
        this.message.set('Regional criada com sucesso!');
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao salvar regional.');
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.parametrosService.deleteRegional(sid);
      this.message.set('Regional excluída com sucesso!');
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.message.set('Erro ao excluir regional.');
    } finally {
      this.loading.set(false);
    }
  }

  handleManageTelefones(id: string | number) {
      this.router.navigate(['/parametros/regionais/telefones'], { queryParams: { regionalId: id } });
  }
}
