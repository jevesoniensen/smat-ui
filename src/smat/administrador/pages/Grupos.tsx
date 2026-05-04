import React, { useState, useEffect } from 'react';
import { UsuarioService, GrupoService } from '../services/AdminService';
import { Usuario, Grupo, UsuarioGrupo } from '../../../types/models';

const Grupos: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [assignments, setAssignments] = useState<UsuarioGrupo[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // We need a way to list ALL assignments.
      // Assuming UsuarioService.getAllUsuarioGrupos() exists as per previous step.
      // If it returns Promise<UsuarioGrupo[]>.
      const [users, groupsData, userGroups] = await Promise.all([
        UsuarioService.listUsuarios(),
        GrupoService.listGrupos(),
        UsuarioService.getAllUsuarioGrupos(),
      ]);
      setUsuarios(users);
      setGrupos(groupsData);
      setAssignments(userGroups);
    } catch (error) {
      setMessage('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedGroupId) {
      setMessage('Por favor, selecione um usuário e um grupo.');
      return;
    }
    setLoading(true);
    try {
      await UsuarioService.addToGroup(selectedUserId, selectedGroupId);
      setMessage('Usuário associado ao grupo com sucesso!');
      fetchData(); // Refresh the list
    } catch (error) {
      setMessage('Erro ao associar usuário ao grupo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string, groupId: string) => {
    setLoading(true);
    try {
      await UsuarioService.removeFromGroup(userId, groupId);
      setMessage('Associação removida com sucesso!');
      fetchData(); // Refresh the list
    } catch (error) {
      setMessage('Erro ao remover associação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h3>Usuários e Grupos</h3>
      {message && <div className="alert">{message}</div>}

      <form onSubmit={handleAssign}>
        <div className="form-group">
          <label>Usuário</label>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
            <option value="">-- Selecione um Usuário --</option>
            {usuarios.map((user) => (
              <option key={user.id} value={user.id}>{user.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Grupo</label>
          <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} required>
            <option value="">-- Selecione um Grupo --</option>
            {grupos.map((group) => (
              <option key={group.id} value={group.id}>{group.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>{loading ? 'Associando...' : 'Associar'}</button>
        </div>
      </form>

      <br />

      <h4>Associações Atuais</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Grupo</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assign) => (
            <tr key={`${assign.usuario.id}-${assign.grupo.id}`}>
              <td>{assign.usuario.nome}</td>
              <td>{assign.grupo.nome}</td>
              <td>
                <button onClick={() => handleRemove(assign.usuario.id, assign.grupo.id)} disabled={loading}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grupos;
