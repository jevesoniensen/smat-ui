import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AcidenteService } from '../services/AcidenteService';

const STORAGE_KEY = 'objAcidente';
const LESOES_STORAGE_KEY = 'vLocalLesaoAcidente';
const TESTEMUNHAS_STORAGE_KEY = 'vTestemunhas';

@Component({
  selector: 'app-visualiza-acidente',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container mat-typography">
      <h3>
        <ng-container *ngIf="preview()">PRÉ-VISUALIZAÇÃO DO ACIDENTE</ng-container>
        <ng-container *ngIf="!preview()">
            <ng-container *ngIf="acidente()">VISUALIZAÇÃO DO ACIDENTE Nº {{ acidente().id }}</ng-container>
            <ng-container *ngIf="!acidente()">VISUALIZAÇÃO DO ACIDENTE</ng-container>
        </ng-container>
      </h3>

      <div *ngIf="loading()" class="acidente-loading">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Carregando...</p>
      </div>

      <div *ngIf="acidente() && !loading()" class="acidente-view-wrapper">
        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>INFORMAÇÕES GERAIS</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-10">
            <div class="details-grid">
              <p><strong>Emitente:</strong> {{ renderValue(acidente().nomeEmitente || acidente().emitente) }}</p>
              <p *ngIf="acidente().razaoSocial"><strong>Empregador:</strong> {{ renderValue(acidente().documento) }} - {{ renderValue(acidente().razaoSocial) }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>TRABALHADOR</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-10">
            <div class="details-grid">
              <p class="full-width"><strong>Nome:</strong> {{ renderValue(acidente().nome) }}</p>
              <p><strong>Nascimento:</strong> {{ formatDisplayDate(acidente().dataNascimento) }}</p>
              <p><strong>Sexo:</strong> {{ renderValue(acidente().nomeSexo || (acidente().sexo === 'M' ? 'Masculino' : (acidente().sexo === 'F' ? 'Feminino' : ''))) }}</p>
              <p><strong>Estado Civil:</strong> {{ renderValue(acidente().nomeEstadoCivil || acidente().estadoCivil) }}</p>
              <p><strong>CTPS:</strong> {{ renderValue(acidente().ctps) }} (Série: {{ renderValue(acidente().serie) }})</p>
              <p><strong>Emissão CTPS:</strong> {{ formatDisplayDate(acidente().dataEmissaoCTPS) }} (UF: {{ renderValue(acidente().nomeUFCTPS || acidente().ufCTPS) }})</p>
              <p><strong>CPF:</strong> {{ renderValue(acidente().cpf) }}</p>
              <p><strong>PIS/NIT:</strong> {{ renderValue(acidente().pisPasepNit) }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>ENDEREÇO DO ACIDENTADO</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-10">
            <div class="details-grid">
              <p><strong>Estado:</strong> {{ renderValue(acidente().nomeEstado || acidente().estado) }}</p>
              <p><strong>Município:</strong> {{ renderValue(acidente().nomeMunicipio || acidente().municipio) }}</p>
              <p class="full-width"><strong>Rua:</strong> {{ renderValue(acidente().rua) }}</p>
              <p><strong>Bairro:</strong> {{ renderValue(acidente().bairro) }}</p>
              <p><strong>Número:</strong> {{ renderValue(acidente().numero) }}</p>
              <p class="full-width"><strong>Telefone:</strong> ({{ renderValue(acidente().ddd) }}) {{ renderValue(acidente().telefone) }}</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="section" *ngIf="testemunhas().length > 0">
          <mat-card-header>
            <mat-card-title>TESTEMUNHAS</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-10">
            <div *ngFor="let t of testemunhas(); let idx = index" class="mb-10">
              <p><strong>Testemunha {{ idx + 1 }}:</strong> {{ renderValue(t.nomeTestemunha) }}</p>
              <p><strong>Cidade:</strong> {{ renderValue(t.nomeMunicipio) }} / {{ renderValue(t.nomeEstado) }}</p>
              <mat-divider *ngIf="idx < testemunhas().length - 1"></mat-divider>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>ACIDENTE OU DOENÇA</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-10">
            <div class="details-grid">
              <p><strong>Data:</strong> {{ formatDisplayDate(acidente().dataAcidente) }}</p>
              <p><strong>Hora:</strong> {{ renderValue(acidente().hora) }}</p>
              <p><strong>Tipo:</strong> {{ renderValue(acidente().nomeTipoAcidente || acidente().tipoAcidente) }}</p>
              <p><strong>Local:</strong> {{ renderValue(acidente().nomeTipoLocalAcidente || acidente().tipoLocalAcidente) }}</p>
              <p class="full-width" *ngIf="acidente().razaoSocialEmpresaterceira">
                <strong>Empresa Terceira:</strong> {{ renderValue(acidente().documentoEmpresaTerceira) }} - {{ renderValue(acidente().razaoSocialEmpresaterceira) }}
              </p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="section" *ngIf="lesoes().length > 0">
          <mat-card-header>
            <mat-card-title>LOCAIS DA LESÃO SELECIONADOS</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-10">
            <ul>
              <li *ngFor="let l of lesoes()">{{ renderValue(l.nome) }}</li>
            </ul>
          </mat-card-content>
        </mat-card>

        <mat-card class="section">
          <mat-card-header>
            <mat-card-title>ATESTADO MÉDICO E FONTE</mat-card-title>
          </mat-card-header>
          <mat-card-content class="mt-10">
            <div class="details-grid">
              <p class="full-width"><strong>Diagnóstico:</strong> {{ renderValue(acidente().nomeDiagnostico || acidente().diagnostico) }}</p>
              <p><strong>Médico:</strong> {{ renderValue(acidente().medicoNome) }}</p>
              <p><strong>CRM:</strong> {{ renderValue(acidente().crm) }} / {{ renderValue(acidente().ufCRM) }}</p>
              <p><strong>Fonte:</strong> {{ renderValue(acidente().nomeFonte || acidente().fonte) }}</p>
              <p><strong>Doc. Fonte:</strong> {{ renderValue(acidente().numDocFonte) }} ({{ formatDisplayDate(acidente().dataEmissaoFonte) }})</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mt-20">
        <button mat-raised-button color="primary" (click)="handleBack()">
          <mat-icon>arrow_back</mat-icon> VOLTAR
        </button>
      </div>
    </div>
  `,
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/acidente.css']
})
export class VisualizaAcidenteComponent implements OnInit {
  private acidenteService = inject(AcidenteService);
  private snackBar = inject(MatSnackBar);

  acidente = signal<any | null>(null);
  testemunhas = signal<any[]>([]);
  lesoes = signal<any[]>([]);
  loading = signal(false);
  preview = signal(false);

  ngOnInit() {
    const state = window.history.state;
    if (state) {
      if (state.preview) {
        this.preview.set(true);
        this.loadPreviewData();
      } else if (state.acidenteId) {
        this.fetchData(state.acidenteId);
      } else {
        this.snackBar.open('Acidente não especificado.', 'Fechar', { duration: 5000 });
      }
    } else {
        this.snackBar.open('Nenhum dado para visualizar.', 'Fechar', { duration: 5000 });
    }
  }

  loadPreviewData() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const vTestemunhas = JSON.parse(localStorage.getItem(TESTEMUNHAS_STORAGE_KEY) || '[]');
      const vLesoes = JSON.parse(localStorage.getItem(LESOES_STORAGE_KEY) || '[]');
      
      this.acidente.set(data);
      this.testemunhas.set(vTestemunhas);
      this.lesoes.set(vLesoes);
    } catch (error) {
      console.error('Error loading preview data:', error);
      this.snackBar.open('Erro ao carregar dados de visualização local.', 'Fechar', { duration: 5000 });
    }
  }

  async fetchData(id: string | number) {
    this.loading.set(true);
    try {
      const data = await this.acidenteService.getAcidente(id);
      this.acidente.set(data);
      this.testemunhas.set((data as any).testemunhas || []);
      this.lesoes.set((data as any).locaisLesao || []);
    } catch (error) {
      console.error('Error fetching accident:', error);
      this.snackBar.open('Erro ao carregar acidente do servidor.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleBack() {
    window.history.back();
  }

  formatDisplayDate(date: any) {
    if (!date) return '---';
    if (date instanceof Date) return date.toLocaleDateString('pt-BR');
    if (typeof date === 'string') {
      if (date.includes('T')) return new Date(date).toLocaleDateString('pt-BR');
      return date;
    }
    return String(date);
  }

  renderValue(value: any) {
    return (value !== undefined && value !== null && value !== '') ? String(value) : '---';
  }
}
