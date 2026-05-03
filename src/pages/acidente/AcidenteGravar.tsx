/**
 * AcidenteGravar
 * Migrated from AcidenteGravar.jsp and associated Struts logic.
 * Final step in the accident registration process.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { acidenteService } from '../../services/acidente/AcidenteService';

const STORAGE_KEY = 'objAcidente';
const LESOES_STORAGE_KEY = 'vLocalLesaoAcidente';
const TESTEMUNHAS_STORAGE_KEY = 'vTestemunhas';

export const AcidenteGravar: React.FC = () => {
  const navigate = useNavigate();
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    setHasData(!!data);
  }, []);

  const handleVoltar = () => {
    navigate('/acidentepassoquatro');
  };

  const handleVisualizar = () => {
    // Navigate to VisualizaAcidente. 
    // Passing preview flag so it knows to look at localStorage instead of API
    navigate('/visualizaacidente', { state: { preview: true } });
  };

  const combineDateTime = (dateStr: string, timeStr: string): string | null => {
    if (!dateStr || dateStr.length !== 10) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    
    let hour = '00';
    let min = '00';
    if (timeStr && timeStr.includes(':')) {
      const tParts = timeStr.split(':');
      hour = tParts[0];
      min = tParts[1];
    } else if (timeStr && timeStr.length === 4) {
       hour = timeStr.substring(0, 2);
       min = timeStr.substring(2, 4);
    }
    
    // Format as yyyy-MM-ddTHH:mm:ss for backend LocalDateTime
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${min.padStart(2, '0')}:00`;
  };

  const handleGravar = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const vLocalLesaoAcidente = JSON.parse(localStorage.getItem(LESOES_STORAGE_KEY) || '[]');
      const vTestemunhas = JSON.parse(localStorage.getItem(TESTEMUNHAS_STORAGE_KEY) || '[]');

      // Map form fields to backend schema
      const payload: any = {
        // IDs from Step 1
        emitente: Number(rawData.emitente || 0),
        empregador: Number(rawData.empregadorId || 0),
        area: Number(rawData.area || 0),
        vinculoEmpregaticio: Number(rawData.vinculoEmpregaticio || 0),
        ocupacao: Number(rawData.ocupacao || 0),
        
        // Data from Step 2
        dataAcidente: combineDateTime(rawData.dataAcidente, rawData.hora),
        horasTrabalhadas: Number(rawData.horasTrabalhadas || 0),
        tipoAcidente: Number(rawData.tipoAcidente || 0),
        tipoLocalAcidente: Number(rawData.tipoLocalAcidente || 0),
        municipio: Number(rawData.municipioAcidente || rawData.municipio || 0),
        ultimaTrabalhado: combineDateTime(rawData.dataUltimodiaTrab, '00:00'),
        distritoSaude: rawData.distritoSaude || '',
        descLocalAcidente: rawData.descricaoLocal || '',
        empregadorTerceiro: Number(rawData.documentoEmpresaTerceiraId || 0),
        agenteCausador: Number(rawData.agenteCausador || 0),
        descricaoSituacaoGeradora: rawData.descricaoSituacaoGeradora || '',
        registroPolicial: rawData.registroPolicial || '',
        obito: rawData.obito || '',
        amputacao: rawData.amputacao || '',
        
        // Data from Step 4
        dataHoraDiagnostico: combineDateTime(rawData.dataAtestado, rawData.horaAtestado),
        localAtendimento: Number(rawData.localAtendimento || 0),
        internacao: rawData.internacao || '',
        afastamento: rawData.afastamento || '',
        duracaoTratamento: Number(rawData.duracaoTratamento || 0),
        naturezaLesao: rawData.descNaturezaLesao || '',
        diagnostico: Number(rawData.diagnostico || 0),
        descricaoDiagnostico: rawData.descricaoDiagnostico || '',
        observacaoDiagnostico: rawData.observacoes || '',
        fonte: Number(rawData.fonte || 0),
        numDocFonte: rawData.numDocFonte || '',
        dataEmissaoFonte: combineDateTime(rawData.dataEmissaoFonte, '00:00'),
        
        // Additional mappings
        aposentado: rawData.aposentado || '',
        remuneracao: Number(rawData.remuneracaoMensal || 0),
        trabalhador: 0, // Backend expects an ID or will handle new worker
        
        // Nested collections (if supported by backend)
        locaisLesao: vLocalLesaoAcidente.map((l: any) => ({ id: l.id })),
        testemunhas: vTestemunhas.map((t: any) => ({
           nome: t.nomeTestemunha,
           municipio: Number(t.municipioTestemunha || 0),
           rua: t.ruaTestemunha,
           bairro: t.bairroTestemunha,
           numero: t.numeroTestemunha,
           complemento: t.complementoTestemunha,
           cep: t.cepTestemunha,
           ddd: t.dddTestemunha,
           telefone: t.telefoneTestemunha
        }))
      };

      await acidenteService.createAcidente(payload);
      
      // Success: Clear registration data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LESOES_STORAGE_KEY);
      localStorage.removeItem(TESTEMUNHAS_STORAGE_KEY);
      
      setSuccess(true);
      setHasData(false);
    } catch (err: any) {
      console.error('Error saving accident:', err);
      setError(`Erro ao gravar o acidente: ${err.message || 'Verifique os dados informados.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LESOES_STORAGE_KEY);
    localStorage.removeItem(TESTEMUNHAS_STORAGE_KEY);
    navigate('/acidentepassoum');
  };

  return (
    <div className="container" style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Gravar Acidente</h2>

      {error && (
        <div className="alert alert-danger" style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          padding: '15px', 
          borderRadius: '4px', 
          width: '100%', 
          maxWidth: '600px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success" style={{ 
          color: '#155724', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          padding: '15px', 
          borderRadius: '4px', 
          width: '100%', 
          maxWidth: '600px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong>Acidente gravado com sucesso!</strong>
        </div>
      )}

      {hasData ? (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
          <div className="warning-box" style={{ 
            backgroundColor: '#fffbe6', 
            border: '1px solid #ffe58f', 
            padding: '30px', 
            marginBottom: '30px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ color: '#856404', margin: '0 0 15px 0', fontSize: '1.5rem' }}>ATENÇÃO !!!</h3>
            <p style={{ fontSize: '1.1rem', margin: 0, lineHeight: '1.5' }}>
              Após clicar no botão <strong>"GRAVAR"</strong> não será mais possível alterar o acidente.
            </p>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={handleVoltar} 
              className="btn-secondary" 
              style={{ 
                padding: '10px 25px', 
                cursor: 'pointer',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
              disabled={loading}
            >
              VOLTAR
            </button>
            <button 
              type="button" 
              onClick={handleVisualizar} 
              className="btn-info" 
              style={{ 
                padding: '10px 25px', 
                cursor: 'pointer', 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
              disabled={loading}
            >
              VISUALIZAR ACIDENTE
            </button>
            <button 
              type="button" 
              onClick={handleGravar} 
              className="btn-primary" 
              style={{ 
                padding: '10px 25px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
              disabled={loading}
            >
              {loading ? 'GRAVANDO...' : 'GRAVAR'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          {!success && (
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Nenhum dado de acidente encontrado para gravação.
            </p>
          )}
          <button 
            type="button" 
            onClick={handleNovo} 
            className="btn-primary" 
            style={{ 
              padding: '12px 30px', 
              cursor: 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            {success ? 'CADASTRAR OUTRO ACIDENTE' : 'CADASTRAR NOVO ACIDENTE'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AcidenteGravar;
