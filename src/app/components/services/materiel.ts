import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MaterielService {
  private apiUrl = `${environment.apiUrl}/materiels`;

  constructor(private http: HttpClient) {}

    // LISTE
    getMateriels() {
      return this.http.get(this.apiUrl);
    }
  
    // SHOW
    getMateriel(id: number) {
      return this.http.get(`${this.apiUrl}/${id}`);
    }
  
    // CREATE - Modifié pour accepter FormData
    createMateriel(formData: FormData) {
      // Important : Ne pas définir Content-Type, laissez le navigateur le faire
      return this.http.post(this.apiUrl, formData);
    }
  
    // UPDATE
    updateMateriel(id: number, data: FormData) {
      data.append('_method', 'PUT');
      return this.http.post(`${this.apiUrl}/${id}`, data);
        }
  
    // DELETE
    deleteMateriel(id: number) {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }
  }

