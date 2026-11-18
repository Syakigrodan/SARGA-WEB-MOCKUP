import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoanTransaction, ApiResponse } from '../models';

export interface CreateLoanPayload {
  itemId: string;
  expectedReturnDate: string;
  purpose: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/loans`;

  getMyLoans(): Observable<ApiResponse<LoanTransaction[]>> {
    return this.http.get<ApiResponse<LoanTransaction[]>>(`${this.baseUrl}/me`);
  }

  getOrganizationLoans(status?: string): Observable<ApiResponse<LoanTransaction[]>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<LoanTransaction[]>>(this.baseUrl, { params });
  }

  requestLoan(payload: CreateLoanPayload): Observable<ApiResponse<LoanTransaction>> {
    return this.http.post<ApiResponse<LoanTransaction>>(this.baseUrl, payload);
  }

  approveLoan(loanId: string): Observable<ApiResponse<LoanTransaction>> {
    return this.http.patch<ApiResponse<LoanTransaction>>(`${this.baseUrl}/${loanId}/approve`, {});
  }

  rejectLoan(loanId: string, reason?: string): Observable<ApiResponse<LoanTransaction>> {
    return this.http.patch<ApiResponse<LoanTransaction>>(`${this.baseUrl}/${loanId}/reject`, { reason });
  }

  returnLoan(loanId: string, notes?: string): Observable<ApiResponse<LoanTransaction>> {
    return this.http.patch<ApiResponse<LoanTransaction>>(`${this.baseUrl}/${loanId}/return`, { notes });
  }
}
