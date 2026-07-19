import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AromeService } from '../../homeService/arome';
import { CartService } from '../../homeService/cart';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface Arome {
  id?: number;
  marque: string;
  nom: string;
  categorie: number;
  quantite: number;
  prix: number;
  stock: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-arome',
  imports: [CommonModule, FormsModule],
  templateUrl: './arome.html',
  styleUrl: './arome.css',
})
export class AromeComponent {
  aromes: Arome[] = [];
  filteredAromes: Arome[] = [];
  isLoading = true;
  loadingError = false;
  selectedArome: Arome | null = null;
  showDetailModal = false;

  private subs = new Subscription();

  constructor(
    private aromeService: AromeService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  
    this.loadAromes();
  
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadAromes(): void {

    this.isLoading = true;
    this.loadingError = false;

    const sub = this.aromeService.getAromes()
      .subscribe({

        next: (res: any) => {

          console.log('Aromes reçues:', res);

          const data = res.data ?? res ?? [];

          this.aromes = data;

          this.filteredAromes = [...this.aromes];

          this.isLoading = false;

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error('Erreur chargement aromes:', err);

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

  addToCart(base: Arome): void {
    this.cartService.addAromeToCart(base);
  }

  // ================= DETAILS =================
  openDetail(base: Arome): void {
    this.selectedArome = base;
    this.showDetailModal = true;

    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedArome = null;

    document.body.style.overflow = '';
  }

}
