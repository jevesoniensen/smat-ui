import { Component, signal, inject, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../services/AuthService';

/**
 * Login Header Component
 */
@Component({
  selector: 'app-login-header',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './LoginHeaderComponent.html'
})
export class LoginHeaderComponent {}

/**
 * Login Form Component
 */
@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './LoginFormComponent.html'
})
export class LoginFormComponent implements OnInit {
  @Input() isLoading = false;
  @Input() error = '';
  
  @Output() login = new EventEmitter<{ username: string; password: string }>();

  private fb = inject(FormBuilder);
  loginForm!: FormGroup;

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  handleSubmit() {
    if (this.loginForm.valid) {
      this.login.emit(this.loginForm.value);
    } else {
      Object.values(this.loginForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}

/**
 * Main Login Page Component
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginHeaderComponent, LoginFormComponent, MatCardModule],
  templateUrl: './LoginComponent.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  error = signal('');
  isLoading = signal(false);

  async handleLogin(credentials: { username: string; password: string }) {
    const { username, password } = credentials;
    
    if (!username || !password) {
      this.error.set('Por favor, preencha usuário e senha.');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    try {
      await this.authService.login(username, password);
      this.router.navigate(['/welcome']);
    } catch (err: any) {
      this.error.set(err.message || 'Usuário ou senha inválidos.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
