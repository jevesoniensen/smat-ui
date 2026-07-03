import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FiscalizacaoService } from '../services/FiscalizacaoService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { MedidaCorretivaFiscalizacao, TipoMedidaCorretiva } from '../../../types/models';

@Component({
  selector: 'app-fiscalizacao-medidas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatTableModule, 
    MatButtonModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './MedidasCorretivas.html',
  styleUrls: ['../css/fiscalizacao.css']
})
export class MedidasCorretivasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private fiscalizacaoService = inject(FiscalizacaoService);
  private parametrosService = inject(ParametrosService);
  private snackBar = inject(MatSnackBar);

  medidaForm!: FormGroup;
  fiscalizacaoId = signal<string | number | null>(null);
  medidas = signal<MedidaCorretivaFiscalizacao[]>([]);
  tiposMedida = signal<TipoMedidaCorretiva[]>([]);
  selectedId = signal<string | number | null>(null);

  loading = signal(false);

  displayedColumns: string[] = ['tipo', 'descricao', 'prazoDias'];

  ngOnInit() {
    this.initForm();
    const state = window.history.state;
    if (state && state.fiscalizacaoId) {
      this.fiscalizacaoId.set(state.fiscalizacaoId);
      this.fetchData();
    }
  }

  initForm() {
    this.medidaForm = this.fb.group({
      tipoMedidaVal: ['', [Validators.required]],
      prazoDias: ['', [Validators.required]],
      observacao: ['', [Validators.required]]
    });
  }

  async fetchData() {
    const fid = this.fiscalizacaoId();
    if (!fid) return;
    this.loading.set(true);
    try {
      const [medidasData, tiposData] = await Promise.all([
        this.fiscalizacaoService.getMedidasCorretivas(fid),
        this.parametrosService.getTiposMedidaCorretiva()
      ]);
      this.medidas.set(medidasData || []);
      this.tiposMedida.set(tiposData || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(item: MedidaCorretivaFiscalizacao) {
    this.selectedId.set(item.id);
    this.medidaForm.patchValue({
      tipoMedidaVal: item.tipo,
      observacao: item.descricao,
      prazoDias: (item as any).prazoDias || ''
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.medidaForm.reset({
      tipoMedidaVal: '',
      prazoDias: '',
      observacao: ''
    });
  }

  async handleSave() {
    const fid = this.fiscalizacaoId();
    if (!fid || this.medidaForm.invalid) return;

    this.loading.set(true);
    try {
      const formValue = this.medidaForm.value;
      const payload: any = {
          tipo: formValue.tipoMedidaVal,
          descricao: formValue.observacao,
          prazoDias: parseInt(formValue.prazoDias)
      };

      const sid = this.selectedId();
      if (sid) {
        await this.fiscalizacaoService.updateMedidaCorretiva(fid, sid, payload);
        this.snackBar.open('Medida corretiva atualizada com sucesso!', 'OK', { duration: 3000 });
      } else {
        await this.fiscalizacaoService.addMedidaCorretiva(fid, payload);
        this.snackBar.open('Medida corretiva adicionada com sucesso!', 'OK', { duration: 3000 });
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao salvar medida corretiva.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const fid = this.fiscalizacaoId();
    const sid = this.selectedId();
    if (!fid || !sid) return;

    this.loading.set(true);
    try {
      await this.fiscalizacaoService.deleteMedidaCorretiva(fid, sid);
      this.snackBar.open('Medida corretiva excluída com sucesso!', 'OK', { duration: 3000 });
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao excluir medida corretiva.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleReturn() {
    window.history.back();
  }
}
