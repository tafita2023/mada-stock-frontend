import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api';
  private authState = new BehaviorSubject<boolean>(false);
  authState$ = this.authState.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  initializeAuthState(): void {
    // Vérifier si on est dans le navigateur
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = this.getToken();
      const isLoggedIn = !!token;
      this.authState.next(isLoggedIn);
    } else {
      this.authState.next(false);
    }
  }
  
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
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).pipe(
      tap(() => {
        this.clearStorage();
        this.authState.next(false);
        this.router.navigate(['/login']);
      })
    );
  }  
  
  // ================= STORAGE =================
  saveUser(data: any): void {
    // Vérifier si on est dans le navigateur
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      }
      
      if (data && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      this.authState.next(true);
      
      // Vérification
      const savedToken = localStorage.getItem('token');
    }
  }

  getUser(): any {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : {};
    }
    return {};
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      return token;
    }
    return null;
  }

  clearStorage(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // ================= AUTH CHECK =================
  isLoggedIn(): boolean {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      const isLogged = !!token && token !== 'undefined' && token !== 'null';
      return isLogged;
    }
    return false;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }
}