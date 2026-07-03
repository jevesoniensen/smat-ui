import { Injectable, signal } from '@angular/core';
import { Usuario, Pagina, ObjAcidente, MenuItem } from '../../../types/models';

interface SessionData {
  usuario: Usuario | null;
  objAcidente: ObjAcidente | null;
  permissaoPagina: Pagina | null;
  menu: MenuItem[] | null;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionState = signal<SessionData>({
    usuario: null,
    objAcidente: null,
    permissaoPagina: null,
    menu: null,
  });

  // Selectors
  readonly session = this.sessionState.asReadonly();
  readonly usuario = () => this.sessionState().usuario;
  readonly menu = () => this.sessionState().menu;
  readonly objAcidente = () => this.sessionState().objAcidente;

  setUsuario(usuario: Usuario | null) {
    this.sessionState.update(prev => ({ ...prev, usuario }));
  }

  setMenu(menu: MenuItem[] | null) {
    this.sessionState.update(prev => ({ ...prev, menu }));
  }

  setObjAcidente(objAcidente: ObjAcidente | null) {
    this.sessionState.update(prev => ({ ...prev, objAcidente }));
  }

  setPermissaoPagina(pagina: Pagina | null) {
    this.sessionState.update(prev => ({ ...prev, permissaoPagina: pagina }));
  }

  setSessionAttribute(key: string, value: any) {
    this.sessionState.update(prev => ({ ...prev, [key]: value }));
  }

  removeSessionAttribute(key: string) {
    this.sessionState.update(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
    });
  }

  clearSession() {
    this.sessionState.set({
      usuario: null,
      objAcidente: null,
      permissaoPagina: null,
      menu: null,
    });
  }
}
