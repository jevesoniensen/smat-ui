/**
 * Access Denied Page
 */
import React from 'react';
export const AccessDenied: React.FC = () => {
  return (
    <div className="access-denied-container">
      <h1>Acesso Negado</h1>
      <p>Você não tem permissão para acessar este recurso.</p>
    </div>
  );
};
export default AccessDenied;
