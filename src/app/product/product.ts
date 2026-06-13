import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../homeService/produit';
import { CartService } from '../homeService/cart';

export interface Product {
  id: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  image?: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.html',
  styleUrls: ['./product.css']
})
export class ProductsComponent implements OnInit {

  products: Product[] = [];
  isLoading = true;
  loadingError = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ================= LOAD (MÊME LOGIQUE QUE ADMIN) =================
  loadProducts(): void {

    this.isLoading = true;
    this.loadingError = false;

    this.productService.getProducts().subscribe({
      next: (res: any) => {

        try {
          const data = res.data ?? res ?? [];

          if (Array.isArray(data)) {
            this.products = [...data].sort(
              (a: any, b: any) => (a.id || 0) - (b.id || 0)
            );
          } else {
            console.warn('Les données ne sont pas un tableau:', data);
            this.products = [];
          }

        } catch (error) {
          console.error('Erreur traitement produits:', error);
          this.loadingError = true;
          this.products = [];
        }

        this.isLoading = false;
      },

      error: (err) => {
        console.error('Erreur API produits:', err);
        this.loadingError = true;
        this.isLoading = false;
        this.products = [];
      }
    });
  }

  // ================= IMAGE (COMME ADMIN CONSEILLÉ) =================
  getImageUrl(image: string | null | undefined): string {
    if (!image) return 'assets/no-image.png';
    return `http://127.0.0.1:8000/storage/${image}`;
  }

  // ================= CART =================
  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }
}