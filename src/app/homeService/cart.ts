import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private platformId = inject(PLATFORM_ID);
  private cartKey = 'cart';

  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.cartSubject.next(this.getCart());
    }
  }

  getCart(): any[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    return JSON.parse(localStorage.getItem(this.cartKey) || '[]');
  }

  addToCart(product: any): void {
    if (!isPlatformBrowser(this.platformId)) return;
  
    const cart = this.getCart();
  
    const index = cart.findIndex(item => item.id === product.id);
  
    if (index !== -1) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.nom || product.name,
        price: product.prix || product.price,
        image: product.image || 'assets/default.png',
        quantity: 1
      });
    }
  
    this.saveCart(cart);
  }

removeFromCart(productId: number): void {
  if (!isPlatformBrowser(this.platformId)) return;

  const cart = this.getCart().filter(item => item.id !== productId);

  this.saveCart(cart);
}

  clearCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.removeItem(this.cartKey);
    this.saveCart([]);
  }

  updateCart(cart: any[]): void {
    this.saveCart(cart);
  }
  
  saveCart(cart: any[]): void {
    localStorage.setItem(this.cartKey, JSON.stringify(cart));
    this.cartSubject.next(cart);
  }
}