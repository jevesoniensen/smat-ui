/**
 * React Context for managing session state
 * Migrated from Struts session management
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Usuario, Pagina, ObjAcidente, MenuItem } from '../types/models';

interface SessionData {
  usuario: Usuario | null;
  objAcidente: ObjAcidente | null;
  permissaoPagina: Pagina | null;
  menu: MenuItem[] | null;
  [key: string]: any;
}

interface SessionContextType {
  session: SessionData;
  setUsuario: (usuario: Usuario | null) => void;
  setMenu: (menu: MenuItem[] | null) => void;
  setObjAcidente: (acidente: ObjAcidente | null) => void;
  setPermissaoPagina: (pagina: Pagina | null) => void;
  removeSessionAttribute: (key: string) => void;
  setSessionAttribute: (key: string, value: any) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSessionState] = useState<SessionData>({
    usuario: null,
    objAcidente: null,
    permissaoPagina: null,
    menu: null,
  });

  const setUsuario = useCallback((usuario: Usuario | null) => {
    setSessionState((prev) => ({ ...prev, usuario }));
  }, []);

  const setMenu = useCallback((menu: MenuItem[] | null) => {
    setSessionState((prev) => ({ ...prev, menu }));
  }, []);

  const setObjAcidente = useCallback((objAcidente: ObjAcidente | null) => {
    setSessionState((prev) => ({ ...prev, objAcidente }));
  }, []);

  const setPermissaoPagina = useCallback((pagina: Pagina | null) => {
    setSessionState((prev) => ({ ...prev, permissaoPagina: pagina }));
  }, []);

  const removeSessionAttribute = useCallback((key: string) => {
    setSessionState((prev) => {
      const newSession = { ...prev };
      delete (newSession as any)[key];
      return newSession;
    });
  }, []);

  const setSessionAttribute = useCallback((key: string, value: any) => {
    setSessionState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearSession = useCallback(() => {
    setSessionState({
      usuario: null,
      objAcidente: null,
      permissaoPagina: null,
      menu: null,
    });
  }, []);

  const value = useMemo<SessionContextType>(() => ({
    session,
    setUsuario,
    setMenu,
    setObjAcidente,
    setPermissaoPagina,
    removeSessionAttribute,
    setSessionAttribute,
    clearSession,
  }), [session, setUsuario, setMenu, setObjAcidente, setPermissaoPagina, removeSessionAttribute, setSessionAttribute, clearSession]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
