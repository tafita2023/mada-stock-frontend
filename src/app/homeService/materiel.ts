import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaterielService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  private refreshSubject = new BehaviorSubject<void>(undefined);
  refresh$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMateriels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/materiels`);
  }

  getMateriel(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/materiels/${id}`);
  }

  triggerRefresh(): void {
    this.refreshSubject.next();
  }
}