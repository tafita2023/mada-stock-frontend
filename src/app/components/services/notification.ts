import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  private unreadCountSubject = new BehaviorSubject<number>(0);

  unreadCount$ = this.unreadCountSubject.asObservable();

  setUnreadCount(count: number): void { 
    this.unreadCountSubject.next( Math.max(0, count) ); 
  }

  incrementUnreadCount(): void {
    this.unreadCountSubject.next( 
      this.unreadCountSubject.value + 1 );
  } 

  decrementUnreadCount(): void { 
    const current = this.unreadCountSubject.value; 
    if (current > 0) { 
      this.unreadCountSubject.next(current - 1); 
    } 
  }

  getUnreadCount(): number { 
    return this.unreadCountSubject.value; 
  }

  // LISTE
  getMessages() {
    return this.http.get<any[]>(this.apiUrl);
  }


  // SHOW
  getMessage(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


  // READ
  markAsRead(id: number) {
    return this.http.put(
      `${this.apiUrl}/${id}/read`,
      {}
    );
  }


  // DELETE
  deleteMessage(id: number) {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

}