import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AromesService {
  private apiUrl = `${environment.apiUrl}/diy/aromes`;

  constructor(private http: HttpClient) {}

    // LISTE
    getAromes() {
      return this.http.get(this.apiUrl);
    }
    
    // SHOW
    getArome(id: number) {
      return this.http.get(`${this.apiUrl}/${id}`);
    }
  
    // CREATE - Modifié pour accepter FormData
    createArome(formData: FormData) {
      // Important : Ne pas définir Content-Type, laissez le navigateur le faire
      return this.http.post(this.apiUrl, formData);
    }
  
    // UPDATE
    updateArome(id: number, data: FormData) {
      data.append('_method', 'PUT');
      return this.http.post(`${this.apiUrl}/${id}`, data);
        }
  
    // DELETE
    deleteArome(id: number) {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }

}
