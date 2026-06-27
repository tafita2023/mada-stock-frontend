import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProduitService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  // LISTE
  getProduits() {
    return this.http.get(this.apiUrl);
  }

  // SHOW
  getProduit(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // CREATE - Modifié pour accepter FormData
  createProduit(formData: FormData) {
    // Important : Ne pas définir Content-Type, laissez le navigateur le faire
    return this.http.post(this.apiUrl, formData);
  }

  // UPDATE
  updateProduit(id: number, data: FormData) {
    data.append('_method', 'PUT');
    return this.http.post(`${this.apiUrl}/${id}`, data);
      }

  // DELETE
  deleteProduit(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}