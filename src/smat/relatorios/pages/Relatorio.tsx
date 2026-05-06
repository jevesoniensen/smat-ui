import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/relatorios.css';

const RelatorioPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { relatorio } = location.state || {};

  if (!relatorio) {
    return (
      <div className="container text-center mt-50">
        <h4>Não há um relatório para ser gerado!</h4>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container">
      <div className="text-center mb-20">
        <h3>{relatorio.titulo}</h3>
      </div>

      <div className="mb-20">
        <p><strong>Tipo do Relatório:</strong> {relatorio.campo1} {relatorio.campo2 ? `X ${relatorio.campo2}` : ''}</p>
        <p><strong>Período:</strong> {relatorio.dataInicial} à {relatorio.dataFinal}</p>
        <p><strong>Periodicidade:</strong> {relatorio.nomePeriodicidade}</p>
      </div>

      {relatorio.mesAno && relatorio.mesAno.map((mes: string, index: number) => (
        <div key={index} className="mb-30">
          <table className="table table-bordered w-100">
            <thead>
              <tr>
                <th colSpan={relatorio.colSpanPeriodo || 1} className="text-left">{mes}</th>
              </tr>
              <tr>
                <th>&nbsp;</th>
                {relatorio.nomeRegistrosCampo1 && relatorio.nomeRegistrosCampo1.map((c1: string, i: number) => (
                  <th key={i} colSpan={relatorio.lengthCampo2 || 1} className="text-center">
                    {c1}
                  </th>
                ))}
              </tr>
              {relatorio.campo2 && (
                <tr>
                  <th className="text-center">{relatorio.labelLocal}</th>
                  {relatorio.nomeRegistrosCampo1 && relatorio.nomeRegistrosCampo1.map((_c1: string, i: number) => (
                    <React.Fragment key={i}>
                      {relatorio.nomeRegistrosCampo2 && relatorio.nomeRegistrosCampo2.map((c2: string, j: number) => (
                        <th key={`${i}-${j}`} className="text-center">{c2}</th>
                      ))}
                    </React.Fragment>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {relatorio.nomeLocal && relatorio.nomeLocal.map((local: string, i: number) => (
                <tr key={i}>
                  <th>{local}</th>
                  {relatorio.quantidade && relatorio.quantidade[i] && relatorio.quantidade[i].map((qtd: number, j: number) => (
                    <td key={j} className="text-right">
                      {qtd !== null && qtd !== undefined ? qtd : 0}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {relatorio.texto && (
        <div className="mb-20 text-center">
          <table className="table table-bordered w-100">
            <tbody>
              <tr>
                <td>{relatorio.texto}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="text-center mt-50 mb-50">
        <button onClick={handlePrint} className="no-print">IMPRIMIR</button>
      </div>
    </div>
  );
};

export default RelatorioPage;
