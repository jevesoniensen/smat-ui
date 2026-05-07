/**
 * AcidentePassoDois
 * Migrated from cad_acidente_passo2.jsp and AcidentePassoDoisAction.java
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { acidenteService } from '../services/AcidenteService';
import '../css/acidente.css';
import { 
  TipoAcidente, 
  TipoLocalAcidente, 
  Estado, 
  Municipio, 
  LocalLesao, 
  AgenteCausador 
} from '../../../types/models';
import { maskDate } from '../../common/formatting';

const STORAGE_KEY = 'objAcidente';
const LESOES_STORAGE_KEY = 'vLocalLesaoAcidente';

export const AcidentePassoDois: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Collections State
  const [tiposAcidente, setTiposAcidente] = useState<TipoAcidente[]>([]);
  const [tiposLocal, setTiposLocal] = useState<TipoLocalAcidente[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [locaisLesaoPai, setLocaisLesaoPai] = useState<LocalLesao[]>([]);
  const [agentesCausadoresVo, setAgentesCausadoresVo] = useState<AgenteCausador[]>([]);
  
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [locaisLesao, setLocaisLesao] = useState<LocalLesao[]>([]);
  const [agentesCausadoresPai, setAgentesCausadoresPai] = useState<AgenteCausador[]>([]);
  const [agentesCausadores, setAgentesCausadores] = useState<AgenteCausador[]>([]);
  const [vLocalLesaoAcidente, setVLocalLesaoAcidente] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    horasTrabalhadas: '',
    dataAcidente: '',
    hora: '',
    tipoAcidente: '',
    tipoLocalAcidente: '',
    dataUltimodiaTrab: '',
    distritoSaude: '',
    descricaoLocal: '',
    documentoEmpresaTerceiraId: '',
    documentoEmpresaTerceira: '',
    razaoSocialEmpresaterceira: '',
    estadoAcidente: '',
    municipioAcidente: '',
    localLesaoPai: '',
    localLesao: '',
    agenteCausadorVo: '',
    agenteCausadorPai: '',
    agenteCausador: '',
    descricaoSituacaoGeradora: '',
    registroPolicial: '',
    obito: '',
    amputacao: '',
    // Control fields
    acao: '',
    destino: '',
    paginaAtual: 'PASSODOIS'
  });

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resTiposAcidente, resTiposLocal, resEstados, resLocaisLesaoPai, resAgentesCausadoresVo] = await Promise.all([
          acidenteService.getTiposAcidente(),
          acidenteService.getTiposLocalAcidente(),
          acidenteService.getAllEstados(),
          acidenteService.getLocaisLesaoPai(),
          acidenteService.getAgentesCausadoresVo()
        ]);

        setTiposAcidente(resTiposAcidente || []);
        setTiposLocal(resTiposLocal || []);
        setEstados(resEstados || []);
        setLocaisLesaoPai(resLocaisLesaoPai || []);
        setAgentesCausadoresVo(resAgentesCausadoresVo || []);

        // Pre-fill from local storage if exists
        const saved = localStorage.getItem(STORAGE_KEY);
        let safeData: any = {};
        if (saved) {
          safeData = JSON.parse(saved);
          
          // Handle Date fields
          ['dataAcidente', 'dataUltimodiaTrab'].forEach(field => {
            if (typeof safeData[field] === 'string' && safeData[field].includes('T')) {
              const date = new Date(safeData[field]);
              if (!isNaN(date.getTime())) {
                safeData[field] = date.toLocaleDateString('pt-BR');
              }
            }
          });
        }

        // Handle selected employer from search (overrides storage)
        const selectedEmpregador = (location.state as any)?.selectedEmpregador;
        if (selectedEmpregador) {
          safeData.documentoEmpresaTerceiraId = selectedEmpregador.id || '';
          safeData.documentoEmpresaTerceira = selectedEmpregador.documento || '';
          safeData.razaoSocialEmpresaterceira = selectedEmpregador.razaoSocial || '';
          // Clear state to avoid re-applying on subsequent renders
          window.history.replaceState({}, document.title);
        }

        if (Object.keys(safeData).length > 0) {
          setFormData(prev => ({ ...prev, ...safeData }));

          // Load cascading data if IDs exist
          if (safeData.estadoAcidente) {
            acidenteService.getMunicipios(safeData.estadoAcidente).then(setMunicipios).catch(console.error);
          }
          if (safeData.localLesaoPai) {
            acidenteService.getLocaisLesao(safeData.localLesaoPai).then(setLocaisLesao).catch(console.error);
          }
          if (safeData.agenteCausadorVo) {
            acidenteService.getAgentesCausadores(safeData.agenteCausadorVo).then(setAgentesCausadoresPai).catch(console.error);
          }
          if (safeData.agenteCausadorPai) {
            acidenteService.getAgentesCausadores(safeData.agenteCausadorPai).then(setAgentesCausadores).catch(console.error);
          }
        }

        // Initialize vLocalLesaoAcidente from storage
        const savedLesoes = localStorage.getItem(LESOES_STORAGE_KEY);
        if (savedLesoes) {
          setVLocalLesaoAcidente(JSON.parse(savedLesoes));
        }
      } catch (error) {
        console.error('Error loading collections:', error);
        setErrors(['Erro ao carregar dados do formulário']);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state]);

  // Input Change Handler
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'dataAcidente' || name === 'dataUltimodiaTrab') {
      newValue = maskDate(value);
    } else if (name === 'hora') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 2) newValue = cleanValue;
      else newValue = `${cleanValue.substring(0, 2)}:${cleanValue.substring(2, 4)}`;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Cascading dropdowns
    if (name === 'estadoAcidente') {
      if (newValue) {
        try {
          const data = await acidenteService.getMunicipios(newValue);
          setMunicipios(data || []);
        } catch (error) {
          console.error('Error loading municipios:', error);
          setMunicipios([]);
        }
      } else {
        setMunicipios([]);
      }
      setFormData(prev => ({ ...prev, municipioAcidente: '' }));
    } else if (name === 'localLesaoPai') {
      if (newValue) {
        try {
          const data = await acidenteService.getLocaisLesao(newValue);
          setLocaisLesao(data || []);
        } catch (error) {
          console.error('Error loading local lesao:', error);
          setLocaisLesao([]);
        }
      } else {
        setLocaisLesao([]);
      }
      setFormData(prev => ({ ...prev, localLesao: '' }));
    } else if (name === 'agenteCausadorVo') {
      if (newValue) {
        try {
          const data = await acidenteService.getAgentesCausadores(newValue);
          setAgentesCausadoresPai(data || []);
        } catch (error) {
          console.error('Error loading agente causador pai:', error);
          setAgentesCausadoresPai([]);
        }
      } else {
        setAgentesCausadoresPai([]);
      }
      setFormData(prev => ({ ...prev, agenteCausadorPai: '', agenteCausador: '' }));
    } else if (name === 'agenteCausadorPai') {
      if (newValue) {
        try {
          const data = await acidenteService.getAgentesCausadores(newValue);
          setAgentesCausadores(data || []);
        } catch (error) {
          console.error('Error loading agente causador:', error);
          setAgentesCausadores([]);
        }
      } else {
        setAgentesCausadores([]);
      }
      setFormData(prev => ({ ...prev, agenteCausador: '' }));
    }
  };

  const handleInserirLocalLesao = () => {
    if (!formData.localLesao) return;
    
    const selectedItem = locaisLesao.find((item: LocalLesao) => String(item.id) === String(formData.localLesao));
    if (!selectedItem) return;

    if (vLocalLesaoAcidente.some((item: any) => String(item.id) === String(formData.localLesao))) return;

    const newList = [...vLocalLesaoAcidente, { ...selectedItem, index: vLocalLesaoAcidente.length }];
    setVLocalLesaoAcidente(newList);
    localStorage.setItem(LESOES_STORAGE_KEY, JSON.stringify(newList));
    setFormData(prev => ({ ...prev, localLesao: '' }));
  };

  const handleRemoverLocalLesao = (index: number) => {
    const newList = vLocalLesaoAcidente.filter((_: any, i: number) => i !== index);
    const reindexedList = newList.map((item: any, i: number) => ({ ...item, index: i }));
    setVLocalLesaoAcidente(reindexedList);
    localStorage.setItem(LESOES_STORAGE_KEY, JSON.stringify(reindexedList));
  };

  // Helper to merge form data into storage object with type conversion
  const getStorageUpdate = () => {
      const update = { ...formData, paginaAtual: 'PASSODOIS' } as any;
      
      const saved = localStorage.getItem(STORAGE_KEY);
      const existing = saved ? (JSON.parse(saved) || {}) : {};
      return { ...existing, ...update };
  };

  const handleVoltar = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStorageUpdate()));
    navigate('/acidentepassoum');
  };

  const handleAvancar = () => {
    try {
      // Auto-insert if a lesion is selected in the dropdown but not yet added to the list
      let currentLesions = [...vLocalLesaoAcidente];
      if (formData.localLesao && !currentLesions.some(item => String(item.id) === String(formData.localLesao))) {
        const selectedItem = locaisLesao.find((item: LocalLesao) => String(item.id) === String(formData.localLesao));
        if (selectedItem) {
          const newItem = { ...selectedItem, index: currentLesions.length };
          currentLesions = [...currentLesions, newItem];
          setVLocalLesaoAcidente(currentLesions);
          localStorage.setItem(LESOES_STORAGE_KEY, JSON.stringify(currentLesions));
        }
      }

      const newErrors = [];
      if (!formData.dataAcidente) newErrors.push('Data do acidente é obrigatória');
      if (!formData.hora) newErrors.push('Hora do acidente é obrigatória');
      if (!formData.tipoAcidente) newErrors.push('Tipo de acidente é obrigatório');
      if (!formData.tipoLocalAcidente) newErrors.push('Local do acidente é obrigatório');
      if (!formData.estadoAcidente) newErrors.push('Estado é obrigatório');
      if (!formData.municipioAcidente) newErrors.push('Município é obrigatório');
      if (currentLesions.length === 0) newErrors.push('Pelo menos um local da lesão deve ser informado');
      if (!formData.agenteCausador) newErrors.push('Agente causador é obrigatório');
      if (!formData.registroPolicial) newErrors.push('Registro policial é obrigatório');
      if (!formData.obito) newErrors.push('Campo Óbito é obrigatório');
      if (!formData.amputacao) newErrors.push('Campo Amputação é obrigatório');

      if (newErrors.length > 0) {
        setErrors(newErrors);
        window.scrollTo(0, 0);
        return;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(getStorageUpdate()));
      navigate('/acidentepassotres');
    } catch (error) {
      console.error('Error in handleAvancar:', error);
      setErrors(['Erro ao processar os dados do formulário']);
      window.scrollTo(0, 0);
    }
  };

  const handlePesquisarEmpresa = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStorageUpdate()));
    navigate('/pesquisaempregador', { state: { returnPath: '/acidentepassodois' } });
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container">
      <h2>Passo 2: Acidente ou Doença</h2>

      {errors.length > 0 && (
        <div className="alert alert-danger">
          <ul>
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form>
        <fieldset>
          <legend>Detalhes do Acidente</legend>
          <div className="form-row">
            <div className="form-group col-md-4">
              <label>Horas Trabalhadas</label>
              <input type="text" name="horasTrabalhadas" value={formData.horasTrabalhadas} onChange={handleInputChange} maxLength={4} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>Data do Acidente <span className="required">*</span></label>
              <input type="text" name="dataAcidente" value={formData.dataAcidente} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>Hora <span className="required">*</span></label>
              <input type="text" name="hora" value={formData.hora} onChange={handleInputChange} maxLength={5} className="form-control" placeholder="00:00" />
            </div>
          </div>

          <div className="form-group">
            <label>Tipo de Acidente <span className="required">*</span></label>
            <select name="tipoAcidente" value={formData.tipoAcidente} onChange={handleInputChange} className="form-control">
              <option value="">-- Tipo Acidente --</option>
              {tiposAcidente.map((t: TipoAcidente) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Local do Acidente <span className="required">*</span></label>
            <select name="tipoLocalAcidente" value={formData.tipoLocalAcidente} onChange={handleInputChange} className="form-control">
              <option value="">-- Tipo de Local --</option>
              {tiposLocal.map((tl: TipoLocalAcidente) => (
                <option key={tl.id} value={tl.id}>{tl.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Último Dia Trabalhado</label>
              <input type="text" name="dataUltimodiaTrab" value={formData.dataUltimodiaTrab} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
            <div className="form-group col-md-6">
              <label>Distrito de Saúde</label>
              <input type="text" name="distritoSaude" value={formData.distritoSaude} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
          </div>

          <div className="form-group">
            <label>Descrição do Local</label>
            <textarea name="descricaoLocal" value={formData.descricaoLocal} onChange={handleInputChange} rows={3} className="form-control"></textarea>
          </div>

          <div className="form-group">
            <label>Empresa Terceira</label>
            <div className="input-group">
              <input type="text" name="documentoEmpresaTerceira" value={formData.documentoEmpresaTerceira} readOnly className="form-control-disabled" placeholder="Documento" />
              <input type="text" name="razaoSocialEmpresaterceira" value={formData.razaoSocialEmpresaterceira} readOnly className="form-control-disabled" placeholder="Razão Social" />
              <button type="button" onClick={handlePesquisarEmpresa} className="btn-search">PESQUISAR</button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Estado <span className="required">*</span></label>
              <select name="estadoAcidente" value={formData.estadoAcidente} onChange={handleInputChange} className="form-control">
                <option value="">-- Estado --</option>
                {estados.map((st: Estado) => (
                  <option key={st.sigla} value={st.sigla}>{st.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-6">
              <label>Município <span className="required">*</span></label>
              <select name="municipioAcidente" value={formData.municipioAcidente} onChange={handleInputChange} className="form-control">
                <option value="">-- Município --</option>
                {municipios.map((m: Municipio) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Lesão e Causa</legend>
          <div className="form-row">
            <div className="form-group col-md-5">
              <label>Local da Lesão <span className="required">*</span></label>
              <select name="localLesaoPai" value={formData.localLesaoPai} onChange={handleInputChange} className="form-control">
                <option value="">-- Local da Lesão --</option>
                {locaisLesaoPai.map((l: LocalLesao) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-5">
              <label>Parte do Corpo <span className="required">*</span></label>
              <select name="localLesao" value={formData.localLesao} onChange={handleInputChange} className="form-control">
                <option value="">-- Parte do Corpo --</option>
                {locaisLesao.map((l: LocalLesao) => (
                  <option key={l.id} value={l.id}>{l.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-2 align-self-end">
              <button type="button" onClick={handleInserirLocalLesao} className="btn-secondary">INSERIR</button>
            </div>
          </div>

          {vLocalLesaoAcidente.length > 0 && (
            <div className="selected-items">
              <table className="table">
                <thead>
                  <tr>
                    <th>Locais da Lesão Selecionados</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {vLocalLesaoAcidente.map((item: any) => (
                    <tr key={item.index}>
                      <td>{item.nome}</td>
                      <td>
                        <button type="button" onClick={() => handleRemoverLocalLesao(item.index)} className="btn-link">Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="form-group">
            <label>Causa do Acidente <span className="required">*</span></label>
            <select name="agenteCausadorVo" value={formData.agenteCausadorVo} onChange={handleInputChange} className="form-control">
              <option value="">-- Tipo Causa --</option>
              {agentesCausadoresVo.map((ac: AgenteCausador) => (
                <option key={ac.id} value={ac.id}>{ac.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tipo de Agente Causador <span className="required">*</span></label>
            <select name="agenteCausadorPai" value={formData.agenteCausadorPai} onChange={handleInputChange} className="form-control">
              <option value="">-- Tipo de Agente Causador --</option>
              {agentesCausadoresPai.map((ac: AgenteCausador) => (
                <option key={ac.id} value={ac.id}>{ac.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Agente Causador <span className="required">*</span></label>
            <select name="agenteCausador" value={formData.agenteCausador} onChange={handleInputChange} className="form-control">
              <option value="">-- Agente Causador --</option>
              {agentesCausadores.map((ac: AgenteCausador) => (
                <option key={ac.id} value={ac.id}>{ac.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrição da Situação Geradora</label>
            <textarea name="descricaoSituacaoGeradora" value={formData.descricaoSituacaoGeradora} onChange={handleInputChange} rows={3} className="form-control"></textarea>
          </div>

          <div className="form-row">
            <div className="form-group col-md-4">
              <label>Registro Policial <span className="required">*</span></label>
              <select name="registroPolicial" value={formData.registroPolicial} onChange={handleInputChange} className="form-control">
                <option value="">-- Registro Policial --</option>
                <option value="S">Sim</option>
                <option value="N">Não</option>
                <option value="X">Não Informado</option>
              </select>
            </div>
            <div className="form-group col-md-4">
              <label>Houve Óbito <span className="required">*</span></label>
              <select name="obito" value={formData.obito} onChange={handleInputChange} className="form-control">
                <option value="">-- Óbito --</option>
                <option value="S">Sim</option>
                <option value="N">Não</option>
                <option value="X">Não Informado</option>
              </select>
            </div>
            <div className="form-group col-md-4">
              <label>Houve Amputação <span className="required">*</span></label>
              <select name="amputacao" value={formData.amputacao} onChange={handleInputChange} className="form-control">
                <option value="">-- Amputação --</option>
                <option value="S">Sim</option>
                <option value="N">Não</option>
                <option value="X">Não Informado</option>
              </select>
            </div>
          </div>
        </fieldset>

        <div className="acidente-form-footer">
          <button type="button" onClick={handleVoltar} className="btn-secondary">VOLTAR</button>
          &nbsp;&nbsp;&nbsp;
          <button type="button" onClick={handleAvancar} className="btn-primary">AVANÇAR</button>
        </div>
      </form>
    </div>
  );
};

export default AcidentePassoDois;
