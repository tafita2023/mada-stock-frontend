import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common'; // 👈 IMPORTANT pour SSR

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  showErrorPopup = false;
  private valueChangesSubscription!: Subscription;
  private isBrowser: boolean; // 👈 Pour savoir si on est côté client

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object // 👈 Injection de PLATFORM_ID
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // 👈 Vérifier si on est dans le navigateur
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // ⚠️ En SSR, on ne fait les redirections que côté client
    if (this.isBrowser && this.authService.isLoggedIn()) {
      console.log('Utilisateur déjà connecté, redirection');
      this.router.navigate(['/admin/dashboard']);
    }

    // ⚠️ On n'écoute les changements que côté client
    // if (this.isBrowser) {
    //   this.valueChangesSubscription = this.loginForm.valueChanges.subscribe(() => {
    //     this.checkForErrors();
    //   });
    // }
  }

  private checkForErrors(): void {
    // Ne fonctionne que côté client
    if (!this.isBrowser) return;

    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');

    if (emailControl?.touched && emailControl?.invalid) {
      this.showErrorPopup = true;
      if (emailControl.errors?.['required']) {
        this.errorMessage = 'L\'email est requis';
      } else if (emailControl.errors?.['email']) {
        this.errorMessage = 'Email invalide';
      }
      this.cdr.detectChanges();
      return;
    }

    if (passwordControl?.touched && passwordControl?.invalid) {
      this.showErrorPopup = true;
      if (passwordControl.errors?.['required']) {
        this.errorMessage = 'Le mot de passe est requis';
      } else if (passwordControl.errors?.['minlength']) {
        this.errorMessage = 'Minimum 6 caractères';
      }
      this.cdr.detectChanges();
      return;
    }

    if (this.showErrorPopup) {
      this.showErrorPopup = false;
      this.errorMessage = '';
      this.cdr.detectChanges();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    // Marquer tous les champs comme touchés
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });

    this.checkForErrors();

    if (this.loginForm.invalid) {
      return;
    }

    // Démarrer le chargement
    this.isLoading = true;
    this.errorMessage = '';
    this.showErrorPopup = false;
    
    if (this.isBrowser) {
      this.cdr.detectChanges();
    }

    console.log('🔵 Tentative de connexion...');

    this.authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          console.log('🟢 finalize() exécuté - Arrêt du spinner');
          this.isLoading = false;
          
          // 👇 En SSR, on utilise setTimeout pour éviter les problèmes d'hydratation
          if (this.isBrowser) {
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
          }
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('✅ Connexion réussie', res);
          this.authService.saveUser(res);

          const token = localStorage.getItem('token');

          if (token) {
            if (res.role === 'admin' || res.user?.role === 'admin') {
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.router.navigate(['/']);
            }
          } else {
            this.errorMessage = 'Erreur lors de la sauvegarde de la connexion';
            this.showErrorPopup = true;
            if (this.isBrowser) {
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
            }
          }
        },

        error: (err) => {
          console.log('🔴 Erreur reçue:', err.status);
          console.log('🔴 Message:', err.error?.message || err.message);
          
          // 👇 SOLUTION SSR : Modifier les variables
          this.errorMessage = 'Email ou mot de passe incorrect.';
          this.showErrorPopup = true;
          
          // 👇 En SSR, on utilise setTimeout avec un délai plus long
          if (this.isBrowser) {
            // Premier tick pour mettre à jour immédiatement
            setTimeout(() => {
              this.cdr.detectChanges();
              console.log('🟡 Popup affiché (1er tick) :', this.showErrorPopup);
            }, 0);
            
            // Deuxième tick pour être sûr (SSR nécessite parfois 2 cycles)
            setTimeout(() => {
              this.cdr.detectChanges();
              console.log('🟡 Popup affiché (2ème tick) :', this.showErrorPopup);
            }, 50);
          }
        }
      });
  }

  closeErrorPopup(): void {
    this.showErrorPopup = false;
    this.errorMessage = '';
    if (this.isBrowser) {
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }
}