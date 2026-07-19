import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseService } from '../../homeService/base';
import { CartService } from '../../homeService/cart';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface Base {
  id: number;
  nom: string;
  quantite: number;
  ratio: string;
  description: string;
  prix: number;
  stock: number;
  image?: string;
}

@Component({
  selector: 'app-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './base.html',
  styleUrl: './base.css',
})
export class BaseComponents {
  bases: Base[] = [];
  filteredBases: Base[] = [];
  isLoading = true;
  loadingError = false;
  selectedBase: Base | null = null;
  showDetailModal = false;

  private subs = new Subscription();

  constructor(
    private baseService: BaseService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  
    this.loadBases();
  
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadBases(): void {

    this.isLoading = true;
    this.loadingError = false;

    const sub = this.baseService.getBases()
      .subscribe({

        next: (res: any) => {

          console.log('Bases reçues:', res);

          const data = res.data ?? res ?? [];

          this.bases = data;

          this.filteredBases = [...this.bases];

          this.isLoading = false;

          this.cdr.detectChanges();

        },


        error: (err) => {

          console.error('Erreur chargement bases:', err);

          this.loadingError = true;
          this.isLoading = false;

          this.cdr.detectChanges();

        }

      });

    this.subs.add(sub);
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image) return 'assets/no-image.png';
    return `${environment.storageUrl}/${image}`;
  }

  addToCart(base: Base): void {
    this.cartService.addBaseToCart(base);
  }

  // ================= DETAILS =================
  openDetail(base: Base): void {
    this.selectedBase = base;
    this.showDetailModal = true;

    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedBase = null;

    document.body.style.overflow = '';
  }

}
