/**
 * AcidentePassoTres
 * Migrated from cad_acidente_passo3.jsp and AcidentePassoTresAction.java
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { acidenteService } from '../services/AcidenteService';
import '../css/acidente.css';
import { Estado, Municipio } from '../../../types/models';
import { formatCEP, maskPhone } from '../../common/formatting';

const TESTEMUNHAS_STORAGE_KEY = 'vTestemunhas';

export const AcidentePassoTres: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Collections State
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipiosTestemunha, setMunicipiosTestemunha] = useState<Municipio[]>([]);
  const [vTestemunhas, setVTestemunhas] = useState<any[]>([]);

  // Witness Form State
  const [formData, setFormData] = useState({
    nomeTestemunha: '',
    estadoTestemunha: '',
    municipioTestemunha: '',
    ruaTestemunha: '',
    bairroTestemunha: '',
    numeroTestemunha: '',
    complementoTestemunha: '',
    cepTestemunha: '',
    dddTestemunha: '',
    telefoneTestemunha: '',
    // Control fields
    acao: '',
    destino: '',
    paginaAtual: 'PASSOTRES'
  });

  // Load Initial Data
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const statesData = await acidenteService.getAllEstados();
        setEstados(statesData || []);

        const savedTestemunhas = localStorage.getItem(TESTEMUNHAS_STORAGE_KEY);
        if (savedTestemunhas) {
          setVTestemunhas(JSON.parse(savedTestemunhas));
        }
      } catch (error) {
        console.error('Error loading states:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Input Change Handler
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'cepTestemunha') {
      newValue = formatCEP(value);
    } else if (name === 'telefoneTestemunha') {
      newValue = maskPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Cascading dropdown for Witness Municipality
    if (name === 'estadoTestemunha') {
      if (newValue) {
        try {
          const data = await acidenteService.getMunicipios(newValue);
          setMunicipiosTestemunha(data || []);
        } catch (error) {
          console.error('Error loading municipios:', error);
          setMunicipiosTestemunha([]);
        }
      } else {
        setMunicipiosTestemunha([]);
      }
      setFormData(prev => ({ ...prev, municipioTestemunha: '' }));
    }
  };

  const handleInserirTestemunha = () => {
    if (!formData.nomeTestemunha) {
      setErrors(['Nome da testemunha é obrigatório para inserir']);
      return;
    }

    const newWitness = {
      ...formData,
      index: vTestemunhas.length
    };

    const newList = [...vTestemunhas, newWitness];
    setVTestemunhas(newList);
    localStorage.setItem(TESTEMUNHAS_STORAGE_KEY, JSON.stringify(newList));
    handleLimparForm();
    setErrors([]);
  };

  const handleExcluirTestemunha = (index: number) => {
    const newList = vTestemunhas.filter((_: any, i: number) => i !== index);
    const reindexedList = newList.map((item: any, i: number) => ({ ...item, index: i }));
    setVTestemunhas(reindexedList);
    localStorage.setItem(TESTEMUNHAS_STORAGE_KEY, JSON.stringify(reindexedList));
  };

  const handleLimparForm = () => {
    setFormData({
      nomeTestemunha: '',
      estadoTestemunha: '',
      municipioTestemunha: '',
      ruaTestemunha: '',
      bairroTestemunha: '',
      numeroTestemunha: '',
      complementoTestemunha: '',
      cepTestemunha: '',
      dddTestemunha: '',
      telefoneTestemunha: '',
      acao: '',
      destino: '',
      paginaAtual: 'PASSOTRES'
    });
  };

  const handleVoltar = () => {
    navigate('/acidentepassodois');
  };

  const handleAvancar = () => {
    navigate('/acidentepassoquatro');
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container">
      <h2>Passo 3: Testemunhas</h2>

      {errors.length > 0 && (
        <div className="alert alert-danger">
          <ul>
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form>
        <fieldset>
          <legend>Dados da Testemunha</legend>
          <div className="form-group">
            <label>Nome</label>
            <input type="text" name="nomeTestemunha" value={formData.nomeTestemunha} onChange={handleInputChange} maxLength={60} className="form-control" />
          </div>

          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Estado</label>
              <select name="estadoTestemunha" value={formData.estadoTestemunha} onChange={handleInputChange} className="form-control">
                <option value="">-- Estado --</option>
                {estados.map((st: Estado) => (
                  <option key={String(st.sigla)} value={String(st.sigla)}>{st.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group col-md-6">
              <label>Município</label>
              <select name="municipioTestemunha" value={formData.municipioTestemunha} onChange={handleInputChange} className="form-control">
                <option value="">-- Município --</option>
                {municipiosTestemunha.map((m: Municipio) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Rua</label>
            <input type="text" name="ruaTestemunha" value={formData.ruaTestemunha} onChange={handleInputChange} maxLength={80} className="form-control" />
          </div>

          <div className="form-row">
            <div className="form-group col-md-8">
              <label>Bairro</label>
              <input type="text" name="bairroTestemunha" value={formData.bairroTestemunha} onChange={handleInputChange} maxLength={60} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>Número</label>
              <input type="text" name="numeroTestemunha" value={formData.numeroTestemunha} onChange={handleInputChange} maxLength={5} className="form-control" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group col-md-4">
              <label>Complemento</label>
              <input type="text" name="complementoTestemunha" value={formData.complementoTestemunha} onChange={handleInputChange} maxLength={10} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>CEP</label>
              <input type="text" name="cepTestemunha" value={formData.cepTestemunha} onChange={handleInputChange} maxLength={9} className="form-control" />
            </div>
            <div className="form-group col-md-4">
              <label>Telefone</label>
              <div className="phone-input">
                <input type="text" name="dddTestemunha" value={formData.dddTestemunha} onChange={handleInputChange} maxLength={2} className="form-control ddd" placeholder="DDD" />
                <input type="text" name="telefoneTestemunha" value={formData.telefoneTestemunha} onChange={handleInputChange} maxLength={9} className="form-control" />
              </div>
            </div>
          </div>

          <div className="acidente-form-actions-small">
            <button type="button" onClick={handleInserirTestemunha} className="btn-secondary">INSERIR</button>
            &nbsp;&nbsp;&nbsp;
            <button type="button" onClick={handleLimparForm} className="btn-link">LIMPAR</button>
          </div>
        </fieldset>

        {vTestemunhas.length > 0 && (
          <div className="acidente-selected-items">
            <table className="table">
              <thead>
                <tr>
                  <th className="acidente-table-header">Testemunhas Informadas</th>
                  <th className="acidente-table-header">Ação</th>
                </tr>
              </thead>
              <tbody>
                {vTestemunhas.map((item: any) => (
                  <tr key={item.index}>
                    <td>{item.nomeTestemunha}</td>
                    <td>
                      <button type="button" onClick={() => handleExcluirTestemunha(item.index)} className="btn-link">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="acidente-form-footer">
          <button type="button" onClick={handleVoltar} className="btn-secondary">VOLTAR</button>
          &nbsp;&nbsp;&nbsp;
          <button type="button" onClick={handleAvancar} className="btn-primary">AVANÇAR</button>
        </div>
      </form>
    </div>
  );
};

export default AcidentePassoTres;
