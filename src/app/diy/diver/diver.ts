import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiverService } from '../../homeService/diver';
import { CartService } from '../../homeService/cart';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface Diver {
  id?: number;
  marque: string;
  nom: string;
  prix: number;
  stock: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-diver',
  imports: [CommonModule, FormsModule],
  templateUrl: './diver.html',
  styleUrl: './diver.css',
})
export class DiverComponent {
  divers: Diver[] = [];
  filteredDivers: Diver[] = [];
  isLoading = true;
  loadingError = false;
  selectedDiver: Diver | null = null;
  showDetailModal = false;
  selectedSearch = '';

  private subs = new Subscription();

  constructor(
    private aromeService: DiverService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  
    this.subs.add(
      this.route.queryParamMap.subscribe(params => {
  
        const recherche = params.get('recherche');
  
        this.selectedSearch = recherche
          ? recherche.trim().toLowerCase()
          : '';
    
        if (this.divers.length > 0) {
          this.applyFilter();
        }
  
      })
    );

    this.loadDivers();
  
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadDivers(): void {

    this.isLoading = true;
    this.loadingError = false;

    const sub = this.aromeService.getDivers()
      .subscribe({

        next: (res: any) => {

          console.log('Divers reçues:', res);

          const data = res.data ?? res ?? [];

          this.divers = data;

          this.applyFilter;

          this.isLoading = false;

          this.cdr.detectChanges();

        },

        error: (err) => {

          console.error('Erreur chargement divers:', err);

          this.loadingError = true;
          this.isLoading = false;

          this.cdr.detectChanges();

        }

      });

    this.subs.add(sub);
  }

  applyFilter(): void {

    let result = [...this.divers];
  
  
    if (this.selectedSearch.length > 0) {
  
      result = result.filter(diver => {
  
        const nom = String(diver.nom ?? '')
          .toLowerCase();
    
        return (
          nom.includes(this.selectedSearch)
        );
  
      });
  
    }
  
    this.filteredDivers = result;
    
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image) return 'assets/no-image.png';
    return `${environment.storageUrl}/${image}`;
  }

  addToCart(diver: Diver): void {
    this.cartService.addDiverToCart(diver);
  }

  // ================= DETAILS =================
  openDetail(diver: Diver): void {
    this.selectedDiver = diver;
    this.showDetailModal = true;

    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedDiver = null;

    document.body.style.overflow = '';
  }

}
