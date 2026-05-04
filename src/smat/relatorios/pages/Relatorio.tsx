import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RelatorioPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { relatorio } = location.state || {};

  if (!relatorio) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
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
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3>{relatorio.titulo}</h3>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Tipo do Relatório:</strong> {relatorio.campo1} {relatorio.campo2 ? `X ${relatorio.campo2}` : ''}</p>
        <p><strong>Período:</strong> {relatorio.dataInicial} à {relatorio.dataFinal}</p>
        <p><strong>Periodicidade:</strong> {relatorio.nomePeriodicidade}</p>
      </div>

      {relatorio.mesAno && relatorio.mesAno.map((mes: string, index: number) => (
        <div key={index} style={{ marginBottom: '30px' }}>
          <table className="table" border={1} style={{ width: '100%', borderColor: 'black' }}>
            <thead>
              <tr>
                <th colSpan={relatorio.colSpanPeriodo || 1} style={{ textAlign: 'left' }}>{mes}</th>
              </tr>
              <tr>
                <th>&nbsp;</th>
                {relatorio.nomeRegistrosCampo1 && relatorio.nomeRegistrosCampo1.map((c1: string, i: number) => (
                  <th key={i} colSpan={relatorio.lengthCampo2 || 1} style={{ textAlign: 'center' }}>
                    {c1}
                  </th>
                ))}
              </tr>
              {relatorio.campo2 && (
                <tr>
                  <th style={{ textAlign: 'center' }}>{relatorio.labelLocal}</th>
                  {relatorio.nomeRegistrosCampo1 && relatorio.nomeRegistrosCampo1.map((_c1: string, i: number) => (
                    <React.Fragment key={i}>
                      {relatorio.nomeRegistrosCampo2 && relatorio.nomeRegistrosCampo2.map((c2: string, j: number) => (
                        <th key={`${i}-${j}`} style={{ textAlign: 'center' }}>{c2}</th>
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
                    <td key={j} style={{ textAlign: 'right' }}>
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
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <table border={1} style={{ width: '100%', borderColor: 'black' }}>
            <tbody>
              <tr>
                <td>{relatorio.texto}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '50px', marginBottom: '50px' }}>
        <button onClick={handlePrint} className="no-print">IMPRIMIR</button>
      </div>
    </div>
  );
};

export default RelatorioPage;
