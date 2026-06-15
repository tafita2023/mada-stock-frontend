import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../homeService/produit';
import { CartService } from '../homeService/cart';
import { Subscription } from 'rxjs';

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

  private refreshSub?: Subscription;

  products: Product[] = [];
  isLoading = true;
  loadingError = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.refreshSub = this.productService.refresh$.subscribe(() => {
      this.loadProducts();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  // ================= LOAD =================
  loadProducts(): void {

    this.isLoading = true;
    this.loadingError = false;
  
    this.productService.getProducts().subscribe({
      next: (res: any) => {
  
        const data = Array.isArray(res) ? res : res?.data;
  
        if (!Array.isArray(data)) {
          this.products = [];
          this.loadingError = true;
        } else {
          this.products = data.sort((a, b) => a.id - b.id);
        }
  
        this.isLoading = false;
      },
  
      error: (err) => {
        console.error(err);
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