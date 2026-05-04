import React from 'react';

const ErrorPage: React.FC = () => {
  return (
    <div className="error-container" style={{ textAlign: 'center', marginTop: '100px' }}>
      <h3>Houve um erro com o banco de dados! Por favor, tente mais tarde!</h3>
      <p>Se o problema persistir, entre em contato com o suporte.</p>
    </div>
  );
};

export default ErrorPage;
