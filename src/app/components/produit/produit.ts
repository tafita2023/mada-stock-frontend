import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../services/produit';

export interface Produit {
  id?: number;
  nom: string;
  prix: number;
  stock: number;
  description: string;
  image?: string;
  dateCreation?: Date;
}

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produit.html',
  styleUrls: ['./produit.css']
})
export class ProduitComponent implements OnInit {

  constructor(
    private cdr: ChangeDetectorRef,
    private produitService: ProduitService
  ) {}

  // ================= NOTIFICATIONS =================
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  // ================= DATA =================
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  paginatedProduits: Produit[] = [];

  // ================= FILE IMAGE =================
  selectedFile: File | null = null;
  imagePreview: string | null = null;


  // ================= MODAL =================
  showModal = false;
  isEditing = false;
  currentProduit: Produit = this.getEmptyProduit();

  // ================= DELETE =================
  showDeleteModal = false;
  produitToDelete: Produit | null = null;

  // ================= SEARCH =================
  searchTerm = '';

  // ================= PAGINATION =================
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  
  ngOnInit() {
    this.loadProduits();
  }

  // ================= LOAD =================
  loadProduits() {
    this.produitService.getProduits().subscribe({
      next: (res: any) => {

        const data = res.data ?? res;

        // TRI CROISSANT (ancien → nouveau)
        this.produits = data.sort((a: any, b: any) => a.id - b.id);

        this.filteredProduits = [...this.produits];
        this.updatePagination();
      },
      error: () => this.showToast('Erreur chargement produits', 'error')
    });
  }

  // ================= EMPTY =================
  getEmptyProduit(): Produit {
    return {
      nom: '',
      prix: 0,
      stock: 0,
      description: ''
    };
  }

  // ================= IMAGE =================
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
  
    this.selectedFile = file;
  
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
  
    reader.readAsDataURL(file);
  }
  
  // ================= MODAL =================
  openAddModal() {
    this.isEditing = false;
    this.currentProduit = this.getEmptyProduit();
    this.selectedFile = null;
    this.showModal = true;
  }

  openEditModal(produit: Produit) {
    this.isEditing = true;
    this.currentProduit = { ...produit };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentProduit = this.getEmptyProduit();
    this.selectedFile = null;
  }

  // ================= SAVE =================
  saveProduit() {

    const formData = new FormData();
    formData.append('nom', this.currentProduit.nom);
    formData.append('prix', this.currentProduit.prix.toString());
    formData.append('stock', this.currentProduit.stock.toString());
    formData.append('description', this.currentProduit.description);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // CREATE
    if (!this.isEditing) {

      this.produitService.createProduit(formData).subscribe({
        next: () => {
          this.loadProduits();
          this.closeModal();
          this.showToast('Produit ajouté avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur ajout produit', 'error');
        }
      });

      return;
    }

    // UPDATE
    this.produitService.updateProduit(this.currentProduit.id!, formData)
      .subscribe({
        next: () => {
          this.loadProduits();
          this.closeModal();
          this.showToast('Produit modifié avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur modification produit', 'error');
        }
      });
  }

  // ================= DELETE =================
  openDeleteModal(p: Produit) {
    this.produitToDelete = p;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.produitToDelete = null;
  }

  confirmDelete() {

    if (!this.produitToDelete?.id) return;

    this.produitService.deleteProduit(this.produitToDelete.id)
      .subscribe({
        next: () => {
          this.loadProduits();
          this.closeDeleteModal();
          this.showToast('Produit supprimé', 'success');
        },
        error: () => this.showToast('Erreur suppression', 'error')
      });
  }

  // ================= FILTER =================
  applyFilters() {

    let result = [...this.produits];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.nom.toLowerCase().includes(term)
      );
    }

    this.filteredProduits = result;
    this.currentPage = 1;
    this.updatePagination();
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.applyFilters();
  }

  // ================= PAGINATION =================
  updatePagination() {

    this.totalPages = Math.ceil(
      this.filteredProduits.length / this.itemsPerPage
    );

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedProduits =
      this.filteredProduits.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // ================= TOAST =================
  showToast(message: string, type: 'success' | 'error') {

    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    this.cdr.detectChanges();

    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.toastTimeout = setTimeout(() => {
      this.showNotification = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  // ================= HELPERS =================
  getTotalProduits() {
    return this.filteredProduits.length;
  }

  getStartIndex() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex() {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredProduits.length
    );
  }
}