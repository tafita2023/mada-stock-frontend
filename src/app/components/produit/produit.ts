import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../services/produit';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription, timeout } from 'rxjs';

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
export class ProduitComponent implements OnInit, OnDestroy {

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

  // ================= LOADING STATE =================
  isLoading = true;  // Commencer à true
  loadingError = false;  // Pour tracker les erreurs de chargement

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

  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    console.log('ngOnInit - Chargement des produits');
    this.loadProduits();
  }

  ngOnDestroy() {
    // Nettoyer les subscriptions pour éviter les fuites mémoire
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  // ================= LOAD =================
  loadProduits() {
    console.log('loadProduits - Début du chargement');
    this.isLoading = true;
    this.loadingError = false;
    this.cdr.detectChanges();

    const sub = this.produitService.getProduits()
      .pipe(
        timeout(30000), // Timeout de 30 secondes
        catchError(error => {
          console.error('Erreur détaillée:', error);
          this.loadingError = true;
          this.showToast('Erreur de connexion au serveur', 'error');
          return of({ data: [] }); // Retourner un tableau vide en cas d'erreur
        }),
        finalize(() => {
          console.log('loadProduits - Finalisation');
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('Réponse reçue:', res);
          try {
            const data = res.data ?? res ?? [];
            
            if (Array.isArray(data)) {
              this.produits = [...data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
            } else {
              console.warn('Les données ne sont pas un tableau:', data);
              this.produits = [];
            }
            
            this.filteredProduits = [...this.produits];
            this.currentPage = 1;
            this.updatePagination();
            
            console.log(`${this.produits.length} produits chargés`);
            
            if (this.produits.length === 0 && !this.loadingError) {
              this.showToast('Aucun produit trouvé', 'success');
            }
          } catch (error) {
            console.error('Erreur lors du traitement des données:', error);
            this.loadingError = true;
            this.showToast('Erreur lors du traitement des données', 'error');
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erreur dans subscribe:', error);
          // Déjà géré par catchError, mais par sécurité
          this.loadingError = true;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    
    this.subscriptions.add(sub);
  }

  // ================= EMPTY =================
  getEmptyProduit(): Produit {
    return {
      image: '',
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
      this.cdr.detectChanges();
    };
  
    reader.readAsDataURL(file);
  }
  
  // ================= MODAL =================
  openAddModal() {
    this.isEditing = false;
    this.currentProduit = this.getEmptyProduit();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(produit: Produit) {
    this.isEditing = true;
    this.currentProduit = { ...produit };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentProduit = this.getEmptyProduit();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // ================= SAVE =================
  saveProduit() {
    const formData = new FormData();

    const prix = Number(this.currentProduit.prix);
    const stock = Number(this.currentProduit.stock);
    
    if (!this.currentProduit.nom) {
      this.showToast('Nom obligatoire', 'error');
      return;
    }
  
    if (isNaN(prix) || prix <= 0) {
      this.showToast('Prix invalide', 'error');
      return;
    }
  
    if (isNaN(stock) || stock < 0) {
      this.showToast('Stock invalide', 'error');
      return;
    }
    formData.append('nom', this.currentProduit.nom);
    formData.append('prix', prix.toString());
    formData.append('stock', stock.toString());
    formData.append('description', this.currentProduit.description);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // CREATE
    if (!this.isEditing) {
      const sub = this.produitService.createProduit(formData).subscribe({
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
      this.subscriptions.add(sub);
      return;
    }

    // UPDATE
    const sub = this.produitService.updateProduit(this.currentProduit.id!, formData)
      .subscribe({
        next: () => {
          this.loadProduits();
          this.closeModal();
          this.showToast('Produit modifié avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          console.log(err.error.errors);
          this.showToast('Erreur modification produit', 'error');
        }
      });
    this.subscriptions.add(sub);
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

    const sub = this.produitService.deleteProduit(this.produitToDelete.id)
      .subscribe({
        next: () => {
          this.loadProduits();
          this.closeDeleteModal();
          this.showToast('Produit supprimé avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur suppression', 'error');
        }
      });
    this.subscriptions.add(sub);
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
    this.cdr.detectChanges();
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
    const list = this.filteredProduits ?? [];
    
    this.totalPages = Math.max(
      1,
      Math.ceil(list.length / this.itemsPerPage)
    );
    
    // Vérifier que la page courante existe toujours
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.paginatedProduits = list.slice(start, end);
    this.cdr.detectChanges();
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

  // ================= RETRY LOADING =================
  retryLoading() {
    console.log('Retentative de chargement');
    this.loadProduits();
  }
}