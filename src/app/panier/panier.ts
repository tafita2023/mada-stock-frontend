import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService, CartItem } from '../homeService/cart';
import { environment } from '../../environments/environment';

export type PaymentMethod = 'mobile_money' | 'card' | 'cash_on_delivery';
export type DeliveryOption = 'delivery' | 'pickup';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.html',
  styleUrls: ['./panier.css']
})
export class PanierComponent implements OnInit, OnDestroy {

  cartItems: CartItem[] = [];
  materielItems: CartItem[] = [];
  
  displayProductsOnly: boolean = false;
  displayWithMateriel: boolean = false;

  private cartSubscription!: Subscription;

  selectedDeliveryOption: DeliveryOption = 'delivery';

// Adresse de livraison (si livraison choisie)
  deliveryAddress = {
    fullName: '',
    phone: '',
    address: '',
    city: 'Antananarivo',
    notes: ''
  };

  selectedPaymentMethod: PaymentMethod = 'mobile_money';
  selectedMobileMoneyOperator: string = '';

  cardDetails = {
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  };

  mobileMoneyOperators = [
    { id: 'mvola', name: 'Yas', imageUrl: '/Mvola.png' },
    { id: 'orange_Money', name: 'Orange', imageUrl: '/orange2.png' }
  ];

  mobileMoneyNumber: string = '';
  phoneNumberError: string = '';

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    // UNE SEULE source de vérité : la subscription
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items.filter(i => i.category === 'produit');
      this.materielItems = items.filter(i => i.category === 'materiel');

      this.updateDisplayMode();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  // Supprimez loadCartItems() ou modifiez-la comme ceci :
  loadCartItems(): void {
    // Rafraîchir manuellement si nécessaire
    this.cartService.refreshCart();
  }

  get allItems(): CartItem[] {
    return [...this.cartItems, ...this.materielItems];
  }
  
  hasMateriel(): boolean {
    return this.materielItems.length > 0;
  }

  updateDisplayMode(): void {
    this.displayProductsOnly = this.cartItems.length > 0 && this.materielItems.length === 0;
    this.displayWithMateriel = this.materielItems.length > 0;
  }

  getAllItems(): CartItem[] {
    return [...this.cartItems, ...this.materielItems];
  }

  getImageUrl(image?: string) {
    return image
      ? `${environment.storageUrl}/${image}`
      : 'assets/nothing.png';
  }

  getSubtotal(): number {
    const all = this.allItems;
    return all.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    // Si le client choisit de récupérer sur place → livraison gratuite
    if (this.selectedDeliveryOption === 'pickup') {
      return 0;
    }
    // Livraison à domicile : gratuite si commande > 50000 Ar
    return this.getSubtotal() > 50000 ? 0 : 3000;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getShippingCost();
  }

  isDeliveryInfoValid(): boolean {
    if (this.selectedDeliveryOption === 'delivery') {
      return this.deliveryAddress.fullName.trim() !== '' &&
             this.deliveryAddress.phone.trim() !== '' &&
             this.deliveryAddress.address.trim() !== '' &&
             this.deliveryAddress.city.trim() !== '';
    }
    return true; // Pas d'infos nécessaires pour le retrait sur place
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > 99) return;
  
    const cart = this.cartService.getCart();
    const index = cart.findIndex(i => i.key === item.key);
    
    if (index !== -1) {
      cart[index].quantity = newQuantity;
      this.cartService.updateCart(cart);
    }
  }

  selectMobileMoneyOperator(operatorId: string): void {
    this.selectedMobileMoneyOperator = operatorId;
    this.phoneNumberError = '';
    this.mobileMoneyNumber = '';
  }

  getSelectedOperatorName(): string {
    const operator = this.mobileMoneyOperators.find(
      op => op.id === this.selectedMobileMoneyOperator
    );
    return operator ? operator.name : '';
  }

  onPhoneInput(event: any): void {
    const rawValue = event.target.value;
  
    const cleanNumber = rawValue.replace(/[^0-9]/g, '').substring(0, 9);
    
    this.validatePhoneNumber(cleanNumber);
  }

  validatePhoneNumber(cleanNumber: string): void {
    if (!cleanNumber) {
      this.phoneNumberError = '';
      return;
    }

    const pattern = /^(32|33|34|37|38|39)\d{7}$/;

    const operator = this.selectedMobileMoneyOperator?.toUpperCase();

    if (operator === 'MVOLA') {
      this.phoneNumberError = pattern.test(cleanNumber)
        ? ''
        : 'Numéro MVola invalide (ex: 341234567)';
    }

    else if (operator === 'ORANGE_MONEY') {
      this.phoneNumberError = pattern.test(cleanNumber)
        ? ''
        : 'Numéro Orange invalide (ex: 321234567)';
    }
  }

  getCleanNumber(): string {
    return (this.mobileMoneyNumber || '').replace(/[^0-9]/g, '');
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.key);
  }
      
  trackByItem(index: number, item: CartItem): string {
    return item.key; // Utilisez key qui est unique
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  onDeliveryOptionChange(option: DeliveryOption): void {
    this.selectedDeliveryOption = option;
  }
  
  onPaymentMethodChange(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    if (method !== 'mobile_money') {
      this.selectedMobileMoneyOperator = '';
    }
  }

  processPayment(): void {
    if (this.cartItems.length === 0 && this.materielItems.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    // Vérifier les informations de livraison si nécessaire
    if (!this.isDeliveryInfoValid()) {
      alert('Veuillez remplir toutes les informations de livraison');
      return;
    }

    switch (this.selectedPaymentMethod) {
      case 'mobile_money':
        if (!this.selectedMobileMoneyOperator) {
          alert('Veuillez sélectionner un opérateur Mobile Money');
          return;
        }
        if (!this.mobileMoneyNumber || this.mobileMoneyNumber.length < 9) {
          alert('Veuillez entrer un numéro de téléphone valide');
          return;
        }
        if (this.phoneNumberError) {
          alert('Numéro de téléphone invalide');
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
    const deliveryText = this.selectedDeliveryOption === 'delivery' 
      ? `Livraison à : ${this.deliveryAddress.address}, ${this.deliveryAddress.city}`
      : 'Récupération sur place (gratuit)';
    
    alert(`✅ Paiement Mobile Money: ${this.getTotal()} Ar\n${deliveryText}\nFrais de livraison: ${this.getShippingCost()} Ar`);
    this.confirmOrder();
  }

private processCardPayment(): void {
    const deliveryText = this.selectedDeliveryOption === 'delivery' 
      ? `Livraison à : ${this.deliveryAddress.address}, ${this.deliveryAddress.city}`
      : 'Récupération sur place (gratuit)';
    
    alert(`✅ Paiement par carte: ${this.getTotal()} Ar\n${deliveryText}\nFrais de livraison: ${this.getShippingCost()} Ar`);
    this.confirmOrder();
  }

 private processCashOnDelivery(): void {
    const deliveryText = this.selectedDeliveryOption === 'delivery' 
      ? `Livraison à : ${this.deliveryAddress.address}, ${this.deliveryAddress.city}`
      : 'Récupération sur place (gratuit)';
    
    alert(`✅ Commande confirmée (paiement à la livraison)\n${deliveryText}\nFrais de livraison: ${this.getShippingCost()} Ar`);
    this.confirmOrder();
  }

 private confirmOrder(): void {
    const orderData = {
      items: this.allItems,
      subtotal: this.getSubtotal(),
      shippingCost: this.getShippingCost(),
      total: this.getTotal(),
      deliveryOption: this.selectedDeliveryOption,
      deliveryDetails: this.selectedDeliveryOption === 'delivery' ? this.deliveryAddress : null,
      paymentMethod: this.selectedPaymentMethod,
      paymentDetails: this.selectedPaymentMethod === 'mobile_money' ? {
        operator: this.selectedMobileMoneyOperator,
        phone: this.mobileMoneyNumber
      } : null,
      date: new Date().toISOString()
    };
    
    console.log('Order confirmed:', orderData);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('last_order', JSON.stringify(orderData));
    
    alert('🎉 Votre commande a été enregistrée avec succès !');
    this.clearCart();
  }

validateCardDetails(): boolean {
    return this.cardDetails.number.length >= 13 && 
           this.cardDetails.cvv.length >= 3 &&
           this.cardDetails.expiry.length >= 5 &&
           this.cardDetails.name.length > 0;
  }
}