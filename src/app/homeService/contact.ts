import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/message`;

  constructor(private http: HttpClient) {}

    // CREATE - Modifié pour accepter FormData
    sendMessage(formData: FormData) {
      // Important : Ne pas définir Content-Type, laissez le navigateur le faire
      return this.http.post(this.apiUrl, formData);
    }
    
}
