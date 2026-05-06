import React, { useState, useEffect } from 'react';
import { UsuarioService } from '../services/AdminService';
import { PessoasService } from '../../index';
import { Usuario, AgenteSaude } from '../../../types/models';
import '../css/administrador.css';

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [agentesSaude, setAgentesSaude] = useState<AgenteSaude[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Partial<Usuario>>({});
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [users, agentes] = await Promise.all([
        UsuarioService.listUsuarios(),
        PessoasService.listAgentesSaude(),
      ]);
      setUsuarios(users);
      setAgentesSaude(agentes);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
  };

  const handleClearForm = () => {
    setSelectedUsuario({});
    setPassword('');
    setPasswordConfirm('');
    setMessage('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setMessage('As senhas não conferem.');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...selectedUsuario, senha: password };
      if (selectedUsuario.id) {
          await UsuarioService.updateUsuario(selectedUsuario.id, payload);
      } else {
          await UsuarioService.createUsuario(payload as Usuario);
      }
      setMessage('Usuário salvo com sucesso!');
      handleClearForm();
      fetchData();
    } catch (error) {
      setMessage('Erro ao salvar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUsuario.id) return;
    setLoading(true);
    try {
      await UsuarioService.deleteUsuario(selectedUsuario.id);
      setMessage('Usuário excluído com sucesso!');
      handleClearForm();
      fetchData();
    } catch (error) {
      setMessage('Erro ao excluir usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Cadastro de Usuários</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Login</label>
          <input
            type="text"
            value={selectedUsuario.login || ''}
            onChange={(e) => setSelectedUsuario({ ...selectedUsuario, login: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!selectedUsuario.id}
          />
        </div>
        <div className="form-group">
          <label>Redigite a senha</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required={!selectedUsuario.id}
          />
        </div>
        <div className="form-group">
          <label>Agente de Saúde</label>
          <select
            value={selectedUsuario.agenteSaudeId || ''}
            onChange={(e) => setSelectedUsuario({ ...selectedUsuario, agenteSaudeId: e.target.value })}
          >
            <option value="">-- Selecione --</option>
            {agentesSaude.map((agente) => (
              <option key={agente.id} value={agente.id}>{agente.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Gravar'}</button>
          <button type="button" onClick={handleClearForm} disabled={loading}>Limpar</button>
          <button type="button" onClick={handleDelete} disabled={loading || !selectedUsuario.id}>Excluir</button>
        </div>
      </form>

      <br />

      <h4>Usuários Cadastrados</h4>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => (
            <tr key={user.id} onClick={() => handleSelectUsuario(user)} className="clickable-row">
              <td>{user.id}</td>
              <td>{user.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Usuarios;
