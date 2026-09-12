import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { PromotionHomeService } from '../homeService/promotion';
import { CartService } from '../homeService/cart';

export interface Promotion {
  id?: number;
  nom: string;
  prix: number;
  description: string;
  type?: 'produit' | 'materiel';
  image?: string;
  ancien_prix?: number;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule
  ],
  templateUrl: './hero.html',
  styleUrls: ['./hero.css']
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {

  promotions: Promotion[] = [];

  private intervalId: ReturnType<typeof setInterval> | undefined;

  @ViewChild('nextButton')
  nextButton!: ElementRef<HTMLButtonElement>;

  constructor(
    private promotionHomeService: PromotionHomeService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.promotionHomeService.getPromotions().subscribe({
      next: (res: any) => {
        console.log('Promotions reçues :', res);

        const data = res?.data ?? res ?? [];

        if (Array.isArray(data)) {
          this.promotions = data;
        } else {
          this.promotions = [];
        }

        console.log('Promotions affichées dans le carousel :', this.promotions);
      },

      error: (error) => {
        console.error(
          'Erreur lors de la récupération des promotions :',
          error
        );

        this.promotions = [];
      }
    });
  }

  ngAfterViewInit(): void {
    this.intervalId = setInterval(() => {

      if (this.nextButton) {
        this.nextButton.nativeElement.click();
      }

    }, 5000);
  }

  ngOnDestroy(): void {

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

  }

  getImageUrl(image?: string): string {
    return image
      ? `http://127.0.0.1:8000/${image}`
      : 'assets/nothing.png';
  }

  ajouterPromotionAuPanier(promotion: any): void {

    console.log('Promotion ajoutée au panier :', promotion);
  
    if (
      promotion.type !== 'produit' &&
      promotion.type !== 'materiel'
    ) {
      console.error(
        'Type de promotion invalide :',
        promotion.type
      );
  
      return;
    }
  
    this.cartService.addPromotionToCart(promotion);
  }
}
