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
import { PessoasService } from '../services/PessoasService';
import { ParametrosService } from '../../parametros/services/ParametrosService';
import { AgenteSaude, Estado, Regional } from '../../../types/models';

@Component({
  selector: 'app-agente-saude',
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
  templateUrl: './AgenteSaude.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css']
})
export class AgenteSaudeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pessoasService = inject(PessoasService);
  private parametrosService = inject(ParametrosService);
  private snackBar = inject(MatSnackBar);

  agenteForm!: FormGroup;
  loading = signal(false);
  agenteId = signal<string | number | null>(null);

  agentes = signal<AgenteSaude[]>([]);
  estados = signal<Estado[]>([]);
  regionais = signal<Regional[]>([]);

  displayedColumns: string[] = ['nome', 'email', 'estado', 'regional'];

  ngOnInit() {
    this.initForm();
    this.fetchInitialData();
  }

  initForm() {
    this.agenteForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      estadoId: ['', [Validators.required]],
      regionalId: ['', [Validators.required]]
    });
  }

  async fetchInitialData() {
    this.loading.set(true);
    try {
      const [agList, estList] = await Promise.all([
        this.pessoasService.listAgentesSaude(),
        this.parametrosService.getEstados()
      ]);
      this.agentes.set(agList || []);
      this.estados.set(estList || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async onEstadoChange() {
    const val = this.agenteForm.get('estadoId')?.value;
    this.regionais.set([]);
    this.agenteForm.patchValue({ regionalId: '' });

    if (val) {
      try {
        const regs = await this.parametrosService.getRegionaisByEstado(val);
        this.regionais.set(regs || []);
      } catch (error) {
        console.error(error);
      }
    }
  }

  async handleSelect(item: AgenteSaude) {
    this.agenteId.set(item.id);
    this.agenteForm.patchValue({
        nome: item.nome,
        email: item.email,
        estadoId: item.estadoId,
        regionalId: item.regionalId
    });

    if (item.estadoId) {
        try {
            const regs = await this.parametrosService.getRegionaisByEstado(item.estadoId);
            this.regionais.set(regs || []);
            this.agenteForm.patchValue({ regionalId: item.regionalId });
        } catch (error) {
            console.error(error);
        }
    }
  }

  handleClear() {
    this.agenteId.set(null);
    this.agenteForm.reset({
        nome: '',
        email: '',
        estadoId: '',
        regionalId: ''
    });
    this.regionais.set([]);
  }

  async handleSave() {
    if (this.agenteForm.invalid) return;
    this.loading.set(true);
    try {
      const val = this.agenteForm.value;
      const id = this.agenteId();
      if (id) {
        await this.pessoasService.updateAgenteSaude(String(id), val);
        this.snackBar.open('Agente de saúde atualizado com sucesso!', 'OK', { duration: 3000 });
      } else {
        await this.pessoasService.createAgenteSaude(val);
        this.snackBar.open('Agente de saúde criado com sucesso!', 'OK', { duration: 3000 });
      }
      this.handleClear();
      const list = await this.pessoasService.listAgentesSaude();
      this.agentes.set(list || []);
    } catch (error) {
      this.snackBar.open('Erro ao salvar agente de saúde.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const id = this.agenteId();
    if (!id) return;
    this.loading.set(true);
    try {
      await this.pessoasService.deleteAgenteSaude(String(id));
      this.snackBar.open('Agente de saúde excluído com sucesso!', 'OK', { duration: 3000 });
      this.handleClear();
      const list = await this.pessoasService.listAgentesSaude();
      this.agentes.set(list || []);
    } catch (error) {
      this.snackBar.open('Erro ao excluir agente de saúde.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}
