import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../homeService/cart';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  isMobileMenuOpen = false;
  isProductSubmenuOpen = false;
  isMaterielSubmenuOpen = false;

  cartCount = 0;

  constructor(private cartService: CartService) {}

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
  
  toggleProductSubmenu() {
    this.isProductSubmenuOpen = !this.isProductSubmenuOpen;
    // Bonus : fermer l'autre menu quand on ouvre celui-ci
    if (this.isProductSubmenuOpen) {
      this.isMaterielSubmenuOpen = false;
    }
    console.log('Product submenu:', this.isProductSubmenuOpen); // Debug
  }
  
  toggleMaterielSubmenu() {
    this.isMaterielSubmenuOpen = !this.isMaterielSubmenuOpen;
    if (this.isMaterielSubmenuOpen) {
      this.isProductSubmenuOpen = false;
    }
    console.log('Materiel submenu:', this.isMaterielSubmenuOpen); // Debug
  }
}