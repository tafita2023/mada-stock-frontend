import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../homeService/cart';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type PaymentMethod = 'mobile_money' | 'card' | 'cash_on_delivery';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.html',
  styleUrls: ['./panier.css']
})
export class PanierComponent implements OnInit {

  cartItems: CartItem[] = [];

  selectedPaymentMethod: PaymentMethod = 'mobile_money';
  selectedMobileMoneyOperator: string = '';

  cardDetails = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  };

  mobileMoneyOperators = [
    { id: 'yas', name: 'MVola', imageUrl: '/Mvola.png' },
    { id: 'orange', name: 'Orange Money', imageUrl: '/orange2.png' }
  ];

  mobileMoneyNumber: string = '';
  phoneNumberError: string = '';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCartItems();

    // 🔥 mise à jour automatique du panier
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  loadCartItems(): void {
    this.cartItems = this.cartService.getCart();
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image) return 'assets/no-image.png';
    return `http://127.0.0.1:8000/storage/${image}`;
  }

  getSubtotal(): number {
    return this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  getShippingCost(): number {
    return this.getSubtotal() > 50000 ? 0 : 3000;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost();
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity >= 1 && newQuantity <= 99) {
      item.quantity = newQuantity;
      this.cartService.updateCart(this.cartItems);
    }
  }

  // Sélectionner un opérateur Mobile Money
selectMobileMoneyOperator(operatorId: string): void {
  this.selectedMobileMoneyOperator = operatorId;
  this.phoneNumberError = '';
  // Réinitialiser le numéro quand on change d'opérateur
  this.mobileMoneyNumber = '';
}

// Récupérer le nom de l'opérateur sélectionné
getSelectedOperatorName(): string {
  const operator = this.mobileMoneyOperators.find(op => op.id === this.selectedMobileMoneyOperator);
  return operator ? operator.id : '';
}

// Valider le numéro de téléphone
validatePhoneNumber(): void {
  // Nettoyer le numéro (enlever les espaces)
  let cleanNumber = this.mobileMoneyNumber.replace(/\s/g, '');
  
  // Validation selon l'opérateur
  if (this.selectedMobileMoneyOperator === 'mtn') {
      // MTN: 32, 33, 34, 37, 38, 39
      const mtnPattern = /^(32|33|34|37|38|39)\d{7}$/;
      if (!mtnPattern.test(cleanNumber)) {
          this.phoneNumberError = 'Numéro MTN invalide (ex: 32 12 345 67)';
      } else {
          this.phoneNumberError = '';
      }
  } else if (this.selectedMobileMoneyOperator === 'orange') {
      // Orange: 38, 39 (pour Madagascar)
      const orangePattern = /^(38|39)\d{7}$/;
      if (!orangePattern.test(cleanNumber)) {
          this.phoneNumberError = 'Numéro Orange invalide (ex: 38 12 345 67)';
      } else {
          this.phoneNumberError = '';
      }
  }
}

  removeItem(itemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
    this.cartService.saveCart(this.cartItems);
  }

  clearCart(): void {
    this.cartItems = [];
    this.cartService.clearCart();
  }

  onPaymentMethodChange(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    if (method !== 'mobile_money') {
      this.selectedMobileMoneyOperator = '';
    }
  }

  processPayment(): void {
    if (this.cartItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    switch (this.selectedPaymentMethod) {
      case 'mobile_money':
        if (!this.selectedMobileMoneyOperator) {
          alert('Veuillez sélectionner un opérateur Mobile Money');
          return;
        }
        this.processMobileMoneyPayment();
        break;

      case 'card':
        if (!this.validateCardDetails()) {
          alert('Carte invalide');
          return;
        }
        this.processCardPayment();
        break;

      case 'cash_on_delivery':
        this.processCashOnDelivery();
        break;
    }
  }

  private processMobileMoneyPayment(): void {
    alert(`Paiement Mobile Money: ${this.getTotal()} Ar`);
    this.confirmOrder();
  }

  private processCardPayment(): void {
    alert(`Paiement carte validé: ${this.getTotal()} Ar`);
    this.confirmOrder();
  }

  private processCashOnDelivery(): void {
    alert(`Commande confirmée (livraison)`);
    this.confirmOrder();
  }

  private confirmOrder(): void {
    console.log('Commande confirmée', this.cartItems);
    this.clearCart();
  }

  validateCardDetails(): boolean {
    return true;
  }
}