import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProduitService {
  private apiUrl = 'http://127.0.0.1:8000/api/produits';

  constructor(private http: HttpClient) {}

  // LISTE
  getProduits() {
    return this.http.get(this.apiUrl);
  }

  // SHOW
  getProduit(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // CREATE
  createProduit(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  // UPDATE
  updateProduit(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  // DELETE
  deleteProduit(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
