import React, { useState, useEffect } from 'react';
import { MonitorService } from '../../services';
import { Monitor, Campo, AuxCampo } from '../../types/models';

const MonitorPage: React.FC = () => {
  const [monitores, setMonitores] = useState<Monitor[]>([]);
  const [campos, setCampos] = useState<Campo[]>([]);
  const [queryCampos, setQueryCampos] = useState<AuxCampo[]>([]);
  const [form, setForm] = useState<Partial<Monitor>>({
    periodicidade: 0,
    campo: 0,
    queryCampo: 0,
    maxAcidente: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [monitorsData, camposData] = await Promise.all([
        MonitorService.getMonitores(),
        MonitorService.getCampos(),
      ]);
      setMonitores(monitorsData);
      setCampos(camposData);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleCampoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const campoId = parseInt(e.target.value, 10);
    setForm({ ...form, campo: campoId, queryCampo: 0 });
    
    if (campoId > 0) {
      setLoading(true);
      try {
        const queryData = await MonitorService.getQueryCampos(campoId.toString());
        setQueryCampos(queryData);
      } catch (error) {
        console.error('Error fetching query campos:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setQueryCampos([]);
    }
  };

  const handleSelectMonitor = (monitor: Monitor) => {
    setForm(monitor);
    // Trigger refresh of queryCampos if needed
    if (monitor.campo) {
       MonitorService.getQueryCampos(monitor.campo.toString())
         .then(data => setQueryCampos(data))
         .catch(console.error);
    }
  };

  const handleClear = () => {
    setForm({
      monitor: undefined,
      periodicidade: 0,
      campo: 0,
      queryCampo: 0,
      maxAcidente: 0,
      ultimaExecucao: '',
    });
    setQueryCampos([]);
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (form.monitor) {
        await MonitorService.updateMonitor(form.monitor.toString(), form);
        setMessage('Monitor atualizado com sucesso!');
      } else {
        await MonitorService.createMonitor(form as Monitor);
        setMessage('Monitor criado com sucesso!');
      }
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar monitor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.monitor) return;
    setLoading(true);
    try {
      await MonitorService.deleteMonitor(form.monitor.toString());
      setMessage('Monitor excluído com sucesso!');
      handleClear();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir monitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de Monitores</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        {form.monitor && (
          <div className="form-group">
            <label>Monitor</label>
            <input type="text" value={form.monitor} readOnly disabled />
          </div>
        )}

        <div className="form-group">
          <label>Periodicidade <span style={{ color: 'red' }}>*</span></label>
          <select
            value={form.periodicidade}
            onChange={(e) => setForm({ ...form, periodicidade: parseInt(e.target.value, 10) })}
            required
          >
            <option value="0">-- Periodicidade --</option>
            <option value="1">Mensal</option>
            <option value="2">Anual</option>
          </select>
        </div>

        <div className="form-group">
          <label>Informação <span style={{ color: 'red' }}>*</span></label>
          <select
            value={form.campo}
            onChange={handleCampoChange}
            required
          >
            <option value="0">-- Informação --</option>
            {campos.map((c) => (
              <option key={c.campo} value={c.campo}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Registro <span style={{ color: 'red' }}>*</span></label>
          <select
            value={form.queryCampo}
            onChange={(e) => setForm({ ...form, queryCampo: parseInt(e.target.value, 10) })}
            required
            disabled={!form.campo || queryCampos.length === 0}
          >
            <option value="0">-- Registro --</option>
            {queryCampos.map((qc) => (
              <option key={qc.registro} value={qc.registro}>{qc.nomeRegistro}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Número máximo de acidentes <span style={{ color: 'red' }}>*</span></label>
          <input
            type="number"
            value={form.maxAcidente}
            onChange={(e) => setForm({ ...form, maxAcidente: parseInt(e.target.value, 10) })}
            required
          />
        </div>

        {form.ultimaExecucao && (
          <div className="form-group">
            <label>Última execução</label>
            <input type="text" value={form.ultimaExecucao} readOnly disabled />
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading}>GRAVAR</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleDelete} disabled={loading || !form.monitor}>EXCLUIR</button>
        </div>
      </form>

      <br />

      <table className="table">
        <thead>
          <tr>
            <th>Monitor</th>
            <th>Informação</th>
            <th>Registro</th>
            <th>Última execução</th>
          </tr>
        </thead>
        <tbody>
          {monitores.map((m) => (
            <tr key={m.monitor} onClick={() => handleSelectMonitor(m)} style={{ cursor: 'pointer' }}>
              <td>{m.monitor}</td>
              <td>{m.nomeCampo}</td>
              <td>{m.nomeRegistro}</td>
              <td>{m.ultimaDataExecucao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonitorPage;
