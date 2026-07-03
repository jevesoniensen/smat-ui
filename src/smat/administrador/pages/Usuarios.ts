import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../services/AdminService';
import { PessoasService } from '../../pessoas/services/PessoasService';
import { Usuario, AgenteSaude } from '../../../types/models';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './Usuarios.html',
  styleUrls: ['../../fiscalizacao/css/fiscalizacao.css', '../css/administrador.css']
})
export class UsuariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private pessoasService = inject(PessoasService);
  private snackBar = inject(MatSnackBar);

  usuarioForm!: FormGroup;
  loading = signal(false);
  selectedId = signal<string | number | null>(null);

  usuarios = signal<Usuario[]>([]);
  agentesSaude = signal<AgenteSaude[]>([]);

  ngOnInit() {
    this.initForm();
    this.fetchData();
  }

  initForm() {
    this.usuarioForm = this.fb.group({
      login: ['', [Validators.required]],
      senha: [''],
      senhaConfirm: [''],
      agenteSaudeId: ['']
    });
  }

  async fetchData() {
    this.loading.set(true);
    try {
      const [users, agentes] = await Promise.all([
        this.adminService.listUsuarios(),
        this.pessoasService.listAgentesSaude(),
      ]);
      this.usuarios.set(users || []);
      this.agentesSaude.set(agentes || []);
    } catch (error) {
      this.snackBar.open('Erro ao carregar dados.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  handleSelect(user: Usuario) {
    this.selectedId.set(user.id);
    this.usuarioForm.patchValue({
      login: user.login,
      agenteSaudeId: (user as any).agenteSaudeId || '',
      senha: '',
      senhaConfirm: ''
    });
  }

  handleClear() {
    this.selectedId.set(null);
    this.usuarioForm.reset({
      login: '',
      senha: '',
      senhaConfirm: '',
      agenteSaudeId: ''
    });
  }

  async handleSave() {
    const val = this.usuarioForm.value;
    if (this.usuarioForm.invalid) return;
    if (val.senha !== val.senhaConfirm) {
      this.snackBar.open('As senhas não conferem.', 'Fechar', { duration: 3000 });
      return;
    }

    this.loading.set(true);
    try {
      const payload: any = { ...val };
      delete payload.senhaConfirm;
      
      const sid = this.selectedId();
      if (sid) {
        await this.adminService.updateUsuario(sid, payload);
        this.snackBar.open('Usuário atualizado com sucesso!', 'Fechar', { duration: 3000 });
      } else {
        await this.adminService.createUsuario(payload);
        this.snackBar.open('Usuário criado com sucesso!', 'Fechar', { duration: 3000 });
      }
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao salvar usuário.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }

  async handleDelete() {
    const sid = this.selectedId();
    if (!sid) return;
    this.loading.set(true);
    try {
      await this.adminService.deleteUsuario(sid);
      this.snackBar.open('Usuário excluído com sucesso!', 'Fechar', { duration: 3000 });
      this.handleClear();
      this.fetchData();
    } catch (error) {
      this.snackBar.open('Erro ao excluir usuário.', 'Fechar', { duration: 5000 });
    } finally {
      this.loading.set(false);
    }
  }
}
