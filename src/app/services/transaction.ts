import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface TransactionData {
  id?: number;
  amount: number;
  date?: string;
  category?: string;
  description?: string;
  type: 'income' | 'expense';
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll(): Observable<TransactionData[]> {
    return this.http.get<TransactionData[]>(`${this.apiUrl}/transactions`, {
      headers: this.getHeaders(),
    });
  }

  create(transaction: Omit<TransactionData, 'id' | 'date'>): Observable<TransactionData> {
    return this.http.post<TransactionData>(`${this.apiUrl}/transactions`, transaction, {
      headers: this.getHeaders(),
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/transactions/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
