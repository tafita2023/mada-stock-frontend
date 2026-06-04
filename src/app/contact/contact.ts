import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  contactForm: FormGroup;
  submitted = false;
  success = false;

  constructor(private formBuilder: FormBuilder) {
    this.contactForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    this.submitted = true;
    
    if (this.contactForm.valid) {
      // Ici vous pouvez ajouter la logique d'envoi du formulaire
      console.log('Formulaire soumis:', this.contactForm.value);
      this.success = true;
      
      // Réinitialiser le formulaire après 3 secondes
      setTimeout(() => {
        this.success = false;
        this.submitted = false;
        this.contactForm.reset();
      }, 3000);
    }
  }

  get f() { 
    return this.contactForm.controls; 
  }
}
