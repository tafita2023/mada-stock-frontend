import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NicotinesService } from '../services/nicotine';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Nicotine {
  id?: number;
  titre: string;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-nicotine',
  imports: [CommonModule, FormsModule],
  styleUrl: './nicotine.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './nicotine.html',
})

export class NicotineComponent {

  constructor(
    private cdr: ChangeDetectorRef,
    private nicotinesService: NicotinesService
  ) {}

  // ================= NOTIFICATIONS =================
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  // ================= DATA =================
  nicotines: Nicotine[] = [];
  filteredNicotines: Nicotine[] = [];
  paginatedNicotines: Nicotine[] = [];

  // ================= LOADING STATE =================
  isLoading = true;
  loadingError = false;

  // ================= FILE IMAGE =================
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // ================= MODAL =================
  showModal = false;
  isEditing = false;
  currentNicotine: Nicotine = this.getEmptyNicotine();

  // ================= DELETE =================
  showDeleteModal = false;
  showViewModal = false;
  nicotineToDelete: Nicotine | null = null;

  // ================= FILTRE =================
  searchTerm = '';

  // ================= PAGINATION =================
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    console.log('ngOnInit - Chargement des nicotines');
    this.loadNicotines();
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
  getEmptyNicotine(): Nicotine {
    return {
      titre: '',
      description: '',
      image: '',
    };
  }
  
  loadNicotines() {
    console.log('loadNicotines - Début du chargement');
    this.isLoading = true;
    this.loadingError = false;
    this.cdr.detectChanges();

    const sub = this.nicotinesService.getNicotines()
    .pipe(
      timeout(30000),
      catchError(error => {
        console.error('Erreur détaillée:', error);
        this.loadingError = true;
        this.showToast('Erreur de connexion au serveur', 'error');
        return of({ data: [] });
      }),
      finalize(() => {
        console.log('loadNicotines - Finalisation');
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
            this.nicotines = [...data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
          } else {
            console.warn('Les données ne sont pas un tableau:', data);
            this.nicotines = [];
          }
          
          this.filteredNicotines = [...this.nicotines];
          this.currentPage = 1;
          this.updatePagination();
          
          console.log(`${this.nicotines.length} nicotines chargés`);
          
          if (this.nicotines.length === 0 && !this.loadingError) {
            this.showToast('Aucunne information trouvé', 'success');
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
    saveNicotine() {  
      const formData = new FormData();
  
      const titre = this.capitalizeFirstLetter(this.currentNicotine.titre);
      const description = this.capitalizeFirstLetter(this.currentNicotine.description);
      
      if (!this.currentNicotine.titre) {
        this.showToast('Titre obligatoire', 'error');
        return;
      }

      if (!this.currentNicotine.description) {
        this.showToast('Description obligatoire', 'error');
        return;
      }

      
      formData.append('titre', titre);
      formData.append('description', description);
  
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
  
      // CREATE
      if (!this.isEditing) {
        const sub = this.nicotinesService.createNicotine(formData).subscribe({
          next: () => {
            this.loadNicotines();
            this.closeModal();
            this.showToast('Ajouté avec succès', 'success');
          },
          error: (err) => {
            console.error(err);
            this.showToast('Erreur ajout nicotine', 'error');
          }
        });
        this.subscriptions.add(sub);
        return;
      }
  
      // UPDATE
      const sub = this.nicotinesService.updateNicotine(this.currentNicotine.id!, formData)
        .subscribe({
          next: () => {
            this.loadNicotines();
            this.closeModal();
            this.showToast('Modifié avec succès', 'success');
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
            this.showToast('Erreur de modification', 'error');
          }
        });
      this.subscriptions.add(sub);
    }
  
  // ================= FILTER =================
  applyFilters() {
    let result = [...this.nicotines];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(b =>
        b.titre.toLowerCase().includes(term)
      );
    }

    this.filteredNicotines = result;
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }
  
  clearFilters() {
    this.searchTerm = '';
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
    this.currentNicotine = this.getEmptyNicotine();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(nicotine: Nicotine) {
    this.isEditing = true;
    this.currentNicotine = { ...nicotine };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }
  
  openViewModal(nicotine: Nicotine): void {
    this.currentNicotine = { ...nicotine };
    this.showViewModal = true;
  }
  
  // ================= DELETE =================
  openDeleteModal(b: Nicotine) {
    this.nicotineToDelete = b;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentNicotine = this.getEmptyNicotine();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.nicotineToDelete = null;
  }

  closeViewModal() {
    this.showViewModal = false;
  }

  confirmDelete() {
    if (!this.nicotineToDelete?.id) return;

    const sub = this.nicotinesService.deleteNicotine(this.nicotineToDelete.id)
      .subscribe({
        next: () => {
          this.loadNicotines();
          this.closeDeleteModal();
          this.showToast('Supprimé avec succès', 'success');
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
    const list = this.filteredNicotines ?? [];
    
    this.totalPages = Math.max(
      1,
      Math.ceil(list.length / this.itemsPerPage)
    );
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.paginatedNicotines = list.slice(start, end);
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
  getTotalNicotines() {
    return this.filteredNicotines.length;
  }
  
  getStartIndex() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex() {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredNicotines.length
    );
  }

  // ================= RETRY LOADING =================
  retryLoading() {
    console.log('Retentative de chargement');
    this.loadNicotines();
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
  
    return `${environment.storageUrl}/uploads/nicotines/${image}`;
  }

}
