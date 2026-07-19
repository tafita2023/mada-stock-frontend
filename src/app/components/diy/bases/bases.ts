import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasesService } from '../../services/bases';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Base {
  id?: number;
  nom: string;
  ratio: string;
  quantite: number;
  prix: number;
  stock: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-bases',
  imports: [CommonModule, FormsModule],
  templateUrl: './bases.html',
  styleUrl: './bases.css',
})
export class BasesComponent {
  constructor(
    private cdr: ChangeDetectorRef,
    private basesService: BasesService
  ) {}

  // ================= NOTIFICATIONS =================
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  // ================= DATA =================
  bases: Base[] = [];
  filteredBases: Base[] = [];
  paginatedBases: Base[] = [];

  // ================= LOADING STATE =================
  isLoading = true;
  loadingError = false;

  // ================= FILE IMAGE =================
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // ================= MODAL =================
  showModal = false;
  isEditing = false;
  currentBase: Base = this.getEmptyBase();

  // ================= DELETE =================
  showDeleteModal = false;
  baseToDelete: Base | null = null;

  // ================= FILTRE =================
  selectedType: string = '';
  searchTerm = '';

  // ================= PAGINATION =================
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    console.log('ngOnInit - Chargement des bases');
    this.loadBases();
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
    getEmptyBase(): Base {
      return {
        nom: '',
        ratio: '',
        quantite: 0,
        prix: 0,
        stock: 0,
        description: '',
        image: '',
          };
    }
  
  loadBases() {
    console.log('loadBases - Début du chargement');
    this.isLoading = true;
    this.loadingError = false;
    this.cdr.detectChanges();

    const sub = this.basesService.getBases()
    .pipe(
      timeout(30000),
      catchError(error => {
        console.error('Erreur détaillée:', error);
        this.loadingError = true;
        this.showToast('Erreur de connexion au serveur', 'error');
        return of({ data: [] });
      }),
      finalize(() => {
        console.log('loadBases - Finalisation');
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
            this.bases = [...data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
          } else {
            console.warn('Les données ne sont pas un tableau:', data);
            this.bases = [];
          }
          
          this.filteredBases = [...this.bases];
          this.currentPage = 1;
          this.updatePagination();
          
          console.log(`${this.bases.length} bases chargés`);
          
          if (this.bases.length === 0 && !this.loadingError) {
            this.showToast('Aucun base trouvé', 'success');
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
  saveBase() {  
    const formData = new FormData();

    const nom = this.capitalizeFirstLetter(this.currentBase.nom);
    const ratio = this.currentBase.ratio;
    const quantite = Number(this.currentBase.quantite);
    const description = this.capitalizeFirstLetter(this.currentBase.description);
    const prix = Number(this.currentBase.prix);
    const stock = Number(this.currentBase.stock);
    
    if (!this.currentBase.nom) {
      this.showToast('Nom obligatoire', 'error');
      return;
    }

    if (!this.currentBase.ratio) {
      this.showToast('Ratio obligatoire', 'error');
      return;
    }
  
    if (!this.currentBase.quantite) {
      this.showToast('Quantite obligatoire', 'error');
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
    formData.append('ratio', ratio);
    formData.append('quantite', quantite.toString());
    formData.append('prix', prix.toString());
    formData.append('stock', stock.toString());
    formData.append('description', description);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // CREATE
    if (!this.isEditing) {
      const sub = this.basesService.createBase(formData).subscribe({
        next: () => {
          this.loadBases();
          this.closeModal();
          this.showToast('Base ajouté avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur ajout base', 'error');
        }
      });
      this.subscriptions.add(sub);
      return;
    }

    // UPDATE
    const sub = this.basesService.updateBase(this.currentBase.id!, formData)
      .subscribe({
        next: () => {
          this.loadBases();
          this.closeModal();
          this.showToast('Base modifié avec succès', 'success');
        },
        error: (err) => {
          console.error('Erreur complète ajout:', err);

          if (err.error) {
            console.error('Message Laravel:', err.error.message);
        
            if (err.error.errors) {
              console.error('Erreurs validation:', err.error.errors);
            }
          }
          console.error(err);
          this.showToast('Erreur modification base', 'error');
        }
      });
    this.subscriptions.add(sub);
  }
  
  // ================= FILTER =================
  applyFilters() {
    let result = [...this.bases];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(b =>
        b.nom.toLowerCase().includes(term)
      );
    }

    // Filtre par type
    if (this.selectedType) {
      result = result.filter(b => String(b.nom) === this.selectedType);
    }

    this.filteredBases = result;
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
    this.currentBase = this.getEmptyBase();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(base: Base) {
    console.log('Base sélectionnée pour modification:', base);

    this.isEditing = true;
    this.currentBase = { ...base };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }
  // ================= DELETE =================
  openDeleteModal(b: Base) {
    this.baseToDelete = b;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentBase = this.getEmptyBase();
    this.selectedFile = null;
    this.imagePreview = null;
  }
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.baseToDelete = null;
  }

  confirmDelete() {
    if (!this.baseToDelete?.id) return;

    const sub = this.basesService.deleteBase(this.baseToDelete.id)
      .subscribe({
        next: () => {
          this.loadBases();
          this.closeDeleteModal();
          this.showToast('Base supprimé avec succès', 'success');
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
    const list = this.filteredBases ?? [];
    
    this.totalPages = Math.max(
      1,
      Math.ceil(list.length / this.itemsPerPage)
    );
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.paginatedBases = list.slice(start, end);
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
  getTotalBases() {
    return this.filteredBases.length;
  }
  
  getStartIndex() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex() {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredBases.length
    );
  }

  // ================= RETRY LOADING =================
  retryLoading() {
    console.log('Retentative de chargement');
    this.loadBases();
  }

  getImageUrl(image?: string): string {
    if (!image) return 'assets/nothing.png';
  
    // nettoyage ancien format
    if (image.includes('storage')) {
      image = image.replace('/storage/', '').replace('storage ', '');
    }
  
    // éviter double "uploads"
    if (image.startsWith('uploads/')) {
      return `${environment.storageUrl}/${image}`;
    }
  
    return `${environment.storageUrl}/uploads/bases/${image}`;
  }

}
