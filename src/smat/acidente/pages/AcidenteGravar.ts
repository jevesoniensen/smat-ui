import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AcidenteService } from '../services/AcidenteService';

const STORAGE_KEY = 'objAcidente';
const LESOES_STORAGE_KEY = 'vLocalLesaoAcidente';
const TESTEMUNHAS_STORAGE_KEY = 'vTestemunhas';

@Component({
  selector: 'app-acidente-gravar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatButtonModule, 
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './AcidenteGravar.html',
  styleUrls: ['../css/acidente.css']
})
export class AcidenteGravarComponent implements OnInit {
  private router = inject(Router);
  private acidenteService = inject(AcidenteService);

  hasData = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  ngOnInit() {
    const data = localStorage.getItem(STORAGE_KEY);
    this.hasData.set(!!data);
  }

  handleVoltar() {
    this.router.navigate(['/acidentepassoquatro']);
  }

  handleVisualizar() {
    this.router.navigate(['/visualizaacidente'], { state: { preview: true } });
  }

  parseDate(dateVal: any): { year: string, month: string, day: string } | null {
    if (!dateVal) return null;
    
    if (typeof dateVal === 'string' && dateVal.includes('/')) {
      const parts = dateVal.split('/');
      if (parts.length === 3) {
        return { 
          day: parts[0].padStart(2, '0'), 
          month: parts[1].padStart(2, '0'), 
          year: parts[2] 
        };
      }
    }

    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return {
        year: d.getFullYear().toString(),
        month: (d.getMonth() + 1).toString().padStart(2, '0'),
        day: d.getDate().toString().padStart(2, '0')
      };
    }
    
    return null;
  }

  formatDateOnly(dateVal: any): string | null {
    const p = this.parseDate(dateVal);
    if (!p) return null;
    return `${p.year}-${p.month}-${p.day}`;
  }

  combineDateTime(dateVal: any, timeStr: string): string | null {
    const p = this.parseDate(dateVal);
    if (!p) return null;
    
    let hour = '00';
    let min = '00';
    if (timeStr && typeof timeStr === 'string') {
      if (timeStr.includes(':')) {
        const tParts = timeStr.split(':');
        hour = tParts[0];
        min = tParts[1];
      } else if (timeStr.length === 4) {
        hour = timeStr.substring(0, 2);
        min = timeStr.substring(2, 4);
      }
    }
    
    return `${p.year}-${p.month}-${p.day}T${hour.padStart(2, '0')}:${min.padStart(2, '0')}:00`;
  }

  async handleGravar() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const rawData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const vLocalLesaoAcidente = JSON.parse(localStorage.getItem(LESOES_STORAGE_KEY) || '[]');
      const vTestemunhas = JSON.parse(localStorage.getItem(TESTEMUNHAS_STORAGE_KEY) || '[]');

      const payload: any = {
        area: Number(rawData.area || 0),
        vinculoEmpregaticio: Number(rawData.vinculoEmpregaticio || 0),
        ocupacao: Number(rawData.ocupacao || 0),
        localAtendimento: Number(rawData.localAtendimento || 0),
        empregador: Number(rawData.empregadorId || 0),
        medico: Number(rawData.medico || 0),
        diagnostico: Number(rawData.diagnostico || 0),
        fonte: Number(rawData.fonte || 0),
        agenteCausador: Number(rawData.agenteCausador || 0),
        tipoLocalAcidente: Number(rawData.tipoLocalAcidente || 0),
        trabalhador: {
          municipio: Number(rawData.municipio || 0),
          UFRG: Number(rawData.ufRG || 0),
          UFCTPS: Number(rawData.ufCTPS || 0),
          estadoCivil: Number(rawData.estadoCivil || 0),
          nome: rawData.nome || '',
          cpf: rawData.cpf || '',
          rg: rawData.rg || '',
          carteiraTrabalho: Number(rawData.ctps || 0),
          serie: Number(rawData.serie || 0),
          dataEmissaoCTPS: this.combineDateTime(rawData.dataEmissaoCTPS, '00:00'),
          dataNascimento: this.combineDateTime(rawData.dataNascimento, '00:00'),
          sexo: rawData.sexo || '',
          numero: Number(rawData.numero || 0),
          rua: rawData.rua || '',
          bairro: rawData.bairro || '',
          cep: rawData.cep || '',
          complemento: rawData.complemento || '',
          nomeResponsavel: rawData.nomeResponsavel || '',
          dataEmissaoRG: this.combineDateTime(rawData.dataEmissaoRG, '00:00'),
          orgaoExpedidorRG: rawData.orgaoExpedidorRG || '',
          PISPASEPNIT: rawData.pisPasepNit || '',
          telefone: rawData.telefone || '',
          ddd: rawData.ddd || ''
        },
        empregadorTerceiro: Number(rawData.documentoEmpresaTerceiraId || 0),
        tipoAcidente: Number(rawData.tipoAcidente || 0),
        emitente: Number(rawData.emitente || 0),
        municipio: Number(rawData.municipioAcidente || rawData.municipio || 0),
        dataAcidente: this.combineDateTime(rawData.dataAcidente, rawData.hora),
        registroPolicial: rawData.registroPolicial || '',
        amputacao: rawData.amputacao || '',
        obito: rawData.obito || '',
        horasTrabalhadas: Number(rawData.horasTrabalhadas || 0),
        descLocalAcidente: rawData.descricaoLocal || '',
        numDocFonte: rawData.numDocFonte || '',
        dataEmissaoFonte: this.combineDateTime(rawData.dataEmissaoFonte, '00:00'),
        naturezaLesao: rawData.descNaturezaLesao || '',
        dataHoraDiagnostico: this.combineDateTime(rawData.dataAtestado, rawData.horaAtestado),
        afastamento: rawData.afastamento || '',
        internacao: rawData.internacao || '',
        observacaoDiagnostico: rawData.observacoes || '',
        duracaoTratamento: Number(rawData.duracaoTratamento || 0),
        aposentado: rawData.aposentado || '',
        remuneracao: Number(rawData.remuneracaoMensal || 0),
        distritoSaude: rawData.distritoSaude || '',
        ultimaTrabalhado: this.combineDateTime(rawData.dataUltimodiaTrab, '00:00'),
        descricaoSituacaoGeradora: rawData.descricaoSituacaoGeradora || '',
        descricaoDiagnostico: rawData.descricaoDiagnostico || '',
        testemunhas: vTestemunhas.map((t: any) => ({
          municipio: Number(t.municipioTestemunha || 0),
          nome: t.nomeTestemunha,
          numero: Number(t.numeroTestemunha || 0),
          rua: t.ruaTestemunha,
          bairro: t.bairroTestemunha,
          cep: t.cepTestemunha,
          complemento: t.complementoTestemunha,
          telefone: t.telefoneTestemunha,
          ddd: t.dddTestemunha
        })),
        locaisLesaoAcidentes: vLocalLesaoAcidente.map((l: any) => l.id)
      };

      const response = await this.acidenteService.createAcidente(payload);
      
      if (response.status === 'success' || response.status === 'ok') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LESOES_STORAGE_KEY);
        localStorage.removeItem(TESTEMUNHAS_STORAGE_KEY);
        
        this.success.set(true);
        this.hasData.set(false);
      } else {
        throw new Error(response.message || 'Erro desconhecido ao gravar o acidente.');
      }
    } catch (err: any) {
      console.error('Error saving accident:', err);
      this.error.set(`Erro ao gravar o acidente: ${err.message || 'Verifique os dados informados.'}`);
    } finally {
      this.loading.set(false);
    }
  }

  handleNovo() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LESOES_STORAGE_KEY);
    localStorage.removeItem(TESTEMUNHAS_STORAGE_KEY);
    this.router.navigate(['/acidentepassoum']);
  }
}
