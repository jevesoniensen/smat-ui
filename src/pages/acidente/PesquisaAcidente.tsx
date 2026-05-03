import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AcidenteService, ParametrosService } from '../../services';
import { Estado, Regional, Municipio, TipoAcidente } from '../../types/models';

const PesquisaAcidentePage: React.FC = () => {
  const navigate = useNavigate();

  // State for form fields
  const [estado, setEstado] = useState('');
  const [regional, setRegional] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [amputacao, setAmputacao] = useState('');
  const [obito, setObito] = useState('');
  const [registroPolicial, setRegistroPolicial] = useState('');
  const [internacao, setInternacao] = useState('');
  const [tipoAcidente, setTipoAcidente] = useState('');
  // Add other fields: diagnostico, fonte, area if needed by model

  // Lists
  const [estados, setEstados] = useState<Estado[]>([]);
  const [regionais, setRegionais] = useState<Regional[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [tiposAcidente, setTiposAcidente] = useState<TipoAcidente[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [est, tipos] = await Promise.all([
        ParametrosService.getEstados(),
        ParametrosService.getTiposAcidente(),
      ]);
      setEstados(est);
      setTiposAcidente(tipos);
    } catch (error) {
      setMessage('Erro ao carregar dados iniciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setEstado(val);
    setRegional('');
    setMunicipio('');
    setRegionais([]);
    setMunicipios([]);

    if (val) {
      try {
        const regs = await ParametrosService.getRegionaisByEstado(val);
        setRegionais(regs);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRegionalChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setRegional(val);
    setMunicipio('');
    // Assuming API has getMunicipiosByRegional or we filter municipios by state/regional?
    // Standard params service has getMunicipios(estadoId).
    // Let's stick to getMunicipios(estado) for now, maybe filtered client side if regional link exists.
    if (estado) {
      const muns = await ParametrosService.getMunicipios(estado);
      setMunicipios(muns);
    }
  };

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const filters = {
          estado, regional, municipio,
          dataInicial, dataFinal,
          amputacao, obito, registroPolicial, internacao,
          tipoAcidente
      };
      // Perform search and navigate to results
      const results = await AcidenteService.listAcidentes(filters);
      navigate('/resultadopesquisa', { state: { results, filters } });
    } catch (error) {
      setMessage('Erro ao realizar consulta.');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    setEstado('');
    setRegional('');
    setMunicipio('');
    setDataInicial('');
    setDataFinal('');
    setAmputacao('');
    setObito('');
    setRegistroPolicial('');
    setInternacao('');
    setTipoAcidente('');
    setRegionais([]);
    setMunicipios([]);
  };

  return (
    <div className="container">
      <h3>Consulta de Acidentes</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleConsultar}>
        <div className="form-group">
          <label>Estado</label>
          <select value={estado} onChange={handleEstadoChange}>
            <option value="">-- Todos --</option>
            {estados.map(e => <option key={e.id} value={e.id}>{e.sigla}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Regional</label>
          <select value={regional} onChange={handleRegionalChange}>
            <option value="">-- Todos --</option>
            {regionais.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Município</label>
          <select value={municipio} onChange={e => setMunicipio(e.target.value)}>
            <option value="">-- Todos --</option>
            {municipios.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Data Inicial</label>
                <input type="text" value={dataInicial} onChange={e => setDataInicial(e.target.value)} placeholder="dd/mm/aaaa" maxLength={10} />
            </div>
            <div className="form-group">
                <label>Data Final</label>
                <input type="text" value={dataFinal} onChange={e => setDataFinal(e.target.value)} placeholder="dd/mm/aaaa" maxLength={10} />
            </div>
        </div>

        <div className="form-row">
            <div className="form-group">
                <label>Amputação</label>
                <select value={amputacao} onChange={e => setAmputacao(e.target.value)}>
                    <option value="">-- Todos --</option>
                    <option value="S">Sim</option>
                    <option value="N">Não</option>
                    <option value="X">Não Informado</option>
                </select>
            </div>
            <div className="form-group">
                <label>Óbito</label>
                <select value={obito} onChange={e => setObito(e.target.value)}>
                    <option value="">-- Todos --</option>
                    <option value="S">Sim</option>
                    <option value="N">Não</option>
                    <option value="X">Não Informado</option>
                </select>
            </div>
        </div>

        <div className="form-group">
            <label>Tipo de acidente</label>
            <select value={tipoAcidente} onChange={e => setTipoAcidente(e.target.value)}>
                <option value="">-- Todos --</option>
                {tiposAcidente.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>CONSULTAR</button>
          <button type="button" onClick={handleLimpar} disabled={loading}>LIMPAR</button>
        </div>
      </form>
    </div>
  );
};

export default PesquisaAcidentePage;
