import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../services/AdminService';
import { Usuario, Grupo, UsuarioGrupo } from '../../../types/models';

@Component({
  selector: 'app-admin-grupos',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './Grupos.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/administrador.css']
})
export class GruposComponent implements OnInit {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  usuarios = signal<Usuario[]>([]);
  grupos = signal<Grupo[]>([]);
  assignments = signal<UsuarioGrupo[]>([]);
  
  selectedUserId = '';
  selectedGroupId = '';
  loading = signal(false);

  ngOnInit() {
    this.fetchData();
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const [users, groupsData, userGroups] = await Promise.all([
        this.adminService.listUsuarios(),
        this.adminService.listGrupos(),
        this.adminService.getAllUsuarioGrupos(),
      ]);
      this.usuarios.set(users || []);
      this.grupos.set(groupsData || []);
      this.assignments.set(userGroups || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleAssign() {
    if (!this.selectedUserId || !this.selectedGroupId) {
      this.snackBar.open('Por favor, selecione um usuário e um grupo.', 'Fechar', { duration: 3000 });
      return;
    }
    this.loading.set(true);
    try {
      await this.adminService.addToGroup(this.selectedUserId, this.selectedGroupId);
      this.snackBar.open('Usuário associado ao grupo com sucesso!', 'Fechar', { duration: 3000 });
      this.selectedUserId = '';
      this.selectedGroupId = '';
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao associar usuário ao grupo.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleRemove(assign: UsuarioGrupo) {
    this.loading.set(true);
    try {
      const uid = (assign as any).usuarioId || (assign.usuario as any)?.id;
      const gid = (assign as any).grupoId || (assign.grupo as any)?.id;
      await this.adminService.removeFromGroup(uid, gid);
      this.snackBar.open('Associação removida com sucesso!', 'Fechar', { duration: 3000 });
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao remover associação.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}
