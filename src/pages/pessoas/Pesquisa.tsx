import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PessoasService, ParametrosService } from '../../services';
import { Pessoa, TipoDepoimento } from '../../types/models';

const PesquisaPessoaPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { returnPath } = location.state || {};

  const [nome, setNome] = useState('');
  const [tipoDepoimentoId, setTipoDepoimentoId] = useState('');
  const [tiposDepoimento, setTiposDepoimento] = useState<TipoDepoimento[]>([]);
  const [resultados, setResultados] = useState<Pessoa[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const tipos = await ParametrosService.getTiposDepoimento();
      setTiposDepoimento(tipos);
    } catch (error) {
      console.error('Error fetching tipos depoimento', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await PessoasService.searchPessoas(nome, tipoDepoimentoId);
      setResultados(data);
      if (data.length === 0) {
        setMessage('Nenhuma pessoa encontrada.');
      } else {
        setMessage('');
      }
    } catch (error) {
      setMessage('Erro ao pesquisar pessoas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (pessoa: Pessoa) => {
    if (returnPath) {
      // Return selected person to the previous page
      navigate(returnPath, { state: { ...location.state, selectedPessoa: pessoa } });
    } else {
      // View/Edit mode (assuming generic edit or redirect based on type)
      // For now, let's assume we can view details or edit.
      // But the JSP implies this page is mostly for selection.
      // If standalone, maybe navigate to edit?
      // navigate(`/pessoas/${pessoa.id}`);
    }
  };

  const handleCreate = () => {
    // Navigate to create new person.
    // The JSP calls `formCadastrarPessoa`.
    // We might need to know which type to create if `tipoDepoimentoId` is set,
    // or provide a choice.
    if (tipoDepoimentoId) {
        // Logic to route based on type? Or just generic person create?
        // Let's assume generic for now or specific route
        navigate('/pessoas/cadastrotestemunha'); // Placeholder
    } else {
        navigate('/pessoas/cadastrotestemunha'); // Default
    }
  };

  const handleReturn = () => {
    if (returnPath) {
        navigate(returnPath, { state: location.state });
    } else {
        navigate(-1);
    }
  };

  return (
    <div className="container">
      <h3>Pesquisa de pessoas</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label>Tipo de depoimento</label>
          <select
            value={tipoDepoimentoId}
            onChange={e => setTipoDepoimentoId(e.target.value)}
          >
            <option value="">-- Todos --</option>
            {tiposDepoimento.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Nome</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            maxLength={60}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>PESQUISAR</button>
          <button type="button" onClick={handleCreate}>CADASTRAR</button>
        </div>
      </form>

      <br />

      {resultados.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((p) => (
              <tr key={p.id} onClick={() => handleSelect(p)} style={{ cursor: 'pointer' }}>
                <td>{p.nome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{marginTop: '20px'}}>
        <button onClick={handleReturn}>RETORNAR</button>
      </div>
    </div>
  );
};

export default PesquisaPessoaPage;
