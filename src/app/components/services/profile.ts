import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  // GET profil
  getProfile() {
    return this.http.get(this.apiUrl);
  }

  // UPDATE profil
  updateProfile(formData: FormData) {
    return this.http.post(this.apiUrl, formData);
  }
}
