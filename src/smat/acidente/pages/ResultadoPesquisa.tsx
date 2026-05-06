/**
 * ResultadoPesquisa
 */
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/acidente.css';

const ResultadoPesquisaPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { results, filters } = location.state || { results: [], filters: {} };

  const handleBack = () => {
    navigate('/pesquisaacidente', { state: { filters } });
  };

  const handleView = (acidenteId: string) => {
    navigate('/visualizaacidente', { state: { acidenteId } });
  };

  return (
    <div className="container">
      <h3>Resultado da Pesquisa de Acidentes</h3>

      <div className="form-actions">
        <button onClick={handleBack}>VOLTAR</button>
      </div>

      <br />

      {results && results.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Nº Acidente</th>
              <th>Data</th>
              <th>Acidentado</th>
              <th>Empregador</th>
            </tr>
          </thead>
          <tbody>
            {results.map((acidente: any) => (
              <tr key={acidente.id} onClick={() => handleView(acidente.id)} className="clickable-row">
                <td>{acidente.id}</td>
                <td>{new Date(acidente.dataAcidente).toLocaleDateString()}</td>
                <td>{acidente.trabalhador?.nome}</td>
                <td>{acidente.empregador?.razaoSocial}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum resultado encontrado para os filtros informados.</p>
      )}
    </div>
  );
};

export default ResultadoPesquisaPage;
