/**
 * VisualizaAcidente
 * Migrated from VisualizaAcidente.jsp
 * Supports viewing an existing accident or previewing data from localStorage during registration.
 */
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { acidenteService } from '../../services/acidente/AcidenteService';

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

  if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Carregando...</div>;
  
  if (message) return (
    <div className="container" style={{ marginTop: '50px' }}>
      <div className="alert alert-danger" style={{ color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '15px', borderRadius: '4px' }}>
        {message}
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button onClick={handleBack} className="btn-secondary" style={{ padding: '10px 25px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>VOLTAR</button>
      </div>
    </div>
  );

  if (!acidente) return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Acidente não encontrado.</div>;

  return (
    <div className="container" style={{ paddingBottom: '50px', maxWidth: '900px' }}>
      <h3 style={{ textAlign: 'center', backgroundColor: '#3367A3', color: 'white', padding: '15px', marginBottom: '0', borderRadius: '4px 4px 0 0' }}>
        {preview ? 'PRÉ-VISUALIZAÇÃO DO ACIDENTE' : `VISUALIZAÇÃO DO ACIDENTE Nº ${acidente.id}`}
      </h3>

      <div style={{ border: '1px solid #3367A3', padding: '2px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'Verdana, sans-serif' }}>
          <tbody>
            {/* INFORMAÇÕES GERAIS */}
            <tr>
              <th colSpan={8} style={{ backgroundColor: '#C0C0C0', textAlign: 'center', padding: '8px', border: '1px solid black' }}>INFORMAÇÕES GERAIS</th>
            </tr>
            <tr>
              <td style={{ width: '15%', fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Emitente</td>
              <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeEmitente || acidente.emitente)}</td>
            </tr>
            {acidente.razaoSocial && (
              <tr>
                <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Empregador</td>
                <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.documento)} - {renderValue(acidente.razaoSocial)}</td>
              </tr>
            )}

            {/* TRABALHADOR */}
            <tr>
              <th colSpan={8} style={{ backgroundColor: '#C0C0C0', textAlign: 'center', padding: '8px', border: '1px solid black' }}>TRABALHADOR</th>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Nome</td>
              <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nome)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Nascimento</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{formatDisplayDate(acidente.dataNascimento)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Sexo</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeSexo || (acidente.sexo === 'M' ? 'Masculino' : (acidente.sexo === 'F' ? 'Feminino' : '')))}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Estado Civil</td>
              <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeEstadoCivil || acidente.estadoCivil)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>CTPS</td>
              <td style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.ctps)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Série</td>
              <td style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.serie)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Emissão</td>
              <td style={{ padding: '8px', border: '1px solid black' }}>{formatDisplayDate(acidente.dataEmissaoCTPS)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>UF</td>
              <td style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeUFCTPS || acidente.ufCTPS)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>CPF</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.cpf)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>PIS/NIT</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.pisPasepNit)}</td>
            </tr>

            {/* ENDEREÇO */}
            <tr>
              <th colSpan={8} style={{ backgroundColor: '#C0C0C0', textAlign: 'center', padding: '8px', border: '1px solid black' }}>ENDEREÇO DO ACIDENTADO</th>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Estado</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeEstado || acidente.estado)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Município</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeMunicipio || acidente.municipio)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Rua</td>
              <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.rua)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Bairro</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.bairro)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Número</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.numero)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Telefone</td>
              <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.ddd)} - {renderValue(acidente.telefone)}</td>
            </tr>

            {/* TESTEMUNHAS */}
            {testemunhas.length > 0 && (
              <>
                <tr>
                  <th colSpan={8} style={{ backgroundColor: '#C0C0C0', textAlign: 'center', padding: '8px', border: '1px solid black' }}>TESTEMUNHAS</th>
                </tr>
                {testemunhas.map((t, idx) => (
                  <React.Fragment key={idx}>
                    <tr>
                      <td colSpan={2} style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black', backgroundColor: '#f9f9f9' }}>Testemunha {idx + 1}</td>
                      <td colSpan={6} style={{ padding: '8px', border: '1px solid black', backgroundColor: '#f9f9f9' }}>{renderValue(t.nomeTestemunha)}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Cidade</td>
                      <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(t.nomeMunicipio)} / {renderValue(t.nomeEstado)}</td>
                    </tr>
                  </React.Fragment>
                ))}
              </>
            )}

            {/* ACIDENTE OU DOENÇA */}
            <tr>
              <th colSpan={8} style={{ backgroundColor: '#C0C0C0', textAlign: 'center', padding: '8px', border: '1px solid black' }}>ACIDENTE OU DOENÇA</th>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Data</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{formatDisplayDate(acidente.dataAcidente)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Hora</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.hora)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Tipo</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeTipoAcidente || acidente.tipoAcidente)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Local</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeTipoLocalAcidente || acidente.tipoLocalAcidente)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Empresa Terceira</td>
              <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.documentoEmpresaTerceira)} - {renderValue(acidente.razaoSocialEmpresaterceira)}</td>
            </tr>

            {/* LOCAIS DA LESÃO */}
            {lesoes.length > 0 && (
              <>
                <tr>
                  <th colSpan={8} style={{ backgroundColor: '#C0C0C0', textAlign: 'center', padding: '8px', border: '1px solid black' }}>LOCAIS DA LESÃO SELECIONADOS</th>
                </tr>
                {lesoes.map((l, idx) => (
                  <tr key={idx}>
                    <td colSpan={2} style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Local {idx + 1}</td>
                    <td colSpan={6} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(l.nome)}</td>
                  </tr>
                ))}
              </>
            )}

            {/* ATESTADO MÉDICO */}
            <tr>
              <th colSpan={8} style={{ backgroundColor: '#C0C0C0', textAlign: 'center', padding: '8px', border: '1px solid black' }}>ATESTADO MÉDICO E FONTE</th>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Diagnóstico</td>
              <td colSpan={7} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeDiagnostico || acidente.diagnostico)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Médico</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.medicoNome)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>CRM</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.crm)} / {renderValue(acidente.ufCRM)}</td>
            </tr>
            <tr>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Fonte</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.nomeFonte || acidente.fonte)}</td>
              <td style={{ fontWeight: 'bold', padding: '8px', border: '1px solid black' }}>Doc. Fonte</td>
              <td colSpan={3} style={{ padding: '8px', border: '1px solid black' }}>{renderValue(acidente.numDocFonte)} ({formatDisplayDate(acidente.dataEmissaoFonte)})</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="form-actions" style={{ marginTop: '30px', textAlign: 'center' }}>
        <button 
          onClick={handleBack} 
          className="btn-secondary" 
          style={{ padding: '10px 30px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem' }}
        >
          VOLTAR
        </button>
      </div>
    </div>
  );
};

export default VisualizaAcidentePage;
