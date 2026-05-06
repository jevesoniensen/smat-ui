/**
 * VisualizaAcidente
 * Migrated from VisualizaAcidente.jsp
 * Supports viewing an existing accident or previewing data from localStorage during registration.
 */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { acidenteService } from '../services/AcidenteService';
import '../css/acidente.css';

const STORAGE_KEY = 'objAcidente';
const LESOES_STORAGE_KEY = 'vLocalLesaoAcidente';
const TESTEMUNHAS_STORAGE_KEY = 'vTestemunhas';

const VisualizaAcidentePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { acidenteId, preview } = (location.state as any) || {};

  const [acidente, setAcidente] = useState<any | null>(null);
  const [testemunhas, setTestemunhas] = useState<any[]>([]);
  const [lesoes, setLesoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (preview) {
      loadPreviewData();
    } else if (acidenteId) {
      fetchData(acidenteId);
    } else {
      setMessage('Acidente não especificado.');
    }
  }, [acidenteId, preview]);

  const loadPreviewData = () => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const vTestemunhas = JSON.parse(localStorage.getItem(TESTEMUNHAS_STORAGE_KEY) || '[]');
      const vLesoes = JSON.parse(localStorage.getItem(LESOES_STORAGE_KEY) || '[]');
      
      setAcidente(data);
      setTestemunhas(vTestemunhas);
      setLesoes(vLesoes);
    } catch (error) {
      console.error('Error loading preview data:', error);
      setMessage('Erro ao carregar dados de visualização local.');
    }
  };

  const fetchData = async (id: string | number) => {
    setLoading(true);
    try {
      const data = await acidenteService.getAcidente(id);
      setAcidente(data);
      // Witnesses and Lesions are expected to be part of the Acidente model response
      setTestemunhas((data as any).testemunhas || []);
      setLesoes((data as any).locaisLesao || []);
    } catch (error) {
      console.error('Error fetching accident:', error);
      setMessage('Erro ao carregar acidente do servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatDisplayDate = (date: any) => {
    if (!date) return '---';
    if (date instanceof Date) return date.toLocaleDateString('pt-BR');
    if (typeof date === 'string') {
      if (date.includes('T')) return new Date(date).toLocaleDateString('pt-BR');
      return date; // Assuming already formatted DD/MM/YYYY
    }
    return String(date);
  };

  const renderValue = (value: any) => (value !== undefined && value !== null && value !== '') ? String(value) : '---';

  if (loading) return <div className="container acidente-loading">Carregando...</div>;
  
  if (message) return (
    <div className="container acidente-error-msg">
      <div className="acidente-alert-danger">
        {message}
      </div>
      <div className="acidente-view-actions">
        <button onClick={handleBack} className="btn-voltar-large">VOLTAR</button>
      </div>
    </div>
  );

  if (!acidente) return <div className="container acidente-loading">Acidente não encontrado.</div>;

  return (
    <div className="container acidente-view-container">
      <h3 className="acidente-view-header">
        {preview ? 'PRÉ-VISUALIZAÇÃO DO ACIDENTE' : `VISUALIZAÇÃO DO ACIDENTE Nº ${acidente.id}`}
      </h3>

      <div className="acidente-view-table-wrapper">
        <table className="acidente-view-table">
          <tbody>
            {/* INFORMAÇÕES GERAIS */}
            <tr>
              <th colSpan={8} className="acidente-view-section-title">INFORMAÇÕES GERAIS</th>
            </tr>
            <tr>
              <td className="acidente-view-label accidente-view-label-width">Emitente</td>
              <td colSpan={7} className="acidente-view-value">{renderValue(acidente.nomeEmitente || acidente.emitente)}</td>
            </tr>
            {acidente.razaoSocial && (
              <tr>
                <td className="acidente-view-label">Empregador</td>
                <td colSpan={7} className="acidente-view-value">{renderValue(acidente.documento)} - {renderValue(acidente.razaoSocial)}</td>
              </tr>
            )}

            {/* TRABALHADOR */}
            <tr>
              <th colSpan={8} className="acidente-view-section-title">TRABALHADOR</th>
            </tr>
            <tr>
              <td className="acidente-view-label">Nome</td>
              <td colSpan={7} className="acidente-view-value">{renderValue(acidente.nome)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Nascimento</td>
              <td colSpan={3} className="acidente-view-value">{formatDisplayDate(acidente.dataNascimento)}</td>
              <td className="acidente-view-label">Sexo</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.nomeSexo || (acidente.sexo === 'M' ? 'Masculino' : (acidente.sexo === 'F' ? 'Feminino' : '')))}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Estado Civil</td>
              <td colSpan={7} className="acidente-view-value">{renderValue(acidente.nomeEstadoCivil || acidente.estadoCivil)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">CTPS</td>
              <td className="acidente-view-value">{renderValue(acidente.ctps)}</td>
              <td className="acidente-view-label">Série</td>
              <td className="acidente-view-value">{renderValue(acidente.serie)}</td>
              <td className="acidente-view-label">Emissão</td>
              <td className="acidente-view-value">{formatDisplayDate(acidente.dataEmissaoCTPS)}</td>
              <td className="acidente-view-label">UF</td>
              <td className="acidente-view-value">{renderValue(acidente.nomeUFCTPS || acidente.ufCTPS)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">CPF</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.cpf)}</td>
              <td className="acidente-view-label">PIS/NIT</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.pisPasepNit)}</td>
            </tr>

            {/* ENDEREÇO */}
            <tr>
              <th colSpan={8} className="acidente-view-section-title">ENDEREÇO DO ACIDENTADO</th>
            </tr>
            <tr>
              <td className="acidente-view-label">Estado</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.nomeEstado || acidente.estado)}</td>
              <td className="acidente-view-label">Município</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.nomeMunicipio || acidente.municipio)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Rua</td>
              <td colSpan={7} className="acidente-view-value">{renderValue(acidente.rua)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Bairro</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.bairro)}</td>
              <td className="acidente-view-label">Número</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.numero)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Telefone</td>
              <td colSpan={7} className="acidente-view-value">{renderValue(acidente.ddd)} - {renderValue(acidente.telefone)}</td>
            </tr>

            {/* TESTEMUNHAS */}
            {testemunhas.length > 0 && (
              <>
                <tr>
                  <th colSpan={8} className="acidente-view-section-title">TESTEMUNHAS</th>
                </tr>
                {testemunhas.map((t, idx) => (
                  <React.Fragment key={idx}>
                    <tr>
                      <td colSpan={2} className="acidente-view-label acidente-view-row-highlight">Testemunha {idx + 1}</td>
                      <td colSpan={6} className="acidente-view-value acidente-view-row-highlight">{renderValue(t.nomeTestemunha)}</td>
                    </tr>
                    <tr>
                      <td className="acidente-view-label">Cidade</td>
                      <td colSpan={7} className="acidente-view-value">{renderValue(t.nomeMunicipio)} / {renderValue(t.nomeEstado)}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </>
            )}

            {/* ACIDENTE OU DOENÇA */}
            <tr>
              <th colSpan={8} className="acidente-view-section-title">ACIDENTE OU DOENÇA</th>
            </tr>
            <tr>
              <td className="acidente-view-label">Data</td>
              <td colSpan={3} className="acidente-view-value">{formatDisplayDate(acidente.dataAcidente)}</td>
              <td className="acidente-view-label">Hora</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.hora)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Tipo</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.nomeTipoAcidente || acidente.tipoAcidente)}</td>
              <td className="acidente-view-label">Local</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.nomeTipoLocalAcidente || acidente.tipoLocalAcidente)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Empresa Terceira</td>
              <td colSpan={7} className="acidente-view-value">{renderValue(acidente.documentoEmpresaTerceira)} - {renderValue(acidente.razaoSocialEmpresaterceira)}</td>
            </tr>

            {/* LOCAIS DA LESÃO */}
            {lesoes.length > 0 && (
              <>
                <tr>
                  <th colSpan={8} className="acidente-view-section-title">LOCAIS DA LESÃO SELECIONADOS</th>
                </tr>
                {lesoes.map((l, idx) => (
                  <tr key={idx}>
                    <td colSpan={2} className="acidente-view-label">Local {idx + 1}</td>
                    <td colSpan={6} className="acidente-view-value">{renderValue(l.nome)}</td>
                  </tr>
                ))}
              </>
            )}

            {/* ATESTADO MÉDICO */}
            <tr>
              <th colSpan={8} className="acidente-view-section-title">ATESTADO MÉDICO E FONTE</th>
            </tr>
            <tr>
              <td className="acidente-view-label">Diagnóstico</td>
              <td colSpan={7} className="acidente-view-value">{renderValue(acidente.nomeDiagnostico || acidente.diagnostico)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Médico</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.medicoNome)}</td>
              <td className="acidente-view-label">CRM</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.crm)} / {renderValue(acidente.ufCRM)}</td>
            </tr>
            <tr>
              <td className="acidente-view-label">Fonte</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.nomeFonte || acidente.fonte)}</td>
              <td className="acidente-view-label">Doc. Fonte</td>
              <td colSpan={3} className="acidente-view-value">{renderValue(acidente.numDocFonte)} ({formatDisplayDate(acidente.dataEmissaoFonte)})</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="acidente-view-actions">
        <button 
          onClick={handleBack} 
          className="btn-voltar-large"
        >
          VOLTAR
        </button>
      </div>
    </div>
  );
};

export default VisualizaAcidentePage;
