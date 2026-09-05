import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NicotineService {

  private apiUrl = environment.apiUrl;

  private refreshSubject = new BehaviorSubject<void>(undefined);
  refresh$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) {}

  getNicotines(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/nicotines`);
  }

  getNicotine(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/nicotines/${id}`);
  }

  triggerRefresh(): void {
    this.refreshSubject.next();
  }
}