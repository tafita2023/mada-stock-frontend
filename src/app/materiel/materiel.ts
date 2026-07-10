import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  description: string;
  type: number;
  marque: string;
  modele: string;
  batterie: number;
  capacite: number;
  watts: number;
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
export class MaterielsComponent implements OnInit, OnDestroy {

  typeMap: { [key: number]: string } = {
    1: 'kit',
    2: 'pod',
    3: 'box',
    4: 'booster',
    5: 'clearomiseurs/atomiseurs',
    6: 'consomables'
  };

  materiels: Materiel[] = [];
  filteredMateriels: Materiel[] = [];
  selectedType = 0;
  isLoading = true;
  loadingError = false;
  selectedMateriel: Materiel | null = null;
  showDetailModal = false;

  private subs = new Subscription();

  constructor(
    private materielService: MaterielService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.subs.add(
      this.route.queryParamMap.subscribe(params => {
  
        const type = params.get('type');
  
        this.selectedType = type ? Number(type) : 0;
  
        console.log('url type:', this.selectedType);
        
        if (this.materiels.length > 0) {
          this.applyFilter();
        }
  
      })
    );
  
    this.loadMateriels();
  
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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

          console.log('MATERIELS:', this.materiels);
        this.isLoading = false;

        this.applyFilter();

        this.cdr.detectChanges();
      },

      error: () => {
        this.materiels = [];
        this.filteredMateriels = [];
        this.isLoading = false;
      }
    });
  }

  // ================= FILTRE =================
  applyFilter(): void {

    if (!this.selectedType || this.selectedType === 0) {
  
      this.filteredMateriels = [...this.materiels];
  
      return;
    }
  
  
    this.filteredMateriels = this.materiels.filter(m =>
      Number(m.type) === Number(this.selectedType)
    );
  
  
    console.log(
      'TYPE FILTRE:',
      this.selectedType,
      'RESULTAT:',
      this.filteredMateriels
    );
  
  }

  // ================= NAV =================
  setType(type: number) {
    this.router.navigate(['/materiels'], {
      queryParams: { type }
    });
  }

  clearFilter() {
    this.router.navigate(['/materiels']);
  }

  // ================= TYPE LABEL =================
getTypeLabel(type: number): string {

  const labels: { [key: number]: string } = {
    1: 'Kit',
    2: 'Pod',
    3: 'Box',
    4: 'Clearomiseurs / Atomiseurs',
    5: 'Consomables'
  };

  return labels[type] ?? 'Inconnu';
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

  // ================= DETAILS =================
  openDetail(materiel: Materiel): void {
    this.selectedMateriel = materiel;
    this.showDetailModal = true;

    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedMateriel = null;

    document.body.style.overflow = '';
  }
}