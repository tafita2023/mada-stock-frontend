import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core'; // Ajouter ChangeDetectorRef
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../homeService/contact';

declare const grecaptcha: any;
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnDestroy {

  contactForm: FormGroup;
  submitted = false;
  showSuccessPopup = false;
  private popupTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private contactService: ContactService,
    private cdr: ChangeDetectorRef // Ajouter ceci
  ) {
    this.contactForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    this.submitted = true;
  
    if (this.contactForm.invalid) {
      return;
    }
  
  
    if (typeof grecaptcha === 'undefined') {
      console.error('reCAPTCHA non chargé');
      return;
    }
  
  
    grecaptcha.execute('6LeJhm0tAAAAABBfoiAC1DSv6UEskLfwrhs__b7W', {
      action: 'contact'
    })
    .then((token: string) => {
  
  
      const formData = new FormData();
  
      formData.append(
        'nom',
        this.contactForm.get('nom')?.value || ''
      );
  
      formData.append(
        'email',
        this.contactForm.get('email')?.value || ''
      );
  
      formData.append(
        'message',
        this.contactForm.get('message')?.value || ''
      );
  
  
      // Ajouter le token captcha
      formData.append(
        'captcha',
        token
      );
  
  
      this.contactService.sendMessage(formData).subscribe({
  
        next: (response) => {
  
          console.log('Message envoyé:', response);
  
  
          this.showSuccessPopup = true;
  
          this.cdr.detectChanges();
  
  
          if (this.popupTimeout) {
            clearTimeout(this.popupTimeout);
          }
  
  
          this.popupTimeout = setTimeout(() => {
  
            this.showSuccessPopup = false;
  
            this.cdr.detectChanges();
  
            this.popupTimeout = null;
  
          }, 4000);
  
  
          this.contactForm.reset();
  
          this.submitted = false;
  
        },
  
  
        error: (error) => {
  
          console.error(
            'Erreur lors de l\'envoi:',
            error
          );
  
        }
  
      });
  
  
    });
  
  }

  closePopup(): void {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
      this.popupTimeout = null;
    }
    this.showSuccessPopup = false;
    this.cdr.detectChanges();
    console.log('Popup fermé manuellement');
  }

  ngOnDestroy(): void {
    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
      this.popupTimeout = null;
    }
  }

  get f() {
    return this.contactForm.controls;
  }
}