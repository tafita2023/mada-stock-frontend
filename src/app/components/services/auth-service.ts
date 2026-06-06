import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // ================= LOGIN =================
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  // ================= REGISTER =================
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // ================= LOGOUT =================
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }
  
  // ================= STORAGE =================
  saveUser(data: any): void {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  }

  getUser(): any {

    if (typeof window === 'undefined') {
      return {};
    }

    return JSON.parse(localStorage.getItem('user') || '{}');
  }

  getToken(): string | null {

    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('token');
  }

  clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ================= AUTH CHECK =================
  isLoggedIn(): boolean {

    if (typeof window === 'undefined') {
      return false;
    }

    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}