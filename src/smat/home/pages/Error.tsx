import React from 'react';
import '../css/home.css';

const ErrorPage: React.FC = () => {
  return (
    <div className="error-container text-center mt-100">
      <h3>Houve um erro com o banco de dados! Por favor, tente mais tarde!</h3>
      <p>Se o problema persistir, entre em contato com o suporte.</p>
    </div>
  );
};

export default ErrorPage;
