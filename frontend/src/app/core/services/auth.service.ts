import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Membership } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  private userSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.userSubject.asObservable();

  currentUser = signal<User | null>(null);
  activeMembership = signal<Membership | null>(null);

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('sarga_token');
  }

  isAdmin(): boolean {
    const membership = this.activeMembership();
    return membership?.role === 'ADMIN';
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('sarga_token', res.token);
          this.setUser(res.user);
        }
      })
    );
  }

  login(credentials: { waNumber: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('sarga_token', res.token);
          this.setUser(res.user);
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
    this.setUser(null);
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

  private setUser(user: User | null): void {
    if (user && !user.name) {
      user.name = user.fullName;
    }
    this.currentUser.set(user);
    this.userSubject.next(user);
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem('sarga_token');
    if (token) {
      this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/me`).subscribe({
        next: (res) => {
          this.setUser(res.user);
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
