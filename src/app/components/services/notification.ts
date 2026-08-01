import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private apiUrl = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}


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