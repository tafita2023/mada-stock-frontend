import { isPlatformBrowser } from "@angular/common";
import { inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export interface CartItem {
  key: string;
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: 'produit' | 'materiel';
  type?: string;
  marque?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private platformId = inject(PLATFORM_ID);
  private deviceKey = 'device_id';

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.refreshCart();
    }
  }

  private getDeviceId(): string {
    if (!isPlatformBrowser(this.platformId)) return 'server';

    let deviceId = localStorage.getItem(this.deviceKey);

    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(this.deviceKey, deviceId);
    }

    return deviceId;
  }

  private getCartKey(): string {
    return `cart_${this.getDeviceId()}`;
  }

  getCart(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
  
    try {
      const cart = JSON.parse(localStorage.getItem(this.getCartKey()) || '[]');
      // Correction importante : ne pas recréer la clé si elle existe déjà
      return cart.map((item: any) => ({
        ...item,
        key: item.key || `${item.category}-${item.id}` // Garder la clé existante
      }));
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }
  
  addToCart(product: any): void {
    const cart = this.getCart();
    const key = `produit-${product.id}`; // Format cohérent

    const existingItem = cart.find(item => item.key === key);

    if (existingItem) {
      existingItem.quantity += 1;
      this.saveCart(cart);
    } else {
      const newItem: CartItem = {
        key: key, // Utiliser la même clé
        id: product.id,
        category: 'produit',
        name: product.nom || product.name,
        price: product.prix || product.price,
        image: product.image || 'assets/default.png',
        quantity: 1
      };
      cart.push(newItem);
      this.saveCart(cart);
    }
  }

  addMaterielToCart(materiel: any): void {
    const cart = this.getCart();
    const key = `materiel-${materiel.id}`; // Format cohérent

    const existingItem = cart.find(item => item.key === key);

    if (existingItem) {
      existingItem.quantity += 1;
      this.saveCart(cart);
    } else {
      const newItem: CartItem = {
        key: key, // Utiliser la même clé
        id: materiel.id,
        category: 'materiel',
        name: materiel.nom || materiel.name,
        price: materiel.prix || materiel.price,
        image: materiel.image || 'assets/default.png',
        quantity: 1,
        type: materiel.type || '',
        marque: materiel.marque || ''
      };
      cart.push(newItem);
      this.saveCart(cart);
    }
  }

  getProducts(): CartItem[] {
    return this.getCart().filter(item => item.category === 'produit');
  }

  getMateriels(): CartItem[] {
    return this.getCart().filter(item => item.category === 'materiel');
  }

  removeFromCart(key: string): void {
    const cart = this.getCart().filter(item => item.key !== key);
    this.saveCart(cart);
  }

  updateCart(cart: CartItem[]): void {
    this.saveCart(cart);
  }

  clearCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.saveCart([]);
  }

  private saveCart(cart: CartItem[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      localStorage.setItem(this.getCartKey(), JSON.stringify(cart));
      this.cartSubject.next([...cart]);
      console.log('Cart saved:', cart); // Pour déboguer
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  refreshCart(): void {
    this.cartSubject.next(this.getCart());
  }
}