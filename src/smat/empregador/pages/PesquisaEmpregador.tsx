import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { empregadorService as EmpregadorService } from '../services/EmpregadorService';
import { Empregador } from '../../../types/models';

const PesquisaEmpregador: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [razaoSocial, setRazaoSocial] = useState('');
  const [results, setResults] = useState<Empregador[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if we are in selection mode (e.g., coming from Accident form)
  const returnPath = (location.state as any)?.returnPath;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await EmpregadorService.searchEmpregadores(razaoSocial);
      setResults(data);
      if (data.length === 0) {
        setMessage('Nenhum empregador encontrado.');
      } else {
        setMessage('');
      }
    } catch (error) {
      setMessage('Erro ao pesquisar empregadores.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setRazaoSocial('');
    setResults([]);
    setMessage('');
  };

  const handleNew = () => {
    navigate('/empregador', { state: { returnPath: '/pesquisaempregador', nestedReturnPath: returnPath } });
  };

  const handleSelect = (emp: Empregador) => {
    if (returnPath) {
      // If we need to return the selected employer to another page
      navigate(returnPath, { state: { selectedEmpregador: emp } });
    } else {
      // Default behavior: view/edit details
      navigate('/empregador', { state: { empregadorToEdit: emp, returnPath: '/pesquisaempregador', nestedReturnPath: returnPath } });
    }
  };

  const handleReturn = () => {
    if (returnPath) {
        navigate(returnPath);
    } else {
        navigate(-1);
    }
  };

  return (
    <div className="container">
      <h3>Consulta de empregadores</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label>Razão Social</label>
          <input
            type="text"
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Pesquisando...' : 'PESQUISAR'}</button>
          <button type="button" onClick={handleClear} disabled={loading}>LIMPAR</button>
          <button type="button" onClick={handleNew} disabled={loading}>CADASTRAR</button>
          {returnPath && (
             <button type="button" onClick={handleReturn} disabled={loading}>RETORNAR</button>
          )}
        </div>
      </form>

      <br />

      {results.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Razão Social</th>
              {/* Note: Ramo Superior not explicitly in Empregador model yet, mimicking behavior */}
              <th>Ramo de atividade</th>
            </tr>
          </thead>
          <tbody>
            {results.map((emp) => (
              <tr key={emp.id} onClick={() => handleSelect(emp)} className="clickable-row">
                <td>{emp.id}</td>
                <td>{emp.razaoSocial}</td>
                {/* Assuming nested object or helper field */}
                <td>{emp.ramoAtividade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PesquisaEmpregador;
