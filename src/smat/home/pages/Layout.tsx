import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from './Menu';
import { useAuth } from '../../auth/services/useAuth';

export const Layout: React.FC = () => {
  const { user, menu, logout } = useAuth(); // Assuming useAuth provides user and menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return null; // Or redirect to login
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle Menu">
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        <div className="logo">
          <img src="/assets/images/index/img_header.jpg" alt="SMAT Header" />
        </div>
        <div className="user-info">
          <span>Bem-vindo, {user.nome}</span>
          <button onClick={logout} className="logout-btn">Sair</button>
        </div>
      </header>

      <div className="main-content-wrapper">
        <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {menu && <Menu items={menu} onItemClick={() => setIsMobileMenuOpen(false)} />}
        </aside>

        <main className="content-area">
          <Outlet /> {/* Renders the current route's component */}
        </main>
      </div>

      <footer className="app-footer">
        <p>&copy; SMAT - Sistema de Monitoramento de Acidentes de Trabalho</p>
      </footer>
    </div>
  );
};

export default Layout;
