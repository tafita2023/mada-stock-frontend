import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackService } from '../../homeService/pack';
import { CartService } from '../../homeService/cart';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface Pack {
  id?: number;
  nom: string;
  marque: string;
  quantite: number;
  nicotine: number;
  prix: number;
  stock: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-pack',
  imports: [CommonModule, FormsModule],
  templateUrl: './pack.html',
  styleUrl: './pack.css',
})
export class PackComponent {
  packs: Pack[] = [];
  filteredPacks: Pack[] = [];
  isLoading = true;
  loadingError = false;
  selectedPack: Pack | null = null;
  showDetailModal = false;

  private subs = new Subscription();

  constructor(
    private packService: PackService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  
    this.loadPacks();
  
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadPacks(): void {

    this.isLoading = true;
    this.loadingError = false;

    const sub = this.packService.getPacks()
      .subscribe({

        next: (res: any) => {

          console.log('Packs reçues:', res);

          const data = res.data ?? res ?? [];

          this.packs = data;

          this.filteredPacks = [...this.packs];

          this.isLoading = false;

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error('Erreur chargement packs:', err);

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

  addToCart(base: Pack): void {
    this.cartService.addPackToCart(base);
  }

  // ================= DETAILS =================
  openDetail(base: Pack): void {
    this.selectedPack = base;
    this.showDetailModal = true;

    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedPack = null;

    document.body.style.overflow = '';
  }


}
