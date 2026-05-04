import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RelatorioService, ParametrosService, MonitorService } from '../../index';
import { Estado, Regional, Municipio, Campo, AuxCampo } from '../../../types/models';

const ParametrosRelatorioPage: React.FC = () => {
  const navigate = useNavigate();

  // State for form fields
  const [periodicidade, setPeriodicidade] = useState('');
  const [mesAnoInicial, setMesAnoInicial] = useState('');
  const [mesAnoFinal, setMesAnoFinal] = useState('');
  const [anoInicial, setAnoInicial] = useState('');
  const [anoFinal, setAnoFinal] = useState('');
  const [agrupamento, setAgrupamento] = useState('');
  const [estadoId, setEstadoId] = useState('');
  const [campo1Id, setCampo1Id] = useState('');
  const [campo2Id, setCampo2Id] = useState('');
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');

  // Lists for dropdowns
  const [estados, setEstados] = useState<Estado[]>([]);
  const [campos, setCampos] = useState<Campo[]>([]);

  // Dual List Box States
  const [_regionaisAvailable, setRegionaisAvailable] = useState<Regional[]>([]);
  const [regionaisSelected, setRegionaisSelected] = useState<Regional[]>([]);
  const [_municipiosAvailable, setMunicipiosAvailable] = useState<Municipio[]>([]);
  const [municipiosSelected, setMunicipiosSelected] = useState<Municipio[]>([]);
  const [_registros1Available, setRegistros1Available] = useState<AuxCampo[]>([]);
  const [registros1Selected, setRegistros1Selected] = useState<AuxCampo[]>([]);
  const [_registros2Available, setRegistros2Available] = useState<AuxCampo[]>([]);
  const [registros2Selected, setRegistros2Selected] = useState<AuxCampo[]>([]);

  // Selection states for dual list boxes (internal)
  // const [_selRegAvail, setSelRegAvail] = useState<string[]>([]);
  // const [_selRegSel, setSelRegSel] = useState<string[]>([]);
  // ... similar for others

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [est, cps] = await Promise.all([
        ParametrosService.getEstados(),
        MonitorService.getCampos(),
      ]);
      setEstados(est);
      setCampos(cps);
    } catch (error) {
      setMessage('Erro ao carregar dados iniciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setEstadoId(val);
    setRegionaisAvailable([]);
    setRegionaisSelected([]);
    setMunicipiosAvailable([]);
    setMunicipiosSelected([]);

    if (val) {
        // Fetch regionais and municipios based on grouping or just fetch all for filter?
        // JSP logic implies filtering.
        try {
            const regs = await ParametrosService.getRegionaisByEstado(val);
            setRegionaisAvailable(regs);
            const muns = await ParametrosService.getMunicipios(val);
            setMunicipiosAvailable(muns);
        } catch (error) {
            console.error(error);
        }
    }
  };

  const handleCampoChange = async (fieldNum: 1 | 2, id: string) => {
      if (fieldNum === 1) {
          setCampo1Id(id);
          setRegistros1Available([]);
          setRegistros1Selected([]);
          if (id) {
              const regs = await MonitorService.getQueryCampos(id);
              setRegistros1Available(regs);
          }
      } else {
          setCampo2Id(id);
          setRegistros2Available([]);
          setRegistros2Selected([]);
          if (id) {
              const regs = await MonitorService.getQueryCampos(id);
              setRegistros2Available(regs);
          }
      }
  };

  /*
  // Helper for dual list box moves
  const moveItems = <T extends { id?: string; registro?: number }>(
    source: T[],
    setSource: React.Dispatch<React.SetStateAction<T[]>>,
    dest: T[],
    setDest: React.Dispatch<React.SetStateAction<T[]>>,
    selectedIds: string[] // IDs or 'registro' converted to string
  ) => {
    const itemsToMove = source.filter(i => selectedIds.includes(String(i.id || i.registro)));
    const newSource = source.filter(i => !selectedIds.includes(String(i.id || i.registro)));
    setSource(newSource);
    setDest([...dest, ...itemsToMove]);
  };
  */

  const handleGenerate = async () => {
    setLoading(true);
    try {
        const payload = {
            periodicidade,
            mesAnoInicial, mesAnoFinal, anoInicial, anoFinal,
            agrupamento,
            estadoId,
            regionais: regionaisSelected.map(r => r.id),
            municipios: municipiosSelected.map(m => m.id),
            campo1Id,
            registros1: registros1Selected.map(r => r.registro),
            campo2Id,
            registros2: registros2Selected.map(r => r.registro),
            titulo,
            texto
        };
        const reportData = await RelatorioService.generateReport(payload);
        navigate('/relatorios/relatorio', { state: { relatorio: reportData } });
    } catch (error) {
        setMessage('Erro ao gerar relatório.');
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
      setLoading(true);
      try {
        const payload = {
            // ... similar structure to generate
            nomeRelatorio: titulo, // Assuming title is used name
            parametros: {
                // map state to RelatorioParametros structure
                filtros: {
                    periodicidade, estadoId, campo1Id, campo2Id, // etc
                },
                // dataInicio/Fim derived
            } as any
        };
        await RelatorioService.saveReport(payload as any);
        setMessage('Relatório salvo com sucesso!');
      } catch (error) {
          setMessage('Erro ao salvar relatório.');
      } finally {
          setLoading(false);
      }
  };

  const handleClear = () => {
      // Reset all state...
      setMessage('');
  };

  return (
    <div className="container">
      <h3>Gerador de relatórios</h3>
      {message && <div className="alert">{message}</div>}

      <div className="form-group">
          <label>Periodicidade</label>
          <select value={periodicidade} onChange={e => setPeriodicidade(e.target.value)}>
              <option value="">Select</option>
              <option value="1">Mensal</option>
              <option value="2">Anual</option>
          </select>
      </div>

      {periodicidade === '1' && (
          <div className="form-row">
              <div className="form-group">
                  <label>Mês/Ano inicial (mmaaaa)</label>
                  <input type="text" value={mesAnoInicial} onChange={e => setMesAnoInicial(e.target.value)} maxLength={7} />
              </div>
              <div className="form-group">
                  <label>Mês/Ano final (mmaaaa)</label>
                  <input type="text" value={mesAnoFinal} onChange={e => setMesAnoFinal(e.target.value)} maxLength={7} />
              </div>
          </div>
      )}
      {periodicidade === '2' && (
          <div className="form-row">
              <div className="form-group">
                  <label>Ano inicial (aaaa)</label>
                  <input type="text" value={anoInicial} onChange={e => setAnoInicial(e.target.value)} maxLength={4} />
              </div>
              <div className="form-group">
                  <label>Ano final (aaaa)</label>
                  <input type="text" value={anoFinal} onChange={e => setAnoFinal(e.target.value)} maxLength={4} />
              </div>
          </div>
      )}

      <div className="form-group">
          <label>Agrupamento</label>
          <div>
              <label><input type="radio" name="agrupamento" value="1" checked={agrupamento === '1'} onChange={e => setAgrupamento(e.target.value)} /> Estadual</label>
              <label><input type="radio" name="agrupamento" value="2" checked={agrupamento === '2'} onChange={e => setAgrupamento(e.target.value)} /> Regional</label>
              <label><input type="radio" name="agrupamento" value="3" checked={agrupamento === '3'} onChange={e => setAgrupamento(e.target.value)} /> Municipal</label>
          </div>
      </div>

      <div className="form-group">
          <label>Estado</label>
          <select value={estadoId} onChange={handleEstadoChange}>
              <option value="">-- Selecione o Estado --</option>
              {estados.map(e => <option key={e.id} value={e.id}>{e.sigla}</option>)}
          </select>
      </div>

      {/* Dual List Boxes for Regional/Municipios (Simplified UI) */}
      {/* ... Implementation of dual list boxes logic ... */}

      <div className="form-group">
          <label>Informação 1</label>
          <select value={campo1Id} onChange={e => handleCampoChange(1, e.target.value)}>
              <option value="">-- Selecione --</option>
              {campos.map(c => <option key={c.campo} value={c.campo}>{c.label}</option>)}
          </select>
      </div>
      {/* Dual List Box for Campo 1 Data */}

      <div className="form-group">
          <label>Informação 2</label>
          <select value={campo2Id} onChange={e => handleCampoChange(2, e.target.value)}>
              <option value="">-- Selecione --</option>
              {campos.map(c => <option key={c.campo} value={c.campo}>{c.label}</option>)}
          </select>
      </div>
      {/* Dual List Box for Campo 2 Data */}

      <div className="form-group">
          <label>Título</label>
          <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} style={{width: '100%'}} />
      </div>

      <div className="form-group">
          <label>Texto</label>
          <textarea rows={5} value={texto} onChange={e => setTexto(e.target.value)} style={{width: '100%'}} />
      </div>

      <div className="form-actions">
          <button onClick={handleGenerate} disabled={loading}>GERAR RELATÓRIO</button>
          <button onClick={handleSave} disabled={loading}>SALVAR RELATÓRIO</button>
          <button onClick={handleClear}>LIMPAR</button>
      </div>
    </div>
  );
};

export default ParametrosRelatorioPage;
