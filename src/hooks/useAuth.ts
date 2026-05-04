/**
 * Custom hook for handling authentication
 * Migrated from Struts permission checking logic
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { authService } from '../smat/home/services/AuthService';

export const useAuth = () => {
  const navigate = useNavigate();
  const { session, setUsuario, setMenu, clearSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      // If we already have a user in session, we are good
      if (session.usuario) {
        setIsLoading(false);
        return;
      }

      // Otherwise, try to validate with backend (e.g. check cookie/token)
      setIsLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();

        if (currentUser) {
          setUsuario(currentUser);
          // Fetch menu if not present
          if (!session.menu) {
             const menu = await authService.getUserMenu();
             setMenu(menu);
          }
        } else {
          // No user found, redirect to login
          // We don't redirect here to allow public pages, but protected routes will redirect
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [session.usuario, session.menu, setUsuario, setMenu]);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(username, password);
      if (response && response.usuario) {
        setUsuario(response.usuario);
        // Assuming login response might return menu or we fetch it separately
        if (response.menu) {
            setMenu(response.menu);
        } else {
            const menu = await authService.getUserMenu();
            setMenu(menu);
        }
        navigate('/welcome');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, setUsuario, setMenu]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
      navigate('/login');
    }
  }, [navigate, clearSession]);

  return {
    isAuthenticated: !!session.usuario,
    isLoading,
    user: session.usuario,
    menu: session.menu,
    login,
    logout,
  };
};
