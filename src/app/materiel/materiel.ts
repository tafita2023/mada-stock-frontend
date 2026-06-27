import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterielService } from '../homeService/materiel';
import { CartService } from '../homeService/cart';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface Materiel {
  id: number;
  nom: string;
  marque: string;
  type: string;
  prix: number;
  stock: number;
  image?: string;
}

@Component({
  selector: 'app-materiel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materiel.html',
  styleUrls: ['./materiel.css']
})
export class MaterielsComponent implements OnInit {

  private refreshSub?: Subscription;

  materiels: Materiel[] = [];
  filteredMateriels: Materiel[] = [];
  selectedType = '';
  isLoading = true;
  loadingError = false;

  private subs = new Subscription();

  constructor(
    private materielService: MaterielService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. écouter URL
    this.subs.add(
      this.route.queryParamMap.subscribe(params => {
        this.selectedType = params.get('type') ?? '';
        this.applyFilter();
      })
    );

    // 2. charger materiels
    this.loadMateriels();
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  // ================= LOAD =================
  loadMateriels(): void {
    this.isLoading = true;

    this.materielService.getMateriels().subscribe({
      next: (res: any) => {

        const data = Array.isArray(res) ? res : res?.data;

        this.materiels = Array.isArray(data)
          ? data.sort((a, b) => a.id - b.id)
          : [];

        this.applyFilter();
        this.isLoading = false;
      },

      error: () => {
        this.materiels = [];
        this.filteredMateriels = [];
        this.isLoading = false;
      }
    });
  }
  
  // ================= FILTER =================
  applyFilter(): void {    
    if (!this.selectedType) {
      this.filteredMateriels = [...this.materiels];
      return;
    }
    
    const typeRecherche = this.selectedType.trim().toLowerCase();
    
    this.filteredMateriels = this.materiels.filter(materiel => {
      console.log(
        'Comparaison :',
        materiel.type,
        '===',
        typeRecherche
      );
    
      return (
        materiel.type?.trim().toLowerCase() === typeRecherche
      );
    });
  }
  
  // ================= NAV =================
  setType(type: string) {
    this.router.navigate(['/materiels'], {
      queryParams: { type }
    });
  }

  clearFilter() {
    this.router.navigate(['/materiels']);
  }

  // ================= IMAGE =================
  getImageUrl(image: string | null | undefined): string {
    if (!image) return 'assets/no-image.png';
    return `${environment.storageUrl}/${image}`;

  }

  // ================= CART =================
  addToCart(materiel: Materiel): void {
    this.cartService.addMaterielToCart(materiel);
  }
}