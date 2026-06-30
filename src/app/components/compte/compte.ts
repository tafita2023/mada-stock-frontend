import { Component, Inject, PLATFORM_ID, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth-service';
import { ProfileService } from '../services/profile';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-mon-compte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compte.html',
  styleUrls: ['./compte.css']
})
export class CompteComponent implements OnInit, OnDestroy {

  user: any = {
    name: '',
    email: '',
    avatar: '',
    role: ''
  };

  editUser: any = {};

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  passwordError = '';
  showPopup = false;

  // Notifications
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private authService: AuthService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.loadUserData();
  }

  ngOnDestroy(): void {
    // Nettoyer le timeout lors de la destruction du composant
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  loadUserData(): void {
    const connectedUser = this.authService.getUser();
    if (connectedUser) {
      this.user = connectedUser;
      this.editUser = { ...connectedUser };
    }
  }

  openPopup(): void {
    this.editUser = { ...this.user };
    this.showPopup = true;

    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.passwordError = '';

    if (this.isBrowser) {
      document.body.style.overflow = 'hidden';
    }
  }

  closePopup(): void {
    this.showPopup = false;

    if (this.isBrowser) {
      document.body.style.overflow = 'auto';
    }

    this.cdr.detectChanges();
  }

  closePopupOnOverlay(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closePopup();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showToast('Veuillez sélectionner une image valide', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('L\'image ne doit pas dépasser 5MB', 'error');
      return;
    }

    this.editUser.avatarFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.editUser.avatar = e.target.result;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  validatePassword(): boolean {
    const currentPass = this.passwordData.currentPassword;
    const newPass = this.passwordData.newPassword;
    const confirmPass = this.passwordData.confirmPassword;

    if (!newPass && !confirmPass && !currentPass) {
      return true;
    }

    if (!currentPass) {
      this.passwordError = 'Veuillez saisir votre mot de passe actuel';
      return false;
    }

    if (!newPass || !confirmPass) {
      this.passwordError = 'Veuillez remplir les deux champs du nouveau mot de passe';
      return false;
    }

    if (newPass.length < 8) {
      this.passwordError = 'Le mot de passe doit contenir au moins 8 caractères';
      return false;
    }

    if (newPass !== confirmPass) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      return false;
    }

    this.passwordError = '';
    return true;
  }

  saveChanges(): void {
    if (!this.isBrowser) return;

    if (!this.validatePassword()) return;

    const formData = new FormData();

    formData.append('name', this.editUser.name || '');
    formData.append('email', this.editUser.email || '');

    if (this.editUser.avatarFile) {
      formData.append('avatar', this.editUser.avatarFile);
    }

    if (this.passwordData.newPassword) {
      formData.append('current_password', this.passwordData.currentPassword);
      formData.append('password', this.passwordData.newPassword);
      formData.append('password_confirmation', this.passwordData.confirmPassword);
    }

    this.profileService.updateProfile(formData).subscribe({
      next: (res: any) => {
        console.log('Succès:', res);

        // Mettre à jour l'utilisateur
        const updatedUser = res.user || res;
        this.user = updatedUser;
        this.editUser = { ...updatedUser };

        // Sauvegarder dans localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Afficher le toast
        this.showToast('Profil mis à jour avec succès', 'success');

        // Fermer le popup APRÈS 2 secondes
        setTimeout(() => {
          this.closePopup();
        }, 2000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        const errorMessage = err.error?.message || 'Erreur lors de la modification';
        this.showToast(errorMessage, 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    if (!this.isBrowser) return;

    // Nettoyer l'ancien timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    this.cdr.detectChanges();

    // Fermer automatiquement après 4 secondes
    this.toastTimeout = setTimeout(() => {
      this.showNotification = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  getImageUrl(image?: string): string {
    const url = image
      ? `${environment.storageUrl}/${image}`
      : 'assets/nothing.png';

      console.log(url);

      return url;
  }

}