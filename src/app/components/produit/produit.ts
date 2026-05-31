import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Produit {
  id?: number;
  nom: string;
  prix: number;
  quantite: number;
  description: string;
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

  // ========================
  // NOTIFICATIONS (TOAST)
  // ========================
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  private toastTimeout: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  // ========================
  // DATA
  // ========================
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  paginatedProduits: Produit[] = [];

  // ========================
  // MODAL AJOUT / EDIT
  // ========================
  showModal = false;
  isEditing = false;
  currentProduit: Produit = this.getEmptyProduit();

  // ========================
  // DELETE MODAL
  // ========================
  showDeleteModal = false;
  produitToDelete: Produit | null = null;

  // ========================
  // SEARCH
  // ========================
  searchTerm = '';

  // ========================
  // PAGINATION
  // ========================
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // ========================
  // INIT
  // ========================
  ngOnInit() {
    this.loadProduits();
  }

  // ========================
  // LOAD DATA
  // ========================
  loadProduits() {
    this.produits = [
      { id: 1, nom: 'Cigarette Marlboro', prix: 500, quantite: 100, description: 'Marlboro Red', dateCreation: new Date() },
      { id: 2, nom: 'Cigarette Camel', prix: 450, quantite: 75, description: 'Camel Yellow', dateCreation: new Date() },
      { id: 3, nom: 'Papier OCB', prix: 200, quantite: 200, description: 'Papier à rouler', dateCreation: new Date() }
    ];

    this.filteredProduits = [...this.produits];
    this.updatePagination();
  }

  getEmptyProduit(): Produit {
    return {
      nom: '',
      prix: 0,
      quantite: 0,
      description: ''
    };
  }

  // ========================
  // MODAL AJOUT / EDIT
  // ========================
  openAddModal() {
    this.isEditing = false;
    this.currentProduit = this.getEmptyProduit();
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
  }

  // ========================
  // SAVE PRODUIT
  // ========================
  saveProduit() {
    try {
      if (this.isEditing) {
        const index = this.produits.findIndex(
          p => p.id === this.currentProduit.id
        );

        if (index !== -1) {
          this.produits[index] = {
            ...this.currentProduit,
            dateCreation: this.produits[index].dateCreation
          };

          this.showToast('Produit modifié avec succès', 'success');
        } else {
          this.showToast('Produit introuvable', 'error');
        }

      } else {
        const newId = Math.max(...this.produits.map(p => p.id || 0), 0) + 1;

        this.currentProduit.id = newId;
        this.currentProduit.dateCreation = new Date();

        this.produits.push({ ...this.currentProduit });

        this.showToast('Produit ajouté avec succès', 'success');
      }

      this.applyFilters();
      this.closeModal();

    } catch (error) {
      this.showToast('Erreur lors de l’enregistrement', 'error');
    }
  }

  // ========================
  // DELETE
  // ========================
  openDeleteModal(produit: Produit) {
    this.produitToDelete = produit;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.produitToDelete = null;
  }

  confirmDelete() {
    try {
      if (!this.produitToDelete) return;

      this.produits = this.produits.filter(
        p => p.id !== this.produitToDelete!.id
      );

      this.applyFilters();
      this.closeDeleteModal();

      this.showToast('Produit supprimé avec succès', 'success');

    } catch (error) {
      this.showToast('Erreur lors de la suppression', 'error');
    }
  }

  // ========================
  // FILTERS
  // ========================
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

  // ========================
  // PAGINATION
  // ========================
  updatePagination() {
    this.totalPages = Math.ceil(
      this.filteredProduits.length / this.itemsPerPage
    );

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.paginatedProduits =
      this.filteredProduits.slice(startIndex, endIndex);
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

    let start = Math.max(
      1,
      this.currentPage - Math.floor(maxVisible / 2)
    );

    let end = Math.min(
      this.totalPages,
      start + maxVisible - 1
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // ========================
  // TOAST (CORRIGÉ + ROBUSTE)
  // ========================
  showToast(message: string, type: 'success' | 'error' = 'success') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    // force update UI
    this.cdr.detectChanges();

    // clear ancien timer
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }

    this.toastTimeout = setTimeout(() => {
      this.showNotification = false;
      this.cdr.detectChanges();
    }, 5000);
  }

  // ========================
  // HELPERS
  // ========================
  getTotalProduits(): number {
    return this.filteredProduits.length;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredProduits.length
    );
  }
}