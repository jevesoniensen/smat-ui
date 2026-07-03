import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AcidenteService } from '../services/AcidenteService';
import { 
  TipoAcidente, 
  TipoLocalAcidente, 
  Estado, 
  Municipio, 
  LocalLesao, 
  AgenteCausador 
} from '../../../types/models';

const STORAGE_KEY = 'objAcidente';
const LESOES_STORAGE_KEY = 'vLocalLesaoAcidente';

@Component({
  selector: 'app-acidente-passo-dois',
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
    MatCardModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './AcidentePassoDois.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/acidente.css']
})
export class AcidentePassoDoisComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private acidenteService = inject(AcidenteService);
  private snackBar = inject(MatSnackBar);

  acidenteForm!: FormGroup;
  errors = signal<string[]>([]);
  loading = signal(false);

  // Collections State
  tiposAcidente = signal<TipoAcidente[]>([]);
  tiposLocal = signal<TipoLocalAcidente[]>([]);
  estados = signal<Estado[]>([]);
  locaisLesaoPai = signal<LocalLesao[]>([]);
  agentesCausadoresVo = signal<AgenteCausador[]>([]);
  
  municipios = signal<Municipio[]>([]);
  locaisLesao = signal<LocalLesao[]>([]);
  agentesCausadoresPai = signal<AgenteCausador[]>([]);
  agentesCausadores = signal<AgenteCausador[]>([]);
  vLocalLesaoAcidente = signal<any[]>([]);

  displayedColumnsLesoes: string[] = ['nome', 'actions'];

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.acidenteForm = this.fb.group({
      horasTrabalhadas: [''],
      dataAcidente: [''],
      hora: [''],
      tipoAcidente: [''],
      tipoLocalAcidente: [''],
      dataUltimodiaTrab: [''],
      distritoSaude: [''],
      descricaoLocal: [''],
      documentoEmpresaTerceiraId: [''],
      documentoEmpresaTerceira: [''],
      razaoSocialEmpresaterceira: [''],
      estadoAcidente: [''],
      municipioAcidente: [''],
      localLesaoPai: [''],
      localLesao: [''],
      agenteCausadorVo: [''],
      agenteCausadorPai: [''],
      agenteCausador: [''],
      descricaoSituacaoGeradora: [''],
      registroPolicial: [''],
      obito: [''],
      amputacao: [''],
      acao: [''],
      destino: [''],
      paginaAtual: ['PASSODOIS']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const [resTiposAcidente, resTiposLocal, resEstados, resLocaisLesaoPai, resAgentesCausadoresVo] = await Promise.all([
        this.acidenteService.getTiposAcidente(),
        this.acidenteService.getTiposLocalAcidente(),
        this.acidenteService.getAllEstados(),
        this.acidenteService.getLocaisLesaoPai(),
        this.acidenteService.getAgentesCausadoresVo()
      ]);

      this.tiposAcidente.set(resTiposAcidente || []);
      this.tiposLocal.set(resTiposLocal || []);
      this.estados.set(resEstados || []);
      this.locaisLesaoPai.set(resLocaisLesaoPai || []);
      this.agentesCausadoresVo.set(resAgentesCausadoresVo || []);

      const saved = localStorage.getItem(STORAGE_KEY);
      let safeData: any = {};
      if (saved) {
        safeData = JSON.parse(saved);
        ['dataAcidente', 'dataUltimodiaTrab'].forEach(field => {
          if (safeData[field]) {
            const date = new Date(safeData[field]);
            if (!isNaN(date.getTime())) {
              safeData[field] = date;
            }
          }
        });
      }

      const state = window.history.state;
      if (state && state.selectedEmpregador) {
        safeData.documentoEmpresaTerceiraId = state.selectedEmpregador.id || '';
        safeData.documentoEmpresaTerceira = state.selectedEmpregador.documento || '';
        safeData.razaoSocialEmpresaterceira = state.selectedEmpregador.razaoSocial || '';
      }

      if (Object.keys(safeData).length > 0) {
        this.acidenteForm.patchValue(safeData);

        if (safeData.estadoAcidente) {
          this.acidenteService.getMunicipios(safeData.estadoAcidente).then(m => this.municipios.set(m)).catch(console.error);
        }
        if (safeData.localLesaoPai) {
          this.acidenteService.getLocaisLesao(safeData.localLesaoPai).then(l => this.locaisLesao.set(l)).catch(console.error);
        }
        if (safeData.agenteCausadorVo) {
          this.acidenteService.getAgentesCausadores(safeData.agenteCausadorVo).then(a => this.agentesCausadoresPai.set(a)).catch(console.error);
        }
        if (safeData.agenteCausadorPai) {
          this.acidenteService.getAgentesCausadores(safeData.agenteCausadorPai).then(a => this.agentesCausadores.set(a)).catch(console.error);
        }
      }

      const savedLesoes = localStorage.getItem(LESOES_STORAGE_KEY);
      if (savedLesoes) {
        this.vLocalLesaoAcidente.set(JSON.parse(savedLesoes));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      this.snackBar.open('Erro ao carregar dados do formulário', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  onMaskInput(event: any, field: string) {
    const value = event.target.value;
    let newValue = value;

    if (field === 'hora') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 2) newValue = cleanValue;
      else newValue = `${cleanValue.substring(0, 2)}:${cleanValue.substring(2, 4)}`;
    }

    if (newValue !== value) {
      this.acidenteForm.get(field)?.setValue(newValue, { emitEvent: false });
    }
  }

  async onEstadoChange() {
    const sigla = this.acidenteForm.get('estadoAcidente')?.value;
    if (sigla) {
      try {
        const data = await this.acidenteService.getMunicipios(sigla);
        this.municipios.set(data || []);
      } catch (error) {
        console.error('Error loading municipios:', error);
        this.municipios.set([]);
      }
    } else {
      this.municipios.set([]);
    }
    this.acidenteForm.get('municipioAcidente')?.setValue('');
  }

  async onLocalLesaoPaiChange() {
    const id = this.acidenteForm.get('localLesaoPai')?.value;
    if (id) {
      try {
        const data = await this.acidenteService.getLocaisLesao(id);
        this.locaisLesao.set(data || []);
      } catch (error) {
        console.error('Error loading local lesao:', error);
        this.locaisLesao.set([]);
      }
    } else {
      this.locaisLesao.set([]);
    }
    this.acidenteForm.get('localLesao')?.setValue('');
  }

  async onAgenteCausadorVoChange() {
    const id = this.acidenteForm.get('agenteCausadorVo')?.value;
    if (id) {
      try {
        const data = await this.acidenteService.getAgentesCausadores(id);
        this.agentesCausadoresPai.set(data || []);
      } catch (error) {
        console.error('Error loading agente causador pai:', error);
        this.agentesCausadoresPai.set([]);
      }
    } else {
      this.agentesCausadoresPai.set([]);
    }
    this.acidenteForm.patchValue({ agenteCausadorPai: '', agenteCausador: '' });
    this.agentesCausadores.set([]);
  }

  async onAgenteCausadorPaiChange() {
    const id = this.acidenteForm.get('agenteCausadorPai')?.value;
    if (id) {
      try {
        const data = await this.acidenteService.getAgentesCausadores(id);
        this.agentesCausadores.set(data || []);
      } catch (error) {
        console.error('Error loading agente causador:', error);
        this.agentesCausadores.set([]);
      }
    } else {
      this.agentesCausadores.set([]);
    }
    this.acidenteForm.get('agenteCausador')?.setValue('');
  }

  handleInserirLocalLesao() {
    const id = this.acidenteForm.get('localLesao')?.value;
    if (!id) return;
    
    const selectedItem = this.locaisLesao().find((item: LocalLesao) => String(item.id) === String(id));
    if (!selectedItem) return;

    if (this.vLocalLesaoAcidente().some((item: any) => String(item.id) === String(id))) return;

    const newList = [...this.vLocalLesaoAcidente(), { ...selectedItem }];
    this.vLocalLesaoAcidente.set(newList);
    localStorage.setItem(LESOES_STORAGE_KEY, JSON.stringify(newList));
    this.acidenteForm.get('localLesao')?.setValue('');
  }

  handleRemoverLocalLesao(index: number) {
    const newList = this.vLocalLesaoAcidente().filter((_, i) => i !== index);
    this.vLocalLesaoAcidente.set(newList);
    localStorage.setItem(LESOES_STORAGE_KEY, JSON.stringify(newList));
  }

  saveToStorage() {
    const current = localStorage.getItem(STORAGE_KEY);
    const existing = current ? JSON.parse(current) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...this.acidenteForm.value, paginaAtual: 'PASSODOIS' }));
  }

  handleVoltar() {
    this.saveToStorage();
    this.router.navigate(['/acidentepassoum']);
  }

  handleAvancar() {
    // Auto-insert if selected but not in list
    const id = this.acidenteForm.get('localLesao')?.value;
    if (id && !this.vLocalLesaoAcidente().some(item => String(item.id) === String(id))) {
      this.handleInserirLocalLesao();
    }

    const formValues = this.acidenteForm.value;
    const newErrors = [];

    if (!formValues.dataAcidente) newErrors.push('Data do acidente é obrigatória');
    if (!formValues.hora) newErrors.push('Hora do acidente é obrigatória');
    if (!formValues.tipoAcidente) newErrors.push('Tipo de acidente é obrigatório');
    if (!formValues.tipoLocalAcidente) newErrors.push('Local do acidente é obrigatório');
    if (!formValues.estadoAcidente) newErrors.push('Estado é obrigatório');
    if (!formValues.municipioAcidente) newErrors.push('Município é obrigatório');
    if (this.vLocalLesaoAcidente().length === 0) newErrors.push('Pelo menos um local da lesão deve ser informado');
    if (!formValues.agenteCausador) newErrors.push('Agente causador é obrigatório');
    if (!formValues.registroPolicial) newErrors.push('Registro policial é obrigatório');
    if (!formValues.obito) newErrors.push('Campo Óbito é obrigatório');
    if (!formValues.amputacao) newErrors.push('Campo Amputação é obrigatório');

    if (newErrors.length > 0) {
      this.errors.set(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    this.saveToStorage();
    this.router.navigate(['/acidentepassotres']);
  }

  handlePesquisarEmpresa() {
    this.saveToStorage();
    this.router.navigate(['/pesquisaempregador'], { state: { returnPath: '/acidentepassodois' } });
  }
}
