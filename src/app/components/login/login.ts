import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    
    // Rediriger si déjà connecté
    if (this.authService.isLoggedIn()) {
      console.log('Utilisateur déjà connecté, redirection');
      this.router.navigate(['/admin/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    console.log('📤 Tentative de connexion avec:', this.loginForm.value);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        console.log('📥 Réponse reçue:', res);
        
        // Sauvegarder les données
        this.authService.saveUser(res);
        
        // Vérifier immédiatement
        const token = localStorage.getItem('token');
        console.log('🔑 Token après sauvegarde:', token ? 'Présent' : 'Absent');
        
        this.isLoading = false;
        
        if (token) {
          console.log('✅ Connexion réussie, redirection...');
          if (res.role === 'admin' || res.user?.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.errorMessage = 'Erreur lors de la sauvegarde de la connexion';
        }
      },

      error: (err) => {
        console.error('❌ Erreur de connexion:', err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur de connexion';
      }
    });
  }
}