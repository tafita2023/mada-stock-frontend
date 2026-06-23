import { Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ProduitService } from '../services/produit';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription, timeout } from 'rxjs';

export interface Produit {
  id?: number;
  nom: string;
  prix: number;
  stock: number;
  saveur: string,
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
export class ProduitComponent implements OnInit,AfterViewInit, OnDestroy {

  constructor(
    private cdr: ChangeDetectorRef,
    private produitService: ProduitService,
    @Inject(PLATFORM_ID) private platformId: Object
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

  // ================= DROPDOWN OPTIONS =================
  saveurs = [
    { value: 'Classic', label: 'Classic' },
    { value: 'Mentholé', label: 'Mentholé' },
    { value: 'Fruité', label: 'Fruité' },
    { value: 'Boisson', label: 'Boisson' },
    { value: 'Gourmand', label: 'Gourmand' },
  ];

  // ================= FILTRES =================
  selectedSaveur: string = '';
  searchTerm = '';

  // ================= LOADING STATE =================
  isLoading = true;
  loadingError = false;

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

  // ================= PAGINATION =================
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  private subscriptions: Subscription = new Subscription();

  ngOnInit() {    
    if (isPlatformBrowser(this.platformId)) {
      this.loadProduits();
    } else {
      this.isLoading = false;
      this.produits = [];
      this.filteredProduits = [];
      this.paginatedProduits = [];
      this.cdr.detectChanges();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.loadProduits();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  // ================= LOAD =================
  loadProduits() {
    if (isPlatformServer(this.platformId)) {
      this.isLoading = false;
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      this.isLoading = false;
      this.loadingError = true;
      this.showToast('Vous devez être connecté', 'error');
      return;
    }

    this.isLoading = true;
    this.loadingError = false;
    this.cdr.detectChanges();

    const sub = this.produitService.getProduits()
      .pipe(
        timeout(30000),
        catchError(error => {
          console.error('Erreur détaillée:', error);
          this.loadingError = true;
          
          if (error.status === 401) {
            this.showToast('Session expirée, veuillez vous reconnecter', 'error');
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else {
            this.showToast('Erreur de connexion au serveur', 'error');
          }
          
          return of({ data: [] });
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          try {
            const data = res.data ?? res ?? [];
            
            if (Array.isArray(data)) {
              this.produits = [...data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
            } else {
              console.warn('Les données ne sont pas un tableau:', data);
              this.produits = [];
            }
            
            // Appliquer les filtres après chargement
            this.applyFilters();
            
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
      saveur: '',
      stock: 0,
      description: ''
    };
  }

  // ================= IMAGE =================
  onFileSelected(event: any) {
    if (!isPlatformBrowser(this.platformId)) return;
    
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
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.isEditing = false;
    this.currentProduit = this.getEmptyProduit();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(produit: Produit) {
    if (!isPlatformBrowser(this.platformId)) return;
    
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

  capitalizeFirstLetter(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  // ================= SAVE =================
  saveProduit() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const formData = new FormData();
    const nom = this.capitalizeFirstLetter(this.currentProduit.nom);
    const prix = Number(this.currentProduit.prix);
    const stock = Number(this.currentProduit.stock);
    
    if (!this.currentProduit.nom) {
      this.showToast('Nom obligatoire', 'error');
      return;
    }

    if (!this.currentProduit.saveur) {
      this.showToast('Saveur obligatoire', 'error');
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
    
    formData.append('nom', nom);
    formData.append('prix', prix.toString());
    formData.append('saveur', this.currentProduit.saveur);
    formData.append('stock', stock.toString());
    formData.append('description', this.currentProduit.description);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

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

    const sub = this.produitService.updateProduit(this.currentProduit.id!, formData)
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
    this.subscriptions.add(sub);
  }

  // ================= DELETE =================
  openDeleteModal(p: Produit) {
    if (!isPlatformBrowser(this.platformId)) return;
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

  // ================= FILTERS =================
  applyFilters() {
    let result = [...this.produits];

    // Filtre par recherche (nom)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.nom.toLowerCase().includes(term)
      );
    }

    // Filtre par saveur
    if (this.selectedSaveur) {
      result = result.filter(p => 
        p.saveur && p.saveur.toLowerCase() === this.selectedSaveur.toLowerCase()
      );
    }

    this.filteredProduits = result;
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  // Filtrer par saveur - AJOUTÉ
  filterBySaveur(saveur: string) {
    this.selectedSaveur = saveur;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedSaveur = '';
    this.applyFilters();
  }

  // Récupérer les saveurs uniques pour le filtre - AJOUTÉ
  getUniqueSaveurs(): string[] {
    const saveurs = this.produits
      .map(p => p.saveur)
      .filter(s => s && s.trim() !== '');

    return [...new Set(saveurs)];
  }

  // Compter les produits par saveur - AJOUTÉ
  getSaveurCount(saveur: string): number {
    return this.produits.filter(p => p.saveur === saveur).length;
  }

  // Vérifier si le filtre de saveur est actif - AJOUTÉ
  isSaveurFilterActive(): boolean {
    return !!this.selectedSaveur;
  }

  // ================= PAGINATION =================
  updatePagination() {
    const list = this.filteredProduits ?? [];
    
    this.totalPages = Math.max(1, Math.ceil(list.length / this.itemsPerPage));
    
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
    if (!isPlatformBrowser(this.platformId)) return;
    
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
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredProduits.length);
  }

  // ================= RETRY LOADING =================
  retryLoading() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProduits();
    }
  }
}