import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Membership } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  currentUser = signal<User | null>(null);
  activeMembership = signal<Membership | null>(null);

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('sarga_token', res.token);
          this.currentUser.set(res.user);
        }
      })
    );
  }

  login(credentials: { waNumber: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('sarga_token', res.token);
          this.currentUser.set(res.user);
          if (res.user.memberships && res.user.memberships.length > 0) {
            this.setActiveOrg(res.user.memberships[0].orgId);
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('sarga_token');
    localStorage.removeItem('sarga_active_org_id');
    this.currentUser.set(null);
    this.activeMembership.set(null);
  }

  setActiveOrg(orgId: string): void {
    localStorage.setItem('sarga_active_org_id', orgId);
    const user = this.currentUser();
    if (user && user.memberships) {
      const match = user.memberships.find(m => m.orgId === orgId) || null;
      this.activeMembership.set(match);
    }
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('sarga_token');
    if (token) {
      this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`).subscribe({
        next: (res) => {
          this.currentUser.set(res.user);
          const activeOrgId = localStorage.getItem('sarga_active_org_id');
          if (activeOrgId) {
            this.setActiveOrg(activeOrgId);
          } else if (res.user.memberships && res.user.memberships.length > 0) {
            this.setActiveOrg(res.user.memberships[0].orgId);
          }
        },
        error: () => this.logout()
      });
    }
  }
}
