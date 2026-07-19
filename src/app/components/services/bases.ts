import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BasesService {

  private apiUrl = `${environment.apiUrl}/diy/bases`;

  constructor(private http: HttpClient) {}

    // LISTE
    getBases() {
      return this.http.get(this.apiUrl);
    }
    
    // SHOW
    getBase(id: number) {
      return this.http.get(`${this.apiUrl}/${id}`);
    }
  
    // CREATE - Modifié pour accepter FormData
    createBase(formData: FormData) {
      // Important : Ne pas définir Content-Type, laissez le navigateur le faire
      return this.http.post(this.apiUrl, formData);
    }
  
    // UPDATE
    updateBase(id: number, data: FormData) {
      data.append('_method', 'PUT');
      return this.http.post(`${this.apiUrl}/${id}`, data);
        }
  
    // DELETE
    deleteBase(id: number) {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }

}
