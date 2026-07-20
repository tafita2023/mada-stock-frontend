import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../homeService/cart';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit, OnDestroy {

  saveurs = [
    { id: 1, name: 'Classic' },
    { id: 2, name: 'Mentholé' },
    { id: 3, name: 'Fruité' },
    { id: 4, name: 'Boisson' },
    { id: 5, name: 'Gourmand' },
    { id: 6, name: 'Boosters/Additifs' }
  ];

  types = [
    { id: 1, name: 'Kit' },
    { id: 2, name: 'Pod' },
    { id: 3, name: 'Box' },
    { id: 4, name: 'Clearomiseurs/Atomiseurs' },
    { id: 5, name: 'Consomables' }
  ];

  diys = [
    { name: 'Bases', route:'diy/bases' },
    { name: 'Arômes concentré', route:'diy/aromes' },
    { name: 'Booster/Additifs', route:'diy/boosters_additifs' },
    { name: 'Packs', route:'diy/packs' },
    { name: 'Divers', route:'diy/divers' },
  ];

  isMobileMenuOpen = false;
  isProductSubmenuOpen = false;
  isMaterielSubmenuOpen = false;
  isDiySubmenuOpen = false;

  cartCount = 0;

  private cartSub = new Subscription();


  constructor(
    private cartService: CartService,
    private router: Router
  ) {}


  ngOnInit(): void {

    this.cartSub.add(
      this.cartService.cart$.subscribe(items => {

        this.cartCount = items.reduce(
          (total, item) => total + item.quantity,
          0
        );

      })
    );

  }

  ngOnDestroy(): void {
    this.cartSub.unsubscribe();
  }

  toggleMobileMenu(): void {

    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (!this.isMobileMenuOpen) {
      this.isProductSubmenuOpen = false;
      this.isMaterielSubmenuOpen = false;
      this.isDiySubmenuOpen = false;

    }

  }

  closeAllMenus(): void {

    this.isMobileMenuOpen = false;
    this.isProductSubmenuOpen = false;
    this.isMaterielSubmenuOpen = false;
    this.isDiySubmenuOpen = false;

    document.body.style.overflow = ''
  }

  toggleProductSubmenu(): void {

    this.isProductSubmenuOpen = !this.isProductSubmenuOpen;

    if (this.isProductSubmenuOpen) {
      this.isMaterielSubmenuOpen = false;
      this.isDiySubmenuOpen = false;
    }

  }

  toggleMaterielSubmenu(): void {

    this.isMaterielSubmenuOpen = !this.isMaterielSubmenuOpen;

    if (this.isMaterielSubmenuOpen) {
      this.isProductSubmenuOpen = false;
      this.isDiySubmenuOpen = false;
    }

  }

  toggleDiySubmenu(): void {

    this.isDiySubmenuOpen = !this.isDiySubmenuOpen;

    if (this.isDiySubmenuOpen) {
      this.isProductSubmenuOpen = false;
      this.isMaterielSubmenuOpen = false;
    }

  }

  filtrerParSaveur(saveur: {id:number, name:string}): void {

    console.log('saveur cliquée:', saveur);

    this.closeAllMenus();

    if (saveur.id === 6) {
      this.router.navigate(['/diy/boosters_additifs']);
      return;
    }
    
    this.router.navigate(['/produits'], {
      queryParams: {
        saveur: saveur.id
      }
    });

  }

  filtrerParType(type: {id:number, name:string}): void {

    console.log('type cliqué:', type.id);

    this.closeAllMenus();

    this.router.navigate(['/materiels'], {
      queryParams: {
        type: type.id
      }
    });

  }

  goToProduits(): void {

    this.router.navigate(['/produits'], {
      queryParams: {}
    })
    .then(() => {
      this.closeAllMenus();
    });

  }

  goToMateriels(): void {

    this.router.navigate(['/materiels'], {
      queryParams: {}
    })
    .then(() => {
      this.closeAllMenus();
    });

  }
}