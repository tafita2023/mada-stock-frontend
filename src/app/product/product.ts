import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../homeService/produit';
import { CartService } from '../homeService/cart';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  saveur: string;
  stock: number;
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

  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedSaveur = '';
  isLoading = true;

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
        this.selectedSaveur = params.get('saveur') ?? '';
        this.applyFilter();
        this.cdr.detectChanges();
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
    if (!this.products.length) {
      this.filteredProducts = [];
      return;
    }
  
    if (!this.selectedSaveur) {
      this.filteredProducts = [...this.products];
      return;
    }
  
    const saveurRecherche = this.selectedSaveur.trim().toLowerCase();
  
    this.filteredProducts = this.products.filter(m =>
      m.saveur?.trim().toLowerCase() === saveurRecherche
    );

    this.cdr.detectChanges();
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
}