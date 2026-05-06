/**
 * AcidentePassoUm
 * Migrated from cad_acidente_passo1.jsp and AcidentePassoUmAction.java
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { acidenteService } from '../services/AcidenteService';
import '../css/acidente.css';
import { 
  Emitente, 
  EstadoCivil, 
  Ocupacao, 
  VinculoEmpregaticio, 
  Area, 
  Estado,
  Municipio
} from '../../../types/models';
import { maskDate, formatCPF, formatCEP, maskPhone } from '../../../utils/formatting';
import { isValidCPF } from '../../../utils/FormValidation';

const STORAGE_KEY = 'objAcidente';

export const AcidentePassoUm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState<string[]>([]);

  // Collections State
  const [emitentes, setEmitentes] = useState<Emitente[]>([]);
  const [estadosCivis, setEstadosCivis] = useState<EstadoCivil[]>([]);
  const [ocupacoes, setOcupacoes] = useState<Ocupacao[]>([]);
  const [vinculos, setVinculos] = useState<VinculoEmpregaticio[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    emitente: '0',
    empregadorId: '',
    documento: '',
    razaoSocial: '',
    nome: '',
    nomeResponsavel: '',
    dataNascimento: '',
    estadoCivil: '0',
    ctps: '',
    serie: '',
    dataEmissaoCTPS: '',
    ufCTPS: '0',
    remuneracaoMensal: '',
    pisPasepNit: '',
    rg: '',
    dataEmissaoRG: '',
    orgaoExpedidorRG: '',
    ufRG: '0',
    cpf: '',
    sexo: '',
    ocupacao: '0',
    aposentado: '',
    area: '0',
    vinculoEmpregaticio: '0',
    estado: '',
    municipio: '',
    rua: '',
    bairro: '',
    numero: '',
    complemento: '',
    cep: '',
    ddd: '',
    telefone: '',
    // Control fields
    acao: '',
    destino: '',
    paginaAtual: 'PASSOUM'
  });

  // Load Emitentes
  useEffect(() => {
    const fetchEmitentes = async () => {
      try {
        const data = await acidenteService.getAllEmitentes();
        setEmitentes(data || []);
      } catch (error) {
        console.error('Error loading emitentes:', error);
      }
    };
    fetchEmitentes();
  }, []);

  // Load Estados Civis
  useEffect(() => {
    const fetchEstadosCivis = async () => {
      try {
        const data = await acidenteService.getAllEstadosCivis();
        setEstadosCivis(data || []);
      } catch (error) {
        console.error('Error loading estados civis:', error);
      }
    };
    fetchEstadosCivis();
  }, []);

  // Load Ocupações
  useEffect(() => {
    const fetchOcupacoes = async () => {
      try {
        const data = await acidenteService.getAllOcupacoes();
        setOcupacoes(data || []);
      } catch (error) {
        console.error('Error loading ocupacoes:', error);
      }
    };
    fetchOcupacoes();
  }, []);

  // Load Vínculos
  useEffect(() => {
    const fetchVinculos = async () => {
      try {
        const data = await acidenteService.getAllVinculosEmpregaticios();
        setVinculos(data || []);
      } catch (error) {
        console.error('Error loading vinculos:', error);
      }
    };
    fetchVinculos();
  }, []);

  // Load Áreas
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await acidenteService.getAllAreas();
        setAreas(data || []);
      } catch (error) {
        console.error('Error loading areas:', error);
      }
    };
    fetchAreas();
  }, []);

  // Load Estados
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const data = await acidenteService.getAllEstados();
        setEstados(data || []);
      } catch (error) {
        console.error('Error loading estados:', error);
      }
    };
    fetchEstados();
  }, []);

  // Load Initial Storage Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedData = JSON.parse(saved);
      const safeData = { ...savedData };
      ['dataNascimento', 'dataEmissaoCTPS', 'dataEmissaoRG'].forEach(field => {
        if (typeof safeData[field] === 'string' && safeData[field].includes('T')) {
          const date = new Date(safeData[field]);
          if (!isNaN(date.getTime())) {
            safeData[field] = date.toLocaleDateString('pt-BR');
          }
        }
      });
      setFormData(prev => ({ ...prev, ...safeData }));

      // Load municipalities if state is already selected in storage
      if (safeData.estado && safeData.estado !== '0' && safeData.estado !== '') {
        acidenteService.getMunicipios(safeData.estado).then(setMunicipios).catch(console.error);
      }
    }
  }, []);

  // Handle selected employer from search
  useEffect(() => {
    const selectedEmpregador = (location.state as any)?.selectedEmpregador;
    if (selectedEmpregador) {
      setFormData(prev => ({
        ...prev,
        empregadorId: selectedEmpregador.id || '',
        documento: selectedEmpregador.documento || '',
        razaoSocial: selectedEmpregador.razaoSocial || ''
      }));
      // Clear state to avoid re-applying on subsequent renders if unrelated state changes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle Input Changes
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    // Apply masks
    if (name === 'dataNascimento' || name === 'dataEmissaoCTPS' || name === 'dataEmissaoRG') {
      newValue = maskDate(value);
    } else if (name === 'cpf') {
      newValue = formatCPF(value);
    } else if (name === 'cep') {
      newValue = formatCEP(value);
    } else if (name === 'telefone') {
      newValue = maskPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Cascading dropdown for state/municipality
    if (name === 'estado') {
      if (newValue && newValue !== '') {
        try {
          const municipiosData = await acidenteService.getMunicipios(newValue);
          setMunicipios(municipiosData || []);
        } catch (error) {
          console.error('Error loading municipios:', error);
          setMunicipios([]);
        }
      } else {
        setMunicipios([]);
      }
      // Reset municipality when state changes
      setFormData(prev => ({ ...prev, municipio: '' }));
    }
  };

  const handleAvancar = () => {
    // Basic Validation
    const newErrors = [];
    if (formData.emitente === '0') newErrors.push('Emitente é obrigatório');
    if (!formData.nome) newErrors.push('Nome é obrigatório');
    if (!formData.dataNascimento) newErrors.push('Data de nascimento é obrigatória');
    if (formData.sexo === '') newErrors.push('Sexo é obrigatório');
    if (formData.ocupacao === '0') newErrors.push('Ocupação é obrigatória');
    if (!formData.aposentado) newErrors.push('Campo Aposentado é obrigatório');
    if (formData.area === '0') newErrors.push('Área é obrigatória');
    if (formData.vinculoEmpregaticio === '0') newErrors.push('Vínculo empregatício é obrigatório');
    
    if (formData.cpf && !isValidCPF(formData.cpf)) {
      newErrors.push('CPF inválido');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to local storage and navigate
    const current = localStorage.getItem(STORAGE_KEY);
    const existing = current ? JSON.parse(current) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...formData }));
    navigate('/acidentepassodois');
  };

  const handlePesquisarEmpresa = () => {
    const current = localStorage.getItem(STORAGE_KEY);
    const existing = current ? JSON.parse(current) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...formData }));
    navigate('/pesquisaempregador', { state: { returnPath: '/acidentepassoum' } });
  };

  return (
    <div className="container">
      <h2>Passo 1: Informações Gerais e Acidentado</h2>
      
      {errors.length > 0 && (
        <div className="alert alert-danger">
          <ul>
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form>
        <fieldset>
          <legend>Informações Gerais</legend>
          <div className="form-group">
            <label>Emitente <span className="required">*</span></label>
            <select name="emitente" value={formData.emitente} onChange={handleInputChange} className="form-control">
              <option value="0">-- Emitente --</option>
              {emitentes.map((e: Emitente) => (
                <option key={String(e.id)} value={String(e.id)}>{e.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Empregador</label>
            <div className="input-group">
              <input type="text" name="documento" value={formData.documento} readOnly className="form-control-disabled" placeholder="Documento" />
              <input type="text" name="razaoSocial" value={formData.razaoSocial} readOnly className="form-control-disabled" placeholder="Razão Social" />
              <button type="button" onClick={handlePesquisarEmpresa} className="btn-search">PESQUISAR</button>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Acidentado</legend>

          <div className="form-row">
            <div className="form-group col-md-8">
                <label>Nome <span className="required">*</span></label>
                <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} maxLength={60} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-8">
                <label>Nome do Responsável</label>
                <input type="text" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleInputChange} maxLength={60} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-4">
              <label>Data de Nascimento <span className="required">*</span></label>
              <input type="text" name="dataNascimento" value={formData.dataNascimento} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
            <div className="form-group col-md-8">
              <label>Estado Civil</label>
              <select name="estadoCivil" value={formData.estadoCivil} onChange={handleInputChange} className="form-control">
                <option value="0">-- Estado Civil --</option>
                {estadosCivis.map((ec: EstadoCivil) => (
                  <option key={String(ec.id)} value={String(ec.id)}>{ec.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-4">
              <label>Carteira de Trabalho (CTPS)</label>
              <input type="text" name="ctps" value={formData.ctps} onChange={handleInputChange} maxLength={5} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>Série</label>
              <input type="text" name="serie" value={formData.serie} onChange={handleInputChange} maxLength={5} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>Data Emissão CTPS</label>
              <input type="text" name="dataEmissaoCTPS" value={formData.dataEmissaoCTPS} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-4">
              <label>UF CTPS</label>
              <select name="ufCTPS" value={formData.ufCTPS} onChange={handleInputChange} className="form-control">
                <option value="0">UF</option>
                {estados.map((st: Estado) => (
                  <option key={String(st.id)} value={String(st.id)}>{st.sigla}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-4">
              <label>Remuneração Mensal</label>
              <input type="text" name="remuneracaoMensal" value={formData.remuneracaoMensal} onChange={handleInputChange} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>PIS/PASEP/NIT</label>
              <input type="text" name="pisPasepNit" value={formData.pisPasepNit} onChange={handleInputChange} maxLength={20} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>RG</label>
              <input type="text" name="rg" value={formData.rg} onChange={handleInputChange} maxLength={20} className="form-control" />
            </div>
            <div className="form-group col-md-6">
              <label>Data Emissão RG</label>
              <input type="text" name="dataEmissaoRG" value={formData.dataEmissaoRG} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Orgão Expedidor</label>
              <input type="text" name="orgaoExpedidorRG" value={formData.orgaoExpedidorRG} onChange={handleInputChange} maxLength={30} className="form-control" />
            </div>
            <div className="form-group col-md-6">
              <label>UF RG</label>
              <select name="ufRG" value={formData.ufRG} onChange={handleInputChange} className="form-control">
                <option value="0">UF</option>
                {estados.map((st: Estado) => (
                  <option key={String(st.id)} value={String(st.id)}>{st.sigla}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>CPF</label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleInputChange} maxLength={14} className="form-control" />
            </div>
            <div className="form-group col-md-6">
              <label>Sexo <span className="required">*</span></label>
              <div className="radio-group">
                <label><input type="radio" name="sexo" value="M" checked={formData.sexo === 'M'} onChange={handleInputChange} /> Masculino</label>
                <label><input type="radio" name="sexo" value="F" checked={formData.sexo === 'F'} onChange={handleInputChange} /> Feminino</label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-8">
                <label>Ocupação <span className="required">*</span></label>
                <select name="ocupacao" value={formData.ocupacao} onChange={handleInputChange} className="form-control">
                  <option value="0">-- Ocupação --</option>
                  {ocupacoes.map((oc: Ocupacao) => (
                    <option key={String(oc.id)} value={String(oc.id)}>{oc.nome}</option>
                  ))}
                </select>
          </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Aposentado <span className="required">*</span></label>
              <select name="aposentado" value={formData.aposentado} onChange={handleInputChange} className="form-control">
                <option value="">-- Aposentado --</option>
                <option value="S">Sim</option>
                <option value="N">Não</option>
                <option value="X">Não Informado</option>
              </select>
            </div>
            <div className="form-group col-md-6">
              <label>Área <span className="required">*</span></label>
              <select name="area" value={formData.area} onChange={handleInputChange} className="form-control">
                <option value="0">-- Área --</option>
                {areas.map((a: Area) => (
                  <option key={String(a.id)} value={String(a.id)}>{a.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-8">
                <label>Vínculo Empregatício <span className="required">*</span></label>
                <select name="vinculoEmpregaticio" value={formData.vinculoEmpregaticio} onChange={handleInputChange} className="form-control">
                  <option value="0">-- Vínculo Empregatício --</option>
                  {vinculos.map((v: VinculoEmpregaticio) => (
                    <option key={String(v.id)} value={String(v.id)}>{v.nome}</option>
                  ))}
                </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Endereço do Acidentado</legend>
          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Estado</label>
              <select name="estado" value={formData.estado} onChange={handleInputChange} className="form-control">
                <option value="">-- Estado --</option>
                {estados.map((st: Estado) => (
                  <option key={String(st.sigla)} value={String(st.sigla)}>{st.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-6">
              <label>Município</label>
              <select name="municipio" value={formData.municipio} onChange={handleInputChange} className="form-control">
                <option value="0">-- Município --</option>
                {municipios.map((m: Municipio) => (
                  <option key={String(m.id)} value={String(m.id)}>{m.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-8">
                <label>Rua</label>
                <input type="text" name="rua" value={formData.rua} onChange={handleInputChange} maxLength={60} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-8">
              <label>Bairro</label>
              <input type="text" name="bairro" value={formData.bairro} onChange={handleInputChange} maxLength={60} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>Número</label>
              <input type="text" name="numero" value={formData.numero} onChange={handleInputChange} maxLength={5} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-4">
              <label>Complemento</label>
              <input type="text" name="complemento" value={formData.complemento} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>CEP</label>
              <input type="text" name="cep" value={formData.cep} onChange={handleInputChange} maxLength={9} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>Telefone</label>
              <div className="phone-input">
                <input type="text" name="ddd" value={formData.ddd} onChange={handleInputChange} maxLength={2} className="form-control ddd" placeholder="DDD" />
                <input type="text" name="telefone" value={formData.telefone} onChange={handleInputChange} maxLength={9} className="form-control" />
              </div>
            </div>
          </div>
        </fieldset>

        <div className="acidente-form-footer">
          <button type="button" onClick={handleAvancar} className="btn-primary">AVANÇAR</button>
        </div>
      </form>
    </div>
  );
};

export default AcidentePassoUm;
