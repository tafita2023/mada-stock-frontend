import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PacksService {
  private apiUrl = `${environment.apiUrl}/diy/packs`;

  constructor(private http: HttpClient) {}

    // LISTE
    getPacks() {
      return this.http.get(this.apiUrl);
    }
    
    // SHOW
    getPack(id: number) {
      return this.http.get(`${this.apiUrl}/${id}`);
    }
  
    // CREATE - Modifié pour accepter FormData
    createPack(formData: FormData) {
      // Important : Ne pas définir Content-Type, laissez le navigateur le faire
      return this.http.post(this.apiUrl, formData);
    }
  
    // UPDATE
    updatePack(id: number, data: FormData) {
      data.append('_method', 'PUT');
      return this.http.post(`${this.apiUrl}/${id}`, data);
        }
  
    // DELETE
    deletePack(id: number) {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }

}
