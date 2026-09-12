import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {

  private apiUrl = `${environment.apiUrl}/promotions`;

  constructor(private http: HttpClient) {}

  // ================= PROMOTIONS =================

  getPromotions() {
    return this.http.get(`${this.apiUrl}`);
  }

  createPromotion(formData: FormData) {
    return this.http.post(this.apiUrl, formData);
  }

  updatePromotion(id: number, data: FormData) {
    data.append('_method', 'PUT');

    return this.http.post(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  deletePromotion(id: number, type:'produit' | 'materiel') {
    return this.http.delete(
      `${this.apiUrl}/${type}/${id}`
    );
  }


  // ================= ARTICLES =================

  // TOUS LES PRODUITS
  getProduits() {
    return this.http.get(
      `${environment.apiUrl}/produits`
    );
  }

  // TOUS LES MATÉRIELS
  getMateriels() {
    return this.http.get(
      `${environment.apiUrl}/materiels`
    );
  }
}