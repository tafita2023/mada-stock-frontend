import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PromotionService } from '../services/promotion';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Promotion {
  id?: number;
  nom: string;
  prix: number;
  description: string;
  type?: 'produit' | 'materiel';
  id_produit?: number;
  id_materiel?: number;
  ancien_prix?: number;
  nouveau_prix?: number;
  image?: string;
}

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-promotion',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './promotion.css',
  templateUrl: './promotion.html',
})
export class PromotionComponents {

  selectedType = '';
  selectedArticle: any = null;
  articleSearch = '';
  showArticleDropdown = false;

  articles: any[] = [];
  filteredArticles: any[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private promotionService: PromotionService,
  ) {}

  // ================= NOTIFICATIONS =================
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  // ================= DATA =================
  promos: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  paginatedPromotions: Promotion[] = [];

  // ================= LOADING STATE =================
  isLoading = true;
  loadingError = false;

  // ================= FILE IMAGE =================
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // ================= MODAL =================
  showModal = false;
  isEditing = false;
  currentPromotion: Promotion = this.getEmptyPromotion();

  // ================= DELETE =================
  showDeleteModal = false;
  promoToDelete: Promotion | null = null;

  // ================= FILTRE =================
  searchTerm = '';

  // ================= PAGINATION =================
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    console.log('ngOnInit - Chargement des promos');
    this.loadPromotions();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

    // ================= EMPTY =================
    getEmptyPromotion(): Promotion {
      return {
        nom: '',
        description: '',
        prix: 0,
        nouveau_prix: 0
      };
    }
  
  loadPromotions() {
    console.log('loadPromotions - Début du chargement');
    this.isLoading = true;
    this.loadingError = false;
    this.cdr.detectChanges();

    const sub = this.promotionService.getPromotions()
    .pipe(
      timeout(30000),
      catchError(error => {
        console.error('Erreur détaillée:', error);
        this.loadingError = true;
        this.showToast('Erreur de connexion au serveur', 'error');
        return of({ data: [] });
      }),
      finalize(() => {
        console.log('loadPromotions - Finalisation');
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (res: any) => {
        console.log('Réponse reçue:', res);
        try {
          const data = res.data ?? res ?? [];
          console.log('IMAGES RECUES :');
          data.forEach((promotion: any) => {
            console.log({
              id: promotion.id,
              type: promotion.type,
              nom: promotion.nom,
              image: promotion.image,
              url: this.getImageUrl(promotion.image)
            });
          });
          
          if (Array.isArray(data)) {
            this.promos = [...data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
          } else {
            console.warn('Les données ne sont pas un tableau:', data);
            this.promos = [];
          }
          
          this.filteredPromotions = [...this.promos];
          this.currentPage = 1;
          this.updatePagination();
          
          console.log(`${this.promos.length} promos chargés`);
          
          if (this.promos.length === 0 && !this.loadingError) {
            this.showToast('Aucune promotion trouvé', 'success');
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

  // ================= SAVE =================
  savePromotion(): void {
    if (!this.selectedType) {
      this.showToast('Veuillez choisir un type', 'error');
      return;
    }
    
    if (!this.selectedArticle) {
      this.showToast('Veuillez choisir un article', 'error');
      return;
    }
    
    const nouveauPrix = Number(this.currentPromotion.nouveau_prix);
    
    if (isNaN(nouveauPrix) || nouveauPrix <= 0) {
      this.showToast('Prix invalide', 'error');
      return;
    }
    
    const formData = new FormData();
    
    formData.append('type', this.selectedType);
    formData.append('nouveau_prix', nouveauPrix.toString());
    formData.append('description', this.currentPromotion.description);
    
    if (this.selectedType === 'produit') {
      formData.append(
        'id_produit',
        this.selectedArticle.id.toString()
      );
    }
    
    if (this.selectedType === 'materiel') {
      formData.append(
        'id_materiel',
        this.selectedArticle.id.toString()
      );
    }
    
    console.log('Données envoyées :', {
      type: this.selectedType,
      article_id: this.selectedArticle.id,
      nouveau_prix: nouveauPrix
    });
    
    if (!this.isEditing) {
      const sub = this.promotionService.createPromotion(formData)
        .subscribe({
          next: () => {
            this.loadPromotions();
            this.closeModal();
            this.showToast(
              'Promotion ajoutée avec succès',
              'success'
            );
          },
          error: (err) => {
            console.error('Erreur ajout promotion :', err);
            console.error('Réponse Laravel :', err.error);
            this.showToast('Erreur ajout promotion', 'error');
          }
        });
    
      this.subscriptions.add(sub);
      return;
    }
    
    const sub = this.promotionService
      .updatePromotion(this.currentPromotion.id!, formData)
      .subscribe({
        next: () => {
          this.loadPromotions();
          this.closeModal();
          this.showToast(
            'Promotion modifiée avec succès',
            'success'
          );
        },
        error: (err) => {
          console.error('Erreur modification promotion :', err);
          console.error('Réponse Laravel :', err.error);
          this.showToast(
            'Erreur modification promotion',
            'error'
          );
        }
      });
    
    this.subscriptions.add(sub);
  }

  // ================= FILTER =================
  applyFilters() {
    let result = [...this.promos];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(b =>
        b.nom.toLowerCase().includes(term)
      );
    }

    this.filteredPromotions = result;
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }
  
  clearFilters() {
    this.searchTerm = '';
    this.selectedType = ''
    this.applyFilters();
  }
  
  onSearchChange() {
    this.applyFilters();
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
    this.currentPromotion = this.getEmptyPromotion();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(promo: Promotion): void {
    console.log(
      'Promotion sélectionnée pour modification :',
      promo
    );
  
    this.isEditing = true;
  
    // =========================
    // PROMOTION
    // =========================
  
    this.currentPromotion = {
      ...promo,
      nouveau_prix: Number(
        promo.nouveau_prix ?? promo.prix ?? 0
      )
    };
  
    this.selectedType = promo.type ?? '';
  
    this.selectedArticle = null;
    this.articleSearch = '';
  
    this.articles = [];
    this.filteredArticles = [];
  
    this.selectedFile = null;
    this.imagePreview = null;
  
    this.showModal = true;
  
    // =========================
    // ID DE L'ARTICLE
    // =========================
  
    const articleId =
      this.selectedType === 'produit'
        ? promo.id_produit
        : promo.id_materiel;
  
    console.log('Type :', this.selectedType);
    console.log('ID article :', articleId);
    console.log(
      'Prix promotionnel :',
      this.currentPromotion.nouveau_prix
    );
  
    // =========================
    // PRODUIT
    // =========================
  
    if (this.selectedType === 'produit') {
  
      this.promotionService.getProduits().subscribe({
  
        next: (data: any) => {
  
          this.articles =
            data.data ?? data ?? [];
  
          this.filteredArticles =
            [...this.articles];
  
          this.selectedArticle =
            this.articles.find(
              article =>
                Number(article.id) === Number(articleId)
            ) ?? null;
  
          if (this.selectedArticle) {
  
            this.articleSearch =
              this.selectedArticle.nom;
  
          }
  
          console.log(
            'Produit sélectionné :',
            this.selectedArticle
          );
        },
  
        error: (error) => {
  
          console.error(
            'Erreur récupération produits :',
            error
          );
  
        }
  
      });
  
      return;
    }
  
    // =========================
    // MATERIEL
    // =========================
  
    if (this.selectedType === 'materiel') {
  
      this.promotionService.getMateriels().subscribe({
  
        next: (data: any) => {
  
          this.articles =
            data.data ?? data ?? [];
  
          this.filteredArticles =
            [...this.articles];
  
          this.selectedArticle =
            this.articles.find(
              article =>
                Number(article.id) === Number(articleId)
            ) ?? null;
  
          if (this.selectedArticle) {
  
            this.articleSearch =
              this.selectedArticle.nom;
  
          }
  
          console.log(
            'Matériel sélectionné :',
            this.selectedArticle
          );
        },
  
        error: (error) => {
  
          console.error(
            'Erreur récupération matériels :',
            error
          );
  
        }
  
      });
  
      return;
    }
  }

  // ================= DELETE =================
  openDeleteModal(b: Promotion) {
    this.promoToDelete = b;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentPromotion = this.getEmptyPromotion();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.promoToDelete = null;
  }

  confirmDelete() {
    if (!this.promoToDelete?.id) return;

    const sub = this.promotionService.deletePromotion(
      this.promoToDelete.id,
      this.promoToDelete.type!
    )
      .subscribe({
        next: () => {
          this.loadPromotions();
          this.closeDeleteModal();
          this.showToast('Promotion supprimé avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur suppression', 'error');
        }
      });
    this.subscriptions.add(sub);
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  
  // ================= PAGINATION =================
  updatePagination() {
    const list = this.filteredPromotions ?? [];
    
    this.totalPages = Math.max(
      1,
      Math.ceil(list.length / this.itemsPerPage)
    );
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.paginatedPromotions = list.slice(start, end);
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
  getTotalPromotions() {
    return this.filteredPromotions.length;
  }
  
  getStartIndex() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex() {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredPromotions.length
    );
  }

  // ================= RETRY LOADING =================
  retryLoading() {
    console.log('Retentative de chargement');
    this.loadPromotions();
  }

  getImageUrl(image?: string) {
    return image
      ? `${environment.storageUrl}/${image}`
      : 'assets/nothing.png';
  }

  
  onTypeChange(): void {
    this.articleSearch = '';
    this.selectedArticle = null;
    this.articles = [];
    this.filteredArticles = [];
    this.showArticleDropdown = false;
  
    if (this.selectedType === 'produit') {
      this.promotionService.getProduits().subscribe({
        next: (data: any) => {
          this.articles = data.data ?? data ?? [];
          this.filteredArticles = [...this.articles];
        },
        error: (error) => {
          console.error('Erreur récupération produits :', error);
        }
      });
    }
  
    if (this.selectedType === 'materiel') {
      this.promotionService.getMateriels().subscribe({
        next: (data: any) => {
          this.articles = data.data ?? data ?? [];
          this.filteredArticles = [...this.articles];
        },
        error: (error) => {
          console.error('Erreur récupération matériels :', error);
        }
      });
    }
  }
  
  filterArticles(): void {
    const search = this.articleSearch
      .toLowerCase()
      .trim();
  
    this.filteredArticles = this.articles.filter(article =>
      article.nom?.toLowerCase().includes(search)
    );
  
    this.showArticleDropdown = true;
  }

  selectArticle(article: any): void {

    this.selectedArticle = article;
    this.articleSearch = article.nom;
    this.showArticleDropdown = false;
  
  }
}
