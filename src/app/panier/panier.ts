import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { CartService, CartItem } from '../homeService/cart';
import { PaymentService } from '../homeService/payement';

import { environment } from '../../environments/environment';


export type PaymentMethod = 'online' | 'cash_on_delivery';

export type DeliveryOption = 'delivery' | 'pickup';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./panier.css']
})
export class PanierComponent implements OnInit, OnDestroy {

  cartItems: CartItem[] = [];
  materielItems: CartItem[] = [];
  baseItems: CartItem[] = [];
  aromeItems: CartItem[] = [];
  packItems: CartItem[] = [];
  diverItems: CartItem[] = [];
  promotionProduitItems: CartItem[] = [];
  promotionMaterielItems: CartItem[] = [];


  displayProductsOnly: boolean = false;
  displayWithMateriel: boolean = false;
  displayWithBase: boolean = false;
  displayWithArome: boolean = false;
  displayWithPack: boolean = false;
  displayWithDiver: boolean = false;


  private cartSubscription!: Subscription;


  selectedDeliveryOption: DeliveryOption = 'delivery';


  // =========================
  // ADRESSE DE LIVRAISON
  // =========================

  deliveryAddress = {
    fullName: '',
    phone: '',
    address: '',
    city: 'Antananarivo',
    notes: ''
  };


  // =========================
  // PAIEMENT
  // =========================

  selectedPaymentMethod: PaymentMethod = 'online';


  // Évite plusieurs clics pendant la création du paiement
  isProcessingPayment: boolean = false;


  constructor(
    private cartService: CartService,
    private paymentService: PaymentService
  ) {}


  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    // UNE SEULE source de vérité : la subscription
    this.cartSubscription = this.cartService.cart$.subscribe(items => {

      this.cartItems = items.filter(
        i => i.category === 'produit'
      );

      this.materielItems = items.filter(
        i => i.category === 'materiel'
      );

      this.baseItems = items.filter(
        i => i.category === 'base'
      );

      this.aromeItems = items.filter(
        i => i.category === 'arome'
      );

      this.packItems = items.filter(
        i => i.category === 'pack'
      );

      this.diverItems = items.filter(
        i => i.category === 'diver'
      );

      this.promotionProduitItems = items.filter(
        i =>
          i.category === 'promotion' &&
          i.originalCategory === 'produit'
      );

      this.promotionMaterielItems = items.filter(
        i =>
          i.category === 'promotion' &&
          i.originalCategory === 'materiel'
      );

      this.updateDisplayMode();
    });
  }


  // =========================
  // DESTROY
  // =========================

  ngOnDestroy(): void {

    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }


  // =========================
  // PANIER
  // =========================

  loadCartItems(): void {
    this.cartService.refreshCart();
  }


  get allItems(): CartItem[] {

    return [
      ...this.cartItems,
      ...this.materielItems,
      ...this.baseItems,
      ...this.aromeItems,
      ...this.packItems,
      ...this.diverItems,
      ...this.promotionProduitItems,
      ...this.promotionMaterielItems
    ];
  }


  getAllItems(): CartItem[] {

    return [
      ...this.cartItems,
      ...this.materielItems,
      ...this.baseItems,
      ...this.aromeItems,
      ...this.packItems,
      ...this.diverItems,
      ...this.promotionProduitItems,
      ...this.promotionMaterielItems
    ];
  }


  hasMateriel(): boolean {
    return this.materielItems.length > 0;
  }


  updateDisplayMode(): void {

    this.displayProductsOnly =
      this.cartItems.length > 0;

    this.displayWithMateriel =
      this.materielItems.length > 0;

    this.displayWithBase =
      this.baseItems.length > 0;

    this.displayWithArome =
      this.aromeItems.length > 0;

    this.displayWithPack =
      this.packItems.length > 0;

    this.displayWithDiver =
      this.diverItems.length > 0;
  }


  // =========================
  // IMAGES
  // =========================

  getImageUrl(image?: string): string {

    return image
      ? `${environment.storageUrl}/${image}`
      : 'assets/nothing.png';
  }


  // =========================
  // PRIX
  // =========================

  getSubtotal(): number {

    return this.allItems.reduce(
      (sum, item) =>
        sum + (item.price * item.quantity),
      0
    );
  }


  getShippingCost(): number {

    // Retrait sur place = gratuit
    if (this.selectedDeliveryOption === 'pickup') {
      return 0;
    }

    // Livraison gratuite à partir de 50 000 Ar
    return this.getSubtotal() > 50000
      ? 0
      : 3000;
  }


  getTotal(): number {

    return this.getSubtotal() + this.getShippingCost();
  }


  // =========================
  // VALIDATION LIVRAISON
  // =========================

  isDeliveryInfoValid(): boolean {

    if (this.selectedDeliveryOption === 'delivery') {

      return (
        this.deliveryAddress.fullName.trim() !== '' &&
        this.deliveryAddress.phone.trim() !== '' &&
        this.deliveryAddress.address.trim() !== '' &&
        this.deliveryAddress.city.trim() !== ''
      );
    }

    return true;
  }


  // =========================
  // QUANTITÉ
  // =========================

  updateQuantity(
    item: CartItem,
    newQuantity: number
  ): void {

    if (newQuantity < 1 || newQuantity > 99) {
      return;
    }

    const cart = this.cartService.getCart();

    const index = cart.findIndex(
      i => i.key === item.key
    );

    if (index !== -1) {

      cart[index].quantity = newQuantity;

      this.cartService.updateCart(cart);
    }
  }


  // =========================
  // SUPPRESSION
  // =========================

  removeItem(item: CartItem): void {

    this.cartService.removeFromCart(item.key);
  }


  trackByItem(
    index: number,
    item: CartItem
  ): string {

    return item.key;
  }


  clearCart(): void {

    this.cartService.clearCart();
  }


  // =========================
  // LIVRAISON
  // =========================

  onDeliveryOptionChange(
    option: DeliveryOption
  ): void {

    this.selectedDeliveryOption = option;
  }


  // =========================
  // PAIEMENT
  // =========================

  onPaymentMethodChange(
    method: PaymentMethod
  ): void {

    this.selectedPaymentMethod = method;
  }


  // =========================
  // PROCESSUS DE PAIEMENT
  // =========================

  processPayment(): void {

    // Empêcher les doubles clics
    if (this.isProcessingPayment) {
      return;
    }


    // Vérifier panier
    if (this.allItems.length === 0) {

      alert('Votre panier est vide');

      return;
    }


    // Vérifier livraison
    if (!this.isDeliveryInfoValid()) {

      alert(
        'Veuillez remplir toutes les informations de livraison'
      );

      return;
    }


    // Paiement en ligne avec Papi
    if (this.selectedPaymentMethod === 'online') {

      this.processOnlinePayment();

      return;
    }


    // Paiement à la livraison
    if (
      this.selectedPaymentMethod ===
      'cash_on_delivery'
    ) {

      this.processCashOnDelivery();

      return;
    }
  }


  // =========================
  // PAIEMENT PAPI
  // =========================

  private processOnlinePayment(): void {
    if (this.isProcessingPayment) {
      return;
    }
  
    this.isProcessingPayment = true;
  
    const reference = `ORDER-${Date.now()}`;
  
    const deliveryText =
      this.selectedDeliveryOption === 'delivery'
        ? `Livraison à : ${this.deliveryAddress.address}, ${this.deliveryAddress.city}`
        : 'Récupération sur place (gratuit)';
  
    const paymentData = {
      amount: this.getTotal(),
      clientName: this.deliveryAddress.fullName,
      reference,
      description: `Commande Mada-Stock - ${deliveryText}`,
      payerPhone: this.deliveryAddress.phone
    };
  
    console.log('Création du paiement Papi :', paymentData);
  
    this.paymentService.createPayment(paymentData).subscribe({
      next: (response) => {
        console.log('Réponse Laravel/Papi :', response);
  
        const paymentLink =
          response.paymentLink || response.data?.paymentLink;
  
        if (!response.success || !paymentLink) {
          this.isProcessingPayment = false;
  
          console.error('Lien de paiement absent :', response);
  
          alert(
            response.message ||
            'Impossible de créer le paiement.'
          );
          return;
        }
  
        const orderData = {
          reference,
          items: this.allItems,
          subtotal: this.getSubtotal(),
          shippingCost: this.getShippingCost(),
          total: this.getTotal(),
          deliveryOption: this.selectedDeliveryOption,
          deliveryDetails:
            this.selectedDeliveryOption === 'delivery'
              ? this.deliveryAddress
              : null,
          paymentMethod: 'online',
          paymentStatus: 'PENDING',
          date: new Date().toISOString()
        };
  
        localStorage.setItem(
          'last_order',
          JSON.stringify(orderData)
        );
  
        console.log('Redirection vers Papi :', paymentLink);
  
        // Redirection vers la page Papi où le client choisit son opérateur.
        window.location.href = paymentLink;
      },
  
      error: (error) => {
        console.error('Erreur création paiement Papi :', error);
  
        this.isProcessingPayment = false;
  
        alert(
          error?.error?.message ||
          'Une erreur est survenue lors de la création du paiement.'
        );
      }
    });
  }
  
  // =========================
  // PAIEMENT À LA LIVRAISON
  // =========================

  private processCashOnDelivery(): void {

    const deliveryText =
      this.selectedDeliveryOption === 'delivery'
        ? `Livraison à : ${this.deliveryAddress.address}, ${this.deliveryAddress.city}`
        : 'Récupération sur place (gratuit)';


    alert(
      `✅ Commande confirmée (paiement à la livraison)\n` +
      `${deliveryText}\n` +
      `Frais de livraison: ${this.getShippingCost()} Ar`
    );


    this.confirmOrder();
  }


  // =========================
  // CONFIRMATION COMMANDE
  // =========================

  private confirmOrder(): void {

    const orderData = {

      items: this.allItems,

      subtotal: this.getSubtotal(),

      shippingCost:
        this.getShippingCost(),

      total:
        this.getTotal(),

      deliveryOption:
        this.selectedDeliveryOption,

      deliveryDetails:
        this.selectedDeliveryOption === 'delivery'
          ? this.deliveryAddress
          : null,

      paymentMethod:
        this.selectedPaymentMethod,

      paymentStatus:
        this.selectedPaymentMethod === 'cash_on_delivery'
          ? 'PENDING'
          : 'PENDING',

      date:
        new Date().toISOString()
    };

    console.log(
      'Order confirmed:',
      orderData
    );

    // Sauvegarder la dernière commande
    localStorage.setItem(
      'last_order',
      JSON.stringify(orderData)
    );

    // Vider le panier
    this.clearCart();
  }
}