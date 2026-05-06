/**
 * Login Page
 * Replaces login.jsp
 */
import React, { useState } from 'react';
import { useAuth } from '../../auth/services/useAuth';
import '../css/home.css';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor, preencha usuário e senha.');
      return;
    }

    try {
      await login(username, password);
    } catch (err) {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        <div className="login-header">
          <img src="/assets/images/login/img_login.jpg" alt="SMAT Header" />
          <h2>Login - SMAT</h2>
        </div>

        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-login"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
