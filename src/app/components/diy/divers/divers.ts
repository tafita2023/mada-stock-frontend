import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiversService } from '../../services/divers';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Diver {
  id?: number;
  marque: string;
  nom: string;
  prix: number;
  stock: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-divers',
  imports: [CommonModule, FormsModule],
  templateUrl: './divers.html',
  styleUrl: './divers.css',
})
export class DiversComponent {
  constructor(
    private cdr: ChangeDetectorRef,
    private diversService: DiversService
  ) {}

  
  // ================= NOTIFICATIONS =================
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  // ================= DATA =================
  divers: Diver[] = [];
  filteredDivers: Diver[] = [];
  paginatedDivers: Diver[] = [];

  // ================= LOADING STATE =================
  isLoading = true;
  loadingError = false;

  // ================= FILE IMAGE =================
  selectedFile: File | null = null;
  imagePreview: string | null = null;

    // ================= MODAL =================
    showModal = false;
    isEditing = false;
    currentDiver: Diver = this.getEmptyDiver();
  
    // ================= DELETE =================
    showDeleteModal = false;
    diverToDelete: Diver | null = null;
  
    // ================= FILTRE =================
    selectedType: string = '';
    searchTerm = '';
  
    // ================= PAGINATION =================
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 1;
  
    private subscriptions: Subscription = new Subscription();
  
    ngOnInit() {
      console.log('ngOnInit - Chargement des divers');
      this.loadDivers();
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
    getEmptyDiver(): Diver {
      return {
        nom: '',
        marque: '',
        prix: 0,
        stock: 0,
        description: '',
        image: '',
          };
    }
  
  loadDivers() {
    console.log('loadDivers - Début du chargement');
    this.isLoading = true;
    this.loadingError = false;
    this.cdr.detectChanges();

    const sub = this.diversService.getDivers()
    .pipe(
      timeout(30000),
      catchError(error => {
        console.error('Erreur détaillée:', error);
        this.loadingError = true;
        this.showToast('Erreur de connexion au serveur', 'error');
        return of({ data: [] });
      }),
      finalize(() => {
        console.log('loadDivers - Finalisation');
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
            this.divers = [...data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
          } else {
            console.warn('Les données ne sont pas un tableau:', data);
            this.divers = [];
          }
          
          this.filteredDivers = [...this.divers];
          this.currentPage = 1;
          this.updatePagination();
          
          console.log(`${this.divers.length} divers chargés`);
          
          if (this.divers.length === 0 && !this.loadingError) {
            this.showToast('Aucun diver trouvé', 'success');
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
  saveDiver() {  
    const formData = new FormData();

    const nom = this.capitalizeFirstLetter(this.currentDiver.nom);
    const marque = this.currentDiver.marque;
    const description = this.capitalizeFirstLetter(this.currentDiver.description);
    const prix = Number(this.currentDiver.prix);
    const stock = Number(this.currentDiver.stock);
    
    if (!this.currentDiver.nom) {
      this.showToast('Nom obligatoire', 'error');
      return;
    }

    if (!this.currentDiver.marque) {
      this.showToast('Ratio obligatoire', 'error');
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
    formData.append('marque', marque);
    formData.append('prix', prix.toString());
    formData.append('stock', stock.toString());
    formData.append('description', description);

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // CREATE
    if (!this.isEditing) {
      const sub = this.diversService.createDiver(formData).subscribe({
        next: () => {
          this.loadDivers();
          this.closeModal();
          this.showToast('Diver ajouté avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur ajout diver', 'error');
        }
      });
      this.subscriptions.add(sub);
      return;
    }

    // UPDATE
    const sub = this.diversService.updateDiver(this.currentDiver.id!, formData)
      .subscribe({
        next: () => {
          this.loadDivers();
          this.closeModal();
          this.showToast('Diver modifié avec succès', 'success');
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
          this.showToast('Erreur modification diver', 'error');
        }
      });
    this.subscriptions.add(sub);
  }

    // ================= FILTER =================
  applyFilters() {
    let result = [...this.divers];

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

    this.filteredDivers = result;
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
    this.currentDiver = this.getEmptyDiver();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(diver: Diver) {
    console.log('Diver sélectionnée pour modification:', diver);

    this.isEditing = true;
    this.currentDiver = { ...diver };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }
  
  // ================= DELETE =================
  openDeleteModal(b: Diver) {
    this.diverToDelete = b;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentDiver = this.getEmptyDiver();
    this.selectedFile = null;
    this.imagePreview = null;
  }
  
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.diverToDelete = null;
  }

  confirmDelete() {
    if (!this.diverToDelete?.id) return;

    const sub = this.diversService.deleteDiver(this.diverToDelete.id)
      .subscribe({
        next: () => {
          this.loadDivers();
          this.closeDeleteModal();
          this.showToast('Diver supprimé avec succès', 'success');
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
    const list = this.filteredDivers ?? [];
    
    this.totalPages = Math.max(
      1,
      Math.ceil(list.length / this.itemsPerPage)
    );
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.paginatedDivers = list.slice(start, end);
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
  getTotalDivers() {
    return this.filteredDivers.length;
  }
  
  getStartIndex() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex() {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredDivers.length
    );
  }

  // ================= RETRY LOADING =================
  retryLoading() {
    console.log('Retentative de chargement');
    this.loadDivers();
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
  
    return `${environment.storageUrl}/uploads/divers/${image}`;
  }

}
