import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterielService } from '../services/materiel';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Materiel {
  id?: number;
  nom: string;
  type: string;
  marque: string;
  prix: number;
  stock: number;
  image?: string;
  dateCreation?: Date;
}

@Component({
  selector: 'app-materiel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './materiel.html',
  styleUrl: './materiel.css',
})

export class MaterielComponent implements OnInit, OnDestroy {

  constructor(
    private cdr: ChangeDetectorRef,
    private materielService: MaterielService
  ) {}

  // ================= NOTIFICATIONS =================
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  // ================= DATA =================
  materiels: Materiel[] = [];
  filteredMateriels: Materiel[] = [];
  paginatedMateriels: Materiel[] = [];

  // ================= LOADING STATE =================
  isLoading = true;
  loadingError = false;

  // ================= FILE IMAGE =================
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // ================= MODAL =================
  showModal = false;
  isEditing = false;
  currentMateriel: Materiel = this.getEmptyMateriel();

  // ================= DELETE =================
  showDeleteModal = false;
  materielToDelete: Materiel | null = null;

  // ================= FILTRE =================
  selectedType: string = '';
  searchTerm = '';

  // ================= PAGINATION =================
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // ================= DROPDOWN OPTIONS =================
  types = [
    { value: 'Kit', label: 'Kit' },
    { value: 'Pod', label: 'Pod' },
    { value: 'Tube', label: 'Tube' },
    { value: 'Mod', label: 'Mod' },
    { value: 'Puff', label: 'Puff' },
  ];

  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    console.log('ngOnInit - Chargement des materiels');
    this.loadMateriels();
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }

  loadMateriels() {
    console.log('loadMateriels - Début du chargement');
    this.isLoading = true;
    this.loadingError = false;
    this.cdr.detectChanges();

    const sub = this.materielService.getMateriels()
    .pipe(
      timeout(30000),
      catchError(error => {
        console.error('Erreur détaillée:', error);
        this.loadingError = true;
        this.showToast('Erreur de connexion au serveur', 'error');
        return of({ data: [] });
      }),
      finalize(() => {
        console.log('loadMateriels - Finalisation');
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
            this.materiels = [...data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
          } else {
            console.warn('Les données ne sont pas un tableau:', data);
            this.materiels = [];
          }
          
          this.filteredMateriels = [...this.materiels];
          this.currentPage = 1;
          this.updatePagination();
          
          console.log(`${this.materiels.length} materiels chargés`);
          
          if (this.materiels.length === 0 && !this.loadingError) {
            this.showToast('Aucun materiel trouvé', 'success');
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
  getEmptyMateriel(): Materiel {
    return {
      image: '',
      nom: '',
      type: '',
      marque: '',
      prix: 0,
      stock: 0
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
    this.currentMateriel = this.getEmptyMateriel();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }
  
  openEditModal(materiel: Materiel) {
    this.isEditing = true;
    this.currentMateriel = { ...materiel };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentMateriel = this.getEmptyMateriel();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  // ================= SAVE =================
  saveMateriel() {
    const formData = new FormData();

    const nom = this.capitalizeFirstLetter(this.currentMateriel.nom);
    const marque = this.capitalizeFirstLetter(this.currentMateriel.marque);
    const prix = Number(this.currentMateriel.prix);
    const stock = Number(this.currentMateriel.stock);
    
    if (!this.currentMateriel.nom) {
      this.showToast('Nom obligatoire', 'error');
      return;
    }

    if (!this.currentMateriel.type) {
      this.showToast('Type obligatoire', 'error');
      return;
    }

    if (!this.currentMateriel.marque) {
      this.showToast('Marque obligatoire', 'error');
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
    formData.append('type', this.currentMateriel.type);
    formData.append('marque', marque);
    formData.append('prix', prix.toString());
    formData.append('stock', stock.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // CREATE
    if (!this.isEditing) {
      const sub = this.materielService.createMateriel(formData).subscribe({
        next: () => {
          this.loadMateriels();
          this.closeModal();
          this.showToast('Materiel ajouté avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur ajout materiel', 'error');
        }
      });
      this.subscriptions.add(sub);
      return;
    }

    // UPDATE
    const sub = this.materielService.updateMateriel(this.currentMateriel.id!, formData)
      .subscribe({
        next: () => {
          this.loadMateriels();
          this.closeModal();
          this.showToast('Materiel modifié avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur modification materiel', 'error');
        }
      });
    this.subscriptions.add(sub);
  }

  // ================= DELETE =================
  openDeleteModal(p: Materiel) {
    this.materielToDelete = p;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.materielToDelete = null;
  }

  confirmDelete() {
    if (!this.materielToDelete?.id) return;

    const sub = this.materielService.deleteMateriel(this.materielToDelete.id)
      .subscribe({
        next: () => {
          this.loadMateriels();
          this.closeDeleteModal();
          this.showToast('Materiel supprimé avec succès', 'success');
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
    let result = [...this.materiels];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.nom.toLowerCase().includes(term)
      );
    }

    // Filtre par type
    if (this.selectedType) {
      result = result.filter(m =>
        m.type &&
        m.type.toLowerCase() === this.selectedType.toLowerCase()
      );
    }

    this.filteredMateriels = result;
    this.currentPage = 1;
    this.updatePagination();
    this.cdr.detectChanges();
  }

  filterByType(type: string) {
    this.selectedType = type;
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedType = ''
    this.applyFilters();
  }

  getUniqueTypes(): string[] {
    const types = this.materiels
      .map(m => m.type)
      .filter(t => t && t.trim() !== '');
  
    return [...new Set(types)];
  }
  
  getTypeCount(type: string): number {
    return this.materiels.filter(
      m => m.type === type
    ).length;
  }
  
  isTypeFilterActive(): boolean {
    return !!this.selectedType;
  }

  // ================= PAGINATION =================
  updatePagination() {
    const list = this.filteredMateriels ?? [];
    
    this.totalPages = Math.max(
      1,
      Math.ceil(list.length / this.itemsPerPage)
    );
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.paginatedMateriels = list.slice(start, end);
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
  getTotalMateriels() {
    return this.filteredMateriels.length;
  }

  getStartIndex() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex() {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredMateriels.length
    );
  }

  // ================= RETRY LOADING =================
  retryLoading() {
    console.log('Retentative de chargement');
    this.loadMateriels();
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
  
    return `${environment.storageUrl}/uploads/materiels/${image}`;
  }

}