/**
 * AcidentePassoQuatro
 * Migrated from cad_acidente_passo4.jsp and AcidentePassoQuatroAction.java
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { acidenteService } from '../services/AcidenteService';
import { 
  LocalAtendimento, 
  Diagnostico, 
  Estado, 
  Fonte 
} from '../../../types/models';
import { maskDate } from '../../../utils/formatting';

const STORAGE_KEY = 'objAcidente';

export const AcidentePassoQuatro: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Collections State
  const [locaisAtendimento, setLocaisAtendimento] = useState<LocalAtendimento[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [fontes, setFontes] = useState<Fonte[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    dataAtestado: '',
    horaAtestado: '',
    localAtendimento: '',
    internacao: '',
    afastamento: '',
    duracaoTratamento: '',
    descNaturezaLesao: '',
    diagnostico: '',
    descricaoDiagnostico: '',
    observacoes: '',
    crm: '',
    ufCRM: '',
    medicoNome: '',
    fonte: '',
    numDocFonte: '',
    dataEmissaoFonte: '',
    // Control fields
    acao: '',
    destino: '',
    paginaAtual: 'PASSOQUATRO'
  });

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resLocais, resDiagnosticos, resEstados, resFontes] = await Promise.all([
          acidenteService.getAllLocaisAtendimento(),
          acidenteService.getAllDiagnosticos(),
          acidenteService.getAllEstados(),
          acidenteService.getAllFontes()
        ]);

        setLocaisAtendimento(resLocais || []);
        setDiagnosticos(resDiagnosticos || []);
        setEstados(resEstados || []);
        setFontes(resFontes || []);

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedData = JSON.parse(saved);
          const safeData = { ...savedData };
          // Convert potential Dates to strings
          ['dataAtestado', 'dataEmissaoFonte'].forEach(field => {
             if (typeof safeData[field] === 'string' && safeData[field].includes('T')) {
                const date = new Date(safeData[field]);
                if (!isNaN(date.getTime())) {
                  safeData[field] = date.toLocaleDateString('pt-BR');
                }
             }
          });
          setFormData(prev => ({ ...prev, ...safeData }));
        }
      } catch (error) {
        console.error('Error loading collections:', error);
        setErrors(['Erro ao carregar dados do formulário']);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Input Change Handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'dataAtestado' || name === 'dataEmissaoFonte') {
      newValue = maskDate(value);
    } else if (name === 'horaAtestado') {
      const cleanValue = value.replace(/\D/g, '');
      if (cleanValue.length <= 2) newValue = cleanValue;
      else newValue = `${cleanValue.substring(0, 2)}:${cleanValue.substring(2, 4)}`;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const getStorageUpdate = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const existing = saved ? JSON.parse(saved) : {};
    return { ...existing, ...formData };
  };

  const handleVoltar = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStorageUpdate()));
    navigate('/acidentepassotres');
  };

  const handleAvancar = () => {
    const newErrors = [];
    if (!formData.internacao) newErrors.push('Campo Internação é obrigatório');
    if (!formData.afastamento) newErrors.push('Campo Afastamento é obrigatório');
    if (!formData.diagnostico) newErrors.push('Diagnóstico é obrigatório');
    if (!formData.fonte) newErrors.push('Fonte é obrigatória');
    if (!formData.numDocFonte) newErrors.push('Número do documento da fonte é obrigatório');
    if (!formData.dataEmissaoFonte) newErrors.push('Data de emissão da fonte é obrigatória');

    if (newErrors.length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(getStorageUpdate()));
    navigate('/acidentegravar');
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container">
      <h2>Passo 4: Atestado Médico e Fonte</h2>

      {errors.length > 0 && (
        <div className="alert alert-danger">
          <ul>
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form>
        <fieldset>
          <legend>Atestado Médico</legend>
          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Data</label>
              <input type="text" name="dataAtestado" value={formData.dataAtestado} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
            <div className="form-group col-md-6">
              <label>Hora</label>
              <input type="text" name="horaAtestado" value={formData.horaAtestado} onChange={handleInputChange} maxLength={5} className="form-control" placeholder="00:00" />
            </div>
          </div>

          <div className="form-group">
            <label>Local de Atendimento</label>
            <select name="localAtendimento" value={formData.localAtendimento} onChange={handleInputChange} className="form-control">
              <option value="">-- Local Atendimento --</option>
              {locaisAtendimento.map((l: LocalAtendimento) => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Houve Internação <span className="required">*</span></label>
              <select name="internacao" value={formData.internacao} onChange={handleInputChange} className="form-control">
                <option value="">-- Internação --</option>
                <option value="S">Sim</option>
                <option value="N">Não</option>
                <option value="X">Não Informado</option>
              </select>
            </div>
            <div className="form-group col-md-6">
              <label>Houve Afastamento <span className="required">*</span></label>
              <select name="afastamento" value={formData.afastamento} onChange={handleInputChange} className="form-control">
                <option value="">-- Afastamento --</option>
                <option value="S">Sim</option>
                <option value="N">Não</option>
                <option value="X">Não Informado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Duração do Tratamento (dias)</label>
            <input type="text" name="duracaoTratamento" value={formData.duracaoTratamento} onChange={handleInputChange} maxLength={4} className="form-control" />
          </div>

          <div className="form-group">
            <label>Natureza da Lesão</label>
            <textarea name="descNaturezaLesao" value={formData.descNaturezaLesao} onChange={handleInputChange} rows={3} className="form-control"></textarea>
          </div>

          <div className="form-group">
            <label>Diagnóstico <span className="required">*</span></label>
            <select name="diagnostico" value={formData.diagnostico} onChange={handleInputChange} className="form-control">
              <option value="">-- Diagnóstico --</option>
              {diagnosticos.map((d: Diagnostico) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descrição Diagnóstico</label>
            <textarea name="descricaoDiagnostico" value={formData.descricaoDiagnostico} onChange={handleInputChange} rows={3} className="form-control"></textarea>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3} className="form-control"></textarea>
          </div>

          <div className="form-row">
            <div className="form-group col-md-4">
              <label>CRM</label>
              <input type="text" name="crm" value={formData.crm} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>UF CRM</label>
              <select name="ufCRM" value={formData.ufCRM} onChange={handleInputChange} className="form-control">
                <option value="">-- UF --</option>
                {estados.map((st: Estado) => (
                  <option key={st.id} value={st.id}>{st.sigla}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-4">
              <label>Médico</label>
              <input type="text" name="medicoNome" value={formData.medicoNome} onChange={handleInputChange} maxLength={60} className="form-control" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Fonte dos Dados do Acidente</legend>
          <div className="form-group">
            <label>Fonte <span className="required">*</span></label>
            <select name="fonte" value={formData.fonte} onChange={handleInputChange} className="form-control">
              <option value="">-- Fonte --</option>
              {fontes.map((f: Fonte) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Número do Documento <span className="required">*</span></label>
              <input type="text" name="numDocFonte" value={formData.numDocFonte} onChange={handleInputChange} maxLength={25} className="form-control" />
            </div>
            <div className="form-group col-md-6">
              <label>Data de Emissão <span className="required">*</span></label>
              <input type="text" name="dataEmissaoFonte" value={formData.dataEmissaoFonte} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
          </div>
        </fieldset>

        <div className="form-actions" style={{ textAlign: 'center', marginTop: '20px' }}>
          <button type="button" onClick={handleVoltar} className="btn-secondary">VOLTAR</button>
          &nbsp;&nbsp;&nbsp;
          <button type="button" onClick={handleAvancar} className="btn-primary">AVANÇAR</button>
        </div>
      </form>
    </div>
  );
};

export default AcidentePassoQuatro;
