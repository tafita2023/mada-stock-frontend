import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentRequest {
  amount: number;
  clientName: string;
  reference: string;
  description?: string;
  provider?: string;
  payerEmail?: string;
  payerPhone?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentLink?: string;
  data?: {
    paymentLink?: string;
    [key: string]: any;
  };
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private http = inject(HttpClient);

  createPayment(data: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${environment.apiUrl}/payments/create`,
      data
    );
  }
}