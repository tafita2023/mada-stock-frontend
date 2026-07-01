import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../homeService/cart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  saveurs: string[] = [
    'Classic',
    'Mentholé',
    'Fruité',
    'Boisson',
    'Gourmand'
  ];

  types: string[] = [
    'Kit',
    'Pod',
    'Tube',
    'Mod',
    'Puff'
  ];

  isMobileMenuOpen = false;
  isProductSubmenuOpen = false;
  isMaterielSubmenuOpen = false;

  cartCount = 0;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce(
        (total, item) => total + item.quantity,
        0
      );
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (!this.isMobileMenuOpen) {
      this.isProductSubmenuOpen = false;
      this.isMaterielSubmenuOpen = false;
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.isProductSubmenuOpen = false;
    this.isMaterielSubmenuOpen = false;
  }
  
  closeAllMenus(): void {
    this.isMobileMenuOpen = false;
  
    this.isProductSubmenuOpen = false;
    this.isMaterielSubmenuOpen = false;
  }

  toggleProductSubmenu() {
    this.isProductSubmenuOpen = !this.isProductSubmenuOpen;
    if (this.isProductSubmenuOpen) {
      this.isMaterielSubmenuOpen = false;
    }
  }
  
  toggleMaterielSubmenu() {
    this.isMaterielSubmenuOpen = !this.isMaterielSubmenuOpen;
    if (this.isMaterielSubmenuOpen) {
      this.isProductSubmenuOpen = false;
    }
  }

  filtrerParSaveur(saveur: string): void {
    this.closeAllMenus();

    this.router.navigate(['/produits'], {
      queryParams: { saveur }
    });
  
    this.closeMobileMenu();
  }

  filtrerParType(type: string): void {
    this.closeAllMenus();

    this.router.navigate(['/materiels'], {
      queryParams: { type }
    });
  
    this.closeMobileMenu();
  }

  goToProduits(): void {
    this.closeAllMenus();

    this.router.navigate(['/produits']);
  }

  goToMateriels(): void {
    this.closeAllMenus();

    this.router.navigate(['/materiels']);
  }

}