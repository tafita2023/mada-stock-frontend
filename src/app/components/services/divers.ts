import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DiversService {
  private apiUrl = `${environment.apiUrl}/diy/divers`;

  constructor(private http: HttpClient) {}

    // LISTE
    getDivers() {
      return this.http.get(this.apiUrl);
    }
    
    // SHOW
    getDiver(id: number) {
      return this.http.get(`${this.apiUrl}/${id}`);
    }
  
    // CREATE - Modifié pour accepter FormData
    createDiver(formData: FormData) {
      // Important : Ne pas définir Content-Type, laissez le navigateur le faire
      return this.http.post(this.apiUrl, formData);
    }
  
    // UPDATE
    updateDiver(id: number, data: FormData) {
      data.append('_method', 'PUT');
      return this.http.post(`${this.apiUrl}/${id}`, data);
        }
  
    // DELETE
    deleteDiver(id: number) {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }

}
