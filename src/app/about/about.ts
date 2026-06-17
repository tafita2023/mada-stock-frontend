import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  aboutData = {
    description: `
      Notre engagement envers la qualité et la sécurité est inébranlable. 
      Nous utilisons exclusivement des composants de grade USP, 
      vérifiés et approuvés, pour garantir votre bien-être. 
      Chez Mada-Stock, nous comprenons l’importance de la confiance et du sérieux dans le choix de vos e-liquides.
    `,
  };
}
