import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AromesService } from '../../services/aromes';
import { finalize, catchError } from 'rxjs/operators';
import { of, Subscription, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Arome {
  id?: number;
  marque: string;
  nom: string;
  categorie: number;
  quantite: number;
  prix: number;
  stock: number;
  description: string;
  image?: string;
}

@Component({
  selector: 'app-aromes',
  imports: [CommonModule, FormsModule],
  templateUrl: './aromes.html',
  styleUrl: './aromes.css',
})
export class AromesComponent {
  constructor(
    private cdr: ChangeDetectorRef,
    private aromesService: AromesService
  ) {}

  // ================= NOTIFICATIONS =================
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  // ================= DATA =================
  aromes: Arome[] = [];
  filteredAromes: Arome[] = [];
  paginatedAromes: Arome[] = [];

  // ================= LOADING STATE =================
  isLoading = true;
  loadingError = false;

  // ================= FILE IMAGE =================
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  categories = [
    { value: '1', label: 'Classic' },
    { value: '2', label: 'Mentholé' },
    { value: '3', label: 'Fruité' },
    { value: '4', label: 'Boisson' },
    { value: '5', label: 'Gourmand' },
    { value: '6', label: 'Boosters/Additifs' }
  ];

  // ================= MODAL =================
  showModal = false;
  isEditing = false;
  currentArome: Arome = this.getEmptyArome();

  // ================= DELETE =================
  showDeleteModal = false;
  aromeToDelete: Arome | null = null;

  // ================= FILTRE =================
  selectedType: string = '';
  searchTerm = '';

  // ================= PAGINATION =================
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  private subscriptions: Subscription = new Subscription();

  ngOnInit() {
    console.log('ngOnInit - Chargement des aromes');
    this.loadAromes();
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
    getEmptyArome(): Arome {
      return {
        nom: '',
        marque: '',
        categorie: 0,
        quantite: 0,
        prix: 0,
        stock: 0,
        description: '',
        image: '',
          };
    }
  
  loadAromes() {
    console.log('loadAromes - Début du chargement');
    this.isLoading = true;
    this.loadingError = false;
    this.cdr.detectChanges();

    const sub = this.aromesService.getAromes()
    .pipe(
      timeout(30000),
      catchError(error => {
        console.error('Erreur détaillée:', error);
        this.loadingError = true;
        this.showToast('Erreur de connexion au serveur', 'error');
        return of({ data: [] });
      }),
      finalize(() => {
        console.log('loadAromes - Finalisation');
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
            this.aromes = [...data].sort((a: any, b: any) => (a.id || 0) - (b.id || 0));
          } else {
            console.warn('Les données ne sont pas un tableau:', data);
            this.aromes = [];
          }
          
          this.filteredAromes = [...this.aromes];
          this.currentPage = 1;
          this.updatePagination();
          
          console.log(`${this.aromes.length} aromes chargés`);
          
          if (this.aromes.length === 0 && !this.loadingError) {
            this.showToast('Aucun arome trouvé', 'success');
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
    saveArome() {  
      const formData = new FormData();
  
      const nom = this.capitalizeFirstLetter(this.currentArome.nom);
      const marque = this.capitalizeFirstLetter(this.currentArome.marque);
      const quantite = Number(this.currentArome.quantite);
      const description = this.capitalizeFirstLetter(this.currentArome.description);
      const categorie = Number(this.currentArome.categorie);
      const prix = Number(this.currentArome.prix);
      const stock = Number(this.currentArome.stock);
      
      if (!this.currentArome.nom) {
        this.showToast('Nom obligatoire', 'error');
        return;
      }

      if (!this.currentArome.marque) {
        this.showToast('Marque obligatoire', 'error');
        return;
      }
    
      if (!this.currentArome.quantite) {
        this.showToast('Quantite obligatoire', 'error');
        return;
      }

      if (!this.currentArome.categorie) {
        this.showToast('Categorie obligatoire', 'error');
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
      formData.append('categorie', categorie.toString());
      formData.append('quantite', quantite.toString());
      formData.append('prix', prix.toString());
      formData.append('stock', stock.toString());
      formData.append('description', description);
  
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }
  
      // CREATE
      if (!this.isEditing) {
        const sub = this.aromesService.createArome(formData).subscribe({
          next: () => {
            this.loadAromes();
            this.closeModal();
            this.showToast('Arome ajouté avec succès', 'success');
          },
          error: (err) => {
            console.error(err);
            this.showToast('Erreur ajout arome', 'error');
          }
        });
        this.subscriptions.add(sub);
        return;
      }
  
      // UPDATE
      const sub = this.aromesService.updateArome(this.currentArome.id!, formData)
        .subscribe({
          next: () => {
            this.loadAromes();
            this.closeModal();
            this.showToast('Arome modifié avec succès', 'success');
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
            this.showToast('Erreur modification arome', 'error');
          }
        });
      this.subscriptions.add(sub);
    }
  
  // ================= FILTER =================
  applyFilters() {
    let result = [...this.aromes];

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

    this.filteredAromes = result;
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
    this.currentArome = this.getEmptyArome();
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }

  openEditModal(arome: Arome) {
    console.log('Arome sélectionnée pour modification:', arome);

    this.isEditing = true;
    this.currentArome = { ...arome };
    this.selectedFile = null;
    this.imagePreview = null;
    this.showModal = true;
  }
  // ================= DELETE =================
  openDeleteModal(b: Arome) {
    this.aromeToDelete = b;
    this.showDeleteModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentArome = this.getEmptyArome();
    this.selectedFile = null;
    this.imagePreview = null;
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.aromeToDelete = null;
  }

  confirmDelete() {
    if (!this.aromeToDelete?.id) return;

    const sub = this.aromesService.deleteArome(this.aromeToDelete.id)
      .subscribe({
        next: () => {
          this.loadAromes();
          this.closeDeleteModal();
          this.showToast('Arome supprimé avec succès', 'success');
        },
        error: (err) => {
          console.error(err);
          this.showToast('Erreur suppression', 'error');
        }
      });
    this.subscriptions.add(sub);
  }

  getCategorieLabel(value: string | number): string {
    const categorie = this.categories.find(t => t.value == String(value));
    return categorie ? categorie.label : String(value);
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  
  // ================= PAGINATION =================
  updatePagination() {
    const list = this.filteredAromes ?? [];
    
    this.totalPages = Math.max(
      1,
      Math.ceil(list.length / this.itemsPerPage)
    );
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    this.paginatedAromes = list.slice(start, end);
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
  getTotalAromes() {
    return this.filteredAromes.length;
  }
  
  getStartIndex() {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex() {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredAromes.length
    );
  }

  // ================= RETRY LOADING =================
  retryLoading() {
    console.log('Retentative de chargement');
    this.loadAromes();
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
  
    return `${environment.storageUrl}/uploads/aromes/${image}`;
  }

}
