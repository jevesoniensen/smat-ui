import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MenuItem } from '../../../types/models';

interface MenuProps {
  items: MenuItem[];
  onItemClick?: () => void;
}

export const Menu: React.FC<MenuProps> = ({ items, onItemClick }) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    
    // Ensure path is relative to the origin and doesn't start with //
    let safePath = item.path || '#';
    if (safePath !== '#' && !safePath.startsWith('/')) {
      safePath = '/' + safePath;
    }
    // Remove potential double slashes at the beginning which browser interprets as protocol-relative
    if (safePath.startsWith('//')) {
      safePath = safePath.replace(/^\/+/, '/');
    }

    return (
      <li key={item.id} className="menu-item">
        {hasChildren ? (
          <div className={`menu-label ${openSubmenu === item.id ? 'open' : ''}`} onClick={() => toggleSubmenu(item.id)}>
            {item.label}
            <span className="arrow">{openSubmenu === item.id ? '▲' : '▼'}</span>
          </div>
        ) : (
          <NavLink 
            to={safePath} 
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={onItemClick}
          >
            {item.label}
          </NavLink>
        )}

        {hasChildren && openSubmenu === item.id && (
          <ul className="submenu">
            {item.children!.map((child) => renderMenuItem(child))}
          </ul>
        )}
      </li>
    );
  };


  return (
    <nav className="main-menu">
      <ul>
        {items.map((item) => renderMenuItem(item))}
      </ul>
    </nav>
  );
};

export default Menu;
