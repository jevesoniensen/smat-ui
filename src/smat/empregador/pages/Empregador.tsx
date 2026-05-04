import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { empregadorService as EmpregadorService } from '../services/EmpregadorService';
import { ParametrosService, AcidenteService } from '../../index';
import { Empregador, TipoEmpregador, RamoAtividade, Estado, Municipio } from '../../../types/models';

const EmpregadorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [empregadores, setEmpregadores] = useState<Empregador[]>([]);
  const [tiposEmpregador, setTiposEmpregador] = useState<TipoEmpregador[]>([]);
  const [ramosSuperiores, setRamosSuperiores] = useState<RamoAtividade[]>([]);
  const [allRamosAtividade, setAllRamosAtividade] = useState<RamoAtividade[]>([]);
  const [filteredRamosAtividade, setFilteredRamosAtividade] = useState<RamoAtividade[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);

  const [form, setForm] = useState({
    id: undefined as string | undefined,
    tipoEmpregadorId: '',
    ramoSuperiorId: '',
    ramoAtividadeId: '',
    estadoId: '',
    municipioId: '',
    documento: '',
    razaoSocial: '',
    rua: '',
    numero: '',
    bairro: '',
    complemento: '',
    cep: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [documentLabel, setDocumentLabel] = useState('Documento');

  const returnPath = (location.state as any)?.returnPath;

  // Handle selected employer from search/navigation
  useEffect(() => {
    const emp = (location.state as any)?.empregadorToEdit;
    if (emp && tiposEmpregador.length > 0 && allRamosAtividade.length > 0 && estados.length > 0) {
      handleSelectEmpregador(emp);
      // Clear state to avoid re-applying on subsequent renders
      window.history.replaceState({ ...location.state, empregadorToEdit: undefined }, document.title);
    }
  }, [location.state, tiposEmpregador, allRamosAtividade, estados]);

  // Load Tipos Empregador
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await ParametrosService.getTiposEmpregador();
        console.log('Fetched Tipos Empregador:', data);
        setTiposEmpregador(data || []);
      } catch (error) {
        console.error('Error loading tipos:', error);
      }
    };
    fetchTipos();
  }, []);

  // Load Ramos Atividade
  useEffect(() => {
    const fetchRamos = async () => {
      try {
        const data = await ParametrosService.getRamosAtividade();
        console.log('Fetched Ramos:', data);
        setAllRamosAtividade(data || []);
        // Filter superiors (those without a parent) - check multiple field names
        setRamosSuperiores((data || []).filter(r => {
          const supId = r.ramoSuperior;
          return !supId || supId === '0';
        }));
      } catch (error) {
        console.error('Error loading ramos:', error);
      }
    };
    fetchRamos();
  }, []);

  // Load Estados
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const data = await AcidenteService.getAllEstados();
        setEstados(data || []);
      } catch (error) {
        console.error('Error loading estados:', error);
      }
    };
    fetchEstados();
  }, []);

  // Load Empregadores List
  useEffect(() => {
    const fetchEmpregadores = async () => {
      setLoading(true);
      try {
        const data = await EmpregadorService.listEmpregadores();
        setEmpregadores(data || []);
      } catch (error) {
        setMessage('Erro ao carregar lista de empregadores.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmpregadores();
  }, []);

  // Handle Input Changes
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Logic for Tipo Empregador -> Document Label
    if (name === 'tipoEmpregadorId') {
      const selectedType = tiposEmpregador.find(t => String(t.id) === value);
      if (selectedType) {
        if (selectedType.codigo === 'PF') setDocumentLabel('CPF');
        else if (selectedType.codigo === 'PJ') setDocumentLabel('CNPJ');
        else setDocumentLabel('Documento');
      } else {
        setDocumentLabel('Documento');
      }
    }

    // Logic for Ramo Superior -> Ramo Atividade (Local Filter)
    if (name === 'ramoSuperiorId') {
      if (value) {
        const subRamos = allRamosAtividade.filter(r => {
          const supId = r.ramoSuperior;
          return String(supId) === value;
        });
        setFilteredRamosAtividade(subRamos);
      } else {
        setFilteredRamosAtividade([]);
      }
      setForm(prev => ({ ...prev, ramoAtividadeId: '' }));
    }

    // Logic for Estado -> Municipio (Fetch)
    if (name === 'estadoId') {
      if (value) {
        try {
          const muns = await AcidenteService.getMunicipios(value);
          setMunicipios(muns || []);
        } catch (error) {
          console.error('Error fetching municipios:', error);
          setMunicipios([]);
        }
      } else {
        setMunicipios([]);
      }
      setForm(prev => ({ ...prev, municipioId: '' }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
         ...(form.id && Number(form.id) > 0 ? { id: Number(form.id) } : {}),
          ramoAtividade: Number(form.ramoAtividadeId || 0),
          estado: form.estadoId,
          municipio: Number(form.municipioId || 0),
          razaoSocial: form.razaoSocial,
          documento: form.documento,
          numero: Number(form.numero || 0),
          rua: form.rua,
          bairro: form.bairro,
          cep: form.cep,
          complemento: form.complemento || '',
          tipoEmpregador: Number(form.tipoEmpregadorId || 0)
      };

      if (form.id) {
        await EmpregadorService.updateEmpregador(form.id, payload as any);
        setMessage('Empregador atualizado com sucesso!');
      } else {
        await EmpregadorService.createEmpregador(payload as any);
        setMessage('Empregador criado com sucesso!');
      }
      handleClear();
      const list = await EmpregadorService.listEmpregadores();
      setEmpregadores(list);
    } catch (error) {
      setMessage('Erro ao salvar empregador.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setLoading(true);
    try {
      await EmpregadorService.deleteEmpregador(form.id);
      setMessage('Empregador excluído com sucesso!');
      handleClear();
      const list = await EmpregadorService.listEmpregadores();
      setEmpregadores(list);
    } catch (error) {
      setMessage('Erro ao excluir empregador.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      id: undefined,
      tipoEmpregadorId: '',
      ramoSuperiorId: '',
      ramoAtividadeId: '',
      estadoId: '',
      municipioId: '',
      documento: '',
      razaoSocial: '',
      rua: '',
      numero: '',
      bairro: '',
      complemento: '',
      cep: '',
    });
    setFilteredRamosAtividade([]);
    setMunicipios([]);
    setMessage('');
    setDocumentLabel('Documento');
  };

  const handleSelectEmpregador = async (emp: Empregador) => {
    // Determine cascading IDs
    const currentRamo = allRamosAtividade.find(r => String(r.id) === String(emp.ramoAtividade));
    const supId = currentRamo?.ramoSuperior || '';

    // Normalize IDs to strings for select compatibility
    const tipoEmpregadorId = String(emp.tipoEmpregador || '');
    const estadoId = String(emp.estado || '').trim();
    const municipioId = String(emp.municipio || '');

    console.log('Selected Empregador:', emp);

    setForm({
        id: emp.id,
        tipoEmpregadorId: tipoEmpregadorId,
        ramoSuperiorId: String(supId),
        ramoAtividadeId: String(emp.ramoAtividade || ''),
        estadoId: estadoId,
        municipioId: municipioId,
        documento: emp.documento,
        razaoSocial: emp.razaoSocial,
        rua: emp.rua,
        numero: String(emp.numero || ''),
        bairro: emp.bairro,
        complemento: emp.complemento || '',
        cep: emp.cep,
    });

    // Manually trigger cascading updates
    if (tipoEmpregadorId) {
        const selectedType = tiposEmpregador.find(t => String(t.id || (t as any).tipoEmpregador) === tipoEmpregadorId);
        if (selectedType) {
            if (selectedType.codigo === 'PF') setDocumentLabel('CPF');
            else if (selectedType.codigo === 'PJ') setDocumentLabel('CNPJ');
            else setDocumentLabel('Documento');
        } else {
            setDocumentLabel('Documento');
        }
    }

    if (supId) {
        const subRamos = allRamosAtividade.filter(r => String(r.ramoSuperior) === String(supId));
        setFilteredRamosAtividade(subRamos);
    } else {
        setFilteredRamosAtividade([]);
    }

    if (estadoId) {
        try {
            const muns = await AcidenteService.getMunicipios(estadoId);
            setMunicipios(muns || []);
        } catch (error) {
            console.error('Error fetching municipios in handleSelectEmpregador:', error);
            setMunicipios([]);
        }
    } else {
        setMunicipios([]);
    }
  };

  const handleReturn = () => {
    if (returnPath) {
      navigate(returnPath, { state: { returnPath: (location.state as any)?.nestedReturnPath } });
    } else {
      navigate(-1);
    }
  };

  const handleAddTelefone = (id: string) => {
      navigate(`/telefonesempregador?empregador=${id}`);
  };

  return (
    <div className="container">
      <h3>Cadastro de Empregadores</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        {/* Row 1: Tipo Empregador */}
        <div className="form-group">
          <label>Tipo Empregador <span style={{color:'red'}}>*</span></label>
          <select name="tipoEmpregadorId" value={form.tipoEmpregadorId} onChange={handleInputChange} required>
            <option value="">-- Tipo Empregador --</option>
            {tiposEmpregador.map(t => {
              const id = t.id || (t as any).tipoEmpregador;
              const label = t.descricao || (t as any).nome;
              return <option key={String(id)} value={String(id)}>{label}</option>;
            })}
          </select>
        </div>

        {/* Row 2: Ramo Superior */}
        <div className="form-group">
          <label>Ramo Superior <span style={{color:'red'}}>*</span></label>
          <select name="ramoSuperiorId" value={form.ramoSuperiorId} onChange={handleInputChange}>
            <option value="">-- Ramo Superior --</option>
            {ramosSuperiores.map(r => {
              const id = r.id;
              const label = r.nome;
              return <option key={String(id)} value={String(id)}>{label}</option>;
            })}
          </select>
        </div>

        {/* Row 3: Ramo Atividade */}
        <div className="form-group">
          <label>Ramo de atividade <span style={{color:'red'}}>*</span></label>
          <select name="ramoAtividadeId" value={form.ramoAtividadeId} onChange={handleInputChange}>
            <option value="">-- Ramo de atividade --</option>
            {filteredRamosAtividade.map(r => {
              const id = r.id;
              const label = r.nome;
              return <option key={String(id)} value={String(id)}>{label}</option>;
            })}
          </select>
        </div>

        {/* Row 4: Estado */}
        <div className="form-group">
          <label>Estado <span style={{color:'red'}}>*</span></label>
          <select name="estadoId" value={form.estadoId} onChange={handleInputChange}>
            <option value="">-- Estado --</option>
            {estados.map(e => <option key={String(e.sigla)} value={String(e.sigla)}>{e.nome}</option>)}
          </select>
        </div>

        {/* Row 5: Municipio */}
        <div className="form-group">
          <label>Município <span style={{color:'red'}}>*</span></label>
          <select name="municipioId" value={form.municipioId} onChange={handleInputChange}>
            <option value="">-- Municipio --</option>
            {municipios.map(m => <option key={String(m.id)} value={String(m.id)}>{m.nome}</option>)}
          </select>
        </div>

        {/* Row 6: Documento and Razao Social */}
        <div className="form-row">
            <div className="form-group">
                <label>{documentLabel}</label>
                <input
                    type="text"
                    name="documento"
                    value={form.documento}
                    onChange={handleInputChange}
                />
            </div>
            <div className="form-group">
                <label>Razão social/Nome <span style={{color:'red'}}>*</span></label>
                <input
                    type="text"
                    name="razaoSocial"
                    value={form.razaoSocial}
                    onChange={handleInputChange}
                    required
                />
            </div>
        </div>

        <h4>Endereço</h4>
        {/* Address Fields */}
        <div className="form-group">
            <label>Rua <span style={{color:'red'}}>*</span></label>
            <input type="text" name="rua" value={form.rua} onChange={handleInputChange} required />
        </div>
        <div className="form-group">
            <label>Bairro <span style={{color:'red'}}>*</span></label>
            <input type="text" name="bairro" value={form.bairro} onChange={handleInputChange} required />
        </div>
        <div className="form-row">
            <div className="form-group">
                <label>Numero <span style={{color:'red'}}>*</span></label>
                <input type="text" name="numero" value={form.numero} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label>Complemento</label>
                <input type="text" name="complemento" value={form.complemento} onChange={handleInputChange} />
            </div>
            <div className="form-group">
                <label>CEP <span style={{color:'red'}}>*</span></label>
                <input type="text" name="cep" value={form.cep} onChange={handleInputChange} required />
            </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !form.id}>EXCLUIR</button>
          {returnPath && (
            <button type="button" onClick={handleReturn} disabled={loading}>RETORNAR</button>
          )}
        </div>
      </form>

      <br />

      <table className="table">
        <thead>
          <tr>
            <th>Nº</th>
            <th>Razão Social</th>
            <th>Telefone</th>
          </tr>
        </thead>
        <tbody>
          {empregadores.map((emp) => (
            <tr key={emp.id}>
              <td>
                  <button 
                    type="button" 
                    className="btn-link" 
                    style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    onClick={() => handleSelectEmpregador(emp)}
                  >
                    {emp.id}
                  </button>
              </td>
              <td>
                  <button 
                    type="button" 
                    className="btn-link" 
                    style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    onClick={() => handleSelectEmpregador(emp)}
                  >
                    {emp.razaoSocial}
                  </button>
              </td>
              <td>
                  <button 
                    type="button" 
                    className="btn-link" 
                    style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    onClick={() => handleAddTelefone(emp.id)}
                  >
                    Incluir Telefone
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmpregadorPage;
