import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = 'http://127.0.0.1:8000/api/profile';

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
