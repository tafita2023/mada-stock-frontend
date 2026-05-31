import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  currentYear = new Date().getFullYear();
  
  socialLinks = [
    { name: 'Facebook', icon: 'fab fa-facebook-f', url: 'https://facebook.com', color: '#1877f2' },
    { name: 'Instagram', icon: 'fab fa-instagram', url: 'https://instagram.com', color: '#e4405f' },
    { name: 'Twitter', icon: 'fab fa-twitter', url: 'https://twitter.com', color: '#1da1f2' },
    { name: 'WhatsApp', icon: 'fab fa-whatsapp', url: 'https://whatsapp.com', color: '#25d366' }
  ];
    
  legalLinks = [
    { name: 'Mentions légales', path: '/mentions-legales' },
    { name: 'Conditions générales', path: '/cgv' },
    { name: 'Politique de confidentialité', path: '/confidentialite' }
  ];
  
  newsletterEmail: string = '';
  
}
