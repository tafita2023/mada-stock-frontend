import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Utilisateur {
  id?: number;
  nom: string;
  email: string;
  role: string;
  dateCreation?: Date;
}

@Component({
  selector: 'app-Utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Utilisateur.html',
  styleUrls: ['./Utilisateur.css']
})
export class UtilisateurComponent implements OnInit {
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
  utilisateurs: Utilisateur[] = [];
  filteredUtilisateurs: Utilisateur[] = [];
  paginatedUtilisateurs: Utilisateur[] = [];

  // ========================
  // MODAL AJOUT / EDIT
  // ========================
  showModal = false;
  isEditing = false;
  currentUtilisateur: Utilisateur = this.getEmptyUtilisateur();

  // ========================
  // DELETE MODAL
  // ========================
  showDeleteModal = false;
  UtilisateurToDelete: Utilisateur | null = null;

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
    this.loadUtilisateurs();
  }

  // ========================
  // LOAD DATA
  // ========================
  loadUtilisateurs() {
    this.utilisateurs = [
      { id: 1, nom: 'Rakoto Andry', email: 'andry.rakoto@gmail.com', role: 'admin', dateCreation: new Date() },
      { id: 2, nom: 'Rasoanaivo Fara', email: 'fara.rasoanaivo@gmail.com', role: 'user', dateCreation: new Date() },
      { id: 3, nom: 'Andrianina Tiana', email: 'tiana.andrianina@gmail.com', role: 'user', dateCreation: new Date() },
      { id: 4, nom: 'Rakotomalala Joël', email: 'joel.rakoto@gmail.com', role: 'manager', dateCreation: new Date() },
      { id: 5, nom: 'Raveloarison Miora', email: 'miora.ravelo@gmail.com', role: 'user', dateCreation: new Date() },
      { id: 6, nom: 'Razafindrakoto Lova', email: 'lova.razafindrakoto@gmail.com', role: 'admin', dateCreation: new Date() },
      { id: 7, nom: 'Ratsimbazafy Nina', email: 'nina.ratsimbazafy@gmail.com', role: 'user', dateCreation: new Date() },
      { id: 8, nom: 'Rakotonirina Hery', email: 'hery.rakotonirina@gmail.com', role: 'moderator', dateCreation: new Date() },
      { id: 9, nom: 'Andriamanitra Solo', email: 'solo.andriamanitra@gmail.com', role: 'user', dateCreation: new Date() },
      { id: 10, nom: 'Rajaonarison Tojo', email: 'tojo.rajaonarison@gmail.com', role: 'user', dateCreation: new Date() }
    ];

    this.filteredUtilisateurs = [...this.utilisateurs];
    this.updatePagination();
  }

  getEmptyUtilisateur(): Utilisateur {
    return {
      nom: '',
      email: '',
      role: ''
    };
  }

  // ========================
  // MODAL AJOUT / EDIT
  // ========================
  openAddModal() {
    this.isEditing = false;
    this.currentUtilisateur = this.getEmptyUtilisateur();
    this.showModal = true;
  }

  openEditModal(Utilisateur: Utilisateur) {
    this.isEditing = true;
    this.currentUtilisateur = { ...Utilisateur };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.currentUtilisateur = this.getEmptyUtilisateur();
  }

  // ========================
  // SAVE Utilisateur
  // ========================
  saveUtilisateur() {
    try {
      if (this.isEditing) {
        const index = this.utilisateurs.findIndex(
          p => p.id === this.currentUtilisateur.id
        );

        if (index !== -1) {
          this.utilisateurs[index] = {
            ...this.currentUtilisateur,
            dateCreation: this.utilisateurs[index].dateCreation
          };

          this.showToast('Utilisateur modifié avec succès', 'success');
        } else {
          this.showToast('Utilisateur introuvable', 'error');
        }

      } else {
        const newId = Math.max(...this.utilisateurs.map(p => p.id || 0), 0) + 1;

        this.currentUtilisateur.id = newId;
        this.currentUtilisateur.dateCreation = new Date();

        this.utilisateurs.push({ ...this.currentUtilisateur });

        this.showToast('Utilisateur ajouté avec succès', 'success');
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
  openDeleteModal(Utilisateur: Utilisateur) {
    this.UtilisateurToDelete = Utilisateur;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.UtilisateurToDelete = null;
  }

  confirmDelete() {
    try {
      if (!this.UtilisateurToDelete) return;

      this.utilisateurs = this.utilisateurs.filter(
        p => p.id !== this.UtilisateurToDelete!.id
      );

      this.applyFilters();
      this.closeDeleteModal();

      this.showToast('Utilisateur supprimé avec succès', 'success');

    } catch (error) {
      this.showToast('Erreur lors de la suppression', 'error');
    }
  }

  // ========================
  // FILTERS
  // ========================
  applyFilters() {
    let result = [...this.utilisateurs];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.nom.toLowerCase().includes(term)
      );
    }

    this.filteredUtilisateurs = result;

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
      this.filteredUtilisateurs.length / this.itemsPerPage
    );

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.paginatedUtilisateurs =
      this.filteredUtilisateurs.slice(startIndex, endIndex);
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
  getTotalUtilisateurs(): number {
    return this.filteredUtilisateurs.length;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  getEndIndex(): number {
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.filteredUtilisateurs.length
    );
  }

}