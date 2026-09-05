import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NicotinesService {
  private apiUrl = `${environment.apiUrl}/nicotines`;

  constructor(private http: HttpClient) {}

    // LISTE
    getNicotines() {
      return this.http.get(this.apiUrl);
    }
    
    // SHOW
    getNicotine(id: number) {
      return this.http.get(`${this.apiUrl}/${id}`);
    }
  
    // CREATE - Modifié pour accepter FormData
    createNicotine(formData: FormData) {
      // Important : Ne pas définir Content-Type, laissez le navigateur le faire
      return this.http.post(this.apiUrl, formData);
    }
  
    // UPDATE
    updateNicotine(id: number, data: FormData) {
      data.append('_method', 'PUT');
      return this.http.post(`${this.apiUrl}/${id}`, data);
        }
  
    // DELETE
    deleteNicotine(id: number) {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }

}
