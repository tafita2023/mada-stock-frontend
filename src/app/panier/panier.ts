import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartItems = [
      {
        id: 1,
        name: 'Produit 1',
        price: 25000,
        quantity: 2,
        image: 'https://via.placeholder.com/100'
      },
      {
        id: 2,
        name: 'Produit 2',
        price: 15000,
        quantity: 1,
        image: 'https://via.placeholder.com/100'
      }
    ];
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    }
  }

  removeItem(itemId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== itemId);
  }

  clearCart(): void {
    this.cartItems = [];
  }

  onPaymentMethodChange(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    if (method !== 'mobile_money') {
      this.selectedMobileMoneyOperator = '';
    }
  }

  validateCardDetails(): boolean {
    const { number, expiry, cvv, name } = this.cardDetails;
    // Validation simple du numéro de carte (16 chiffres)
    const cardNumberValid = /^[0-9]{16}$/.test(number.replace(/\s/g, ''));
    // Validation CVV (3 chiffres)
    const cvvValid = /^[0-9]{3}$/.test(cvv);
    // Validation date d'expiration (MM/YY)
    const expiryValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiry);
    const nameValid = name.trim().length > 0;
    
    return cardNumberValid && cvvValid && expiryValid && nameValid;
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
          alert('Veuillez vérifier les informations de votre carte bancaire');
          return;
        }
        this.processCardPayment();
        break;
      case 'cash_on_delivery':
        this.processCashOnDelivery();
        break;
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

private processMobileMoneyPayment(): void {
  const operator = this.mobileMoneyOperators.find(op => op.id === this.selectedMobileMoneyOperator);
  // Nettoyer le numéro pour l'affichage
  const cleanNumber = this.mobileMoneyNumber.replace(/\s/g, '');
  alert(`Paiement Mobile Money avec ${operator?.name}\nNuméro: +261 ${this.mobileMoneyNumber}\nMontant total: ${this.getTotal()} Ar\nUn code de validation va vous être envoyé par SMS.`);
  this.confirmOrder();
}

  private processCardPayment(): void {
    // Simuler un paiement par carte bancaire
    alert(`Paiement par carte bancaire validé\nMontant: ${this.getTotal()} FCFA\nCarte se terminant par: ${this.cardDetails.number.slice(-4)}`);
    this.confirmOrder();
  }

  private processCashOnDelivery(): void {
    // Paiement à la livraison
    alert(`Commande confirmée - Paiement à la livraison\nMontant total à payer: ${this.getTotal()} FCFA`);
    this.confirmOrder();
  }

  private confirmOrder(): void {
    // Ici vous pouvez rediriger vers une page de confirmation
    console.log('Commande confirmée', {
      items: this.cartItems,
      total: this.getTotal(),
      paymentMethod: this.selectedPaymentMethod
    });
    this.clearCart();
  }
}