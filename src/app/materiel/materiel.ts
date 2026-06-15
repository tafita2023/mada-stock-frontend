import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterielService } from '../homeService/materiel';
import { CartService } from '../homeService/cart';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule],
  templateUrl: './materiel.html',
  styleUrls: ['./materiel.css']
})
export class MaterielsComponent implements OnInit {

  private refreshSub?: Subscription;

  materiels: Materiel[] = [];
  isLoading = true;
  loadingError = false;

  constructor(
    private materielService: MaterielService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadMateriels();
    this.refreshSub = this.materielService.refresh$.subscribe(() => {
      this.loadMateriels();
    });
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  // ================= LOAD =================
  loadMateriels(): void {

    this.isLoading = true;
    this.loadingError = false;
  
    this.materielService.getMateriels().subscribe({
      next: (res: any) => {
  
        const data = Array.isArray(res) ? res : res?.data;
  
        if (!Array.isArray(data)) {
          this.materiels = [];
          this.loadingError = true;
        } else {
          this.materiels = data.sort((a, b) => a.id - b.id);
        }
  
        this.isLoading = false;
      },
  
      error: (err) => {
        console.error(err);
        this.loadingError = true;
        this.isLoading = false;
        this.materiels = [];
      }
    });
  }
  
  // ================= IMAGE =================
  getImageUrl(image: string | null | undefined): string {
    if (!image) return 'assets/no-image.png';
    return `http://127.0.0.1:8000/storage/${image}`;
  }

  // ================= CART =================
  addToCart(materiel: Materiel): void {
    this.cartService.addMaterielToCart(materiel);
  }
}