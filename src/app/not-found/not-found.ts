import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  styleUrls: ['./not-found.css']
})
export class NotFoundComponent {
  
  constructor(private location: Location) {}
  
  goBack(): void {
    this.location.back(); // Retour à la page précédente
    // Ou utilisez ceci pour retourner à l'accueil :
    // this.router.navigate(['/']);
  }
}
