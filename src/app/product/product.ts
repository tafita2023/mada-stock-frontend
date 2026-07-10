import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../homeService/produit';
import { CartService } from '../homeService/cart';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface Product {
  id?: number;
  marque: string;
  nom: string;
  contenance: number;
  nicotine: number | null;
  saveur: number,
  prix: number;
  stock: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.html',
  styleUrls: ['./product.css']
})
export class ProductsComponent implements OnInit, OnDestroy {

  saveurMap: { [key: number]: string } = {
    1: 'Classic',
    2: 'Mentholé',
    3: 'Fruité',
    4: 'Boisson',
    5: 'Gourmand'
  };

  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedSaveur = 0;
  isLoading = true;
  selectedProduct: Product | null = null;
  showDetailModal = false;


  private subs = new Subscription();

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.subs.add(
      this.route.queryParamMap.subscribe(params => {
  
        const saveur = params.get('saveur');
  
        this.selectedSaveur = saveur ? Number(saveur) : 0;
  
        console.log('url saveur:', this.selectedSaveur);
        
        if (this.products.length > 0) {
          this.applyFilter();
        }

        })
    );
  
    this.loadProducts();
  
  }
  
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ================= LOAD =================
  loadProducts(): void {
    this.isLoading = true;

    this.productService.getProducts().subscribe({
      next: (res: any) => {

        const data = Array.isArray(res) ? res : res?.data;

        this.products = Array.isArray(data)
          ? data.sort((a, b) => a.id - b.id)
          : [];

        this.isLoading = false;

        this.applyFilter();

        this.cdr.detectChanges();
      },

      error: () => {
        this.products = [];
        this.filteredProducts = [];
        this.isLoading = false;
      }
    });
  }

  // ================= FILTER =================
  applyFilter(): void {

    if (!this.selectedSaveur || this.selectedSaveur === 0) {
  
      this.filteredProducts = [...this.products];
  
      return;
    }
  
  
    this.filteredProducts = this.products.filter(m =>
      Number(m.saveur) === Number(this.selectedSaveur)
    );
  
  
    console.log(
      'SAVEUR FILTRE:',
      this.selectedSaveur,
      'RESULTAT:',
      this.filteredProducts
    );
  
  }

  // ================= NAV =================
  setSaveur(saveur: string) {
    this.router.navigate(['/produits'], {
      queryParams: { saveur }
    });
  }

  clearFilter() {
    this.router.navigate(['/produits']);
  }

  getSaveurLabel(saveur: number): string {

    const labels: { [key: number]: string } = {
      1: 'Classic',
      2: 'Mentholé',
      3: 'Fruité',
      4: 'Boisson',
      5: 'Gourmand'
    };
  
    return labels[saveur] ?? 'Inconnu';
  }
  

  // ================= CART =================
  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  // ================= IMAGE =================
  getImageUrl(image?: string) {
    return image
      ? `${environment.storageUrl}/${image}`
      : 'assets/nothing.png';
  }

  openDetail(product: Product): void {
    this.selectedProduct = product;
    this.showDetailModal = true;

    document.body.style.overflow = 'hidden';
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedProduct = null;

    document.body.style.overflow = '';
  }

}