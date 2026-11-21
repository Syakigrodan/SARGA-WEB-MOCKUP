import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertComponent } from '../../shared/alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="brand-badge">SARGA</div>
        <h2 class="auth-title">Masuk ke Akun</h2>
        <p class="auth-subtitle">Sistem inventaris alat dan pencatatan peminjaman bersama</p>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <app-alert
            *ngIf="errorMessage"
            kind="error"
            title="Gagal masuk"
            [message]="errorMessage"
          ></app-alert>

          <div class="form-group">
            <label for="waNumber">Nomor WhatsApp</label>
            <input 
              id="waNumber" 
              type="text" 
              [(ngModel)]="waNumber" 
              name="waNumber" 
              required 
              placeholder="Contoh: 081234567890" 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="password">Kata Sandi</label>
            <input 
              id="password" 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              required 
              placeholder="••••••••" 
              class="form-control"
            />
          </div>

          <button type="submit" [disabled]="loading" class="btn btn-primary btn-block">
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>

        <div class="demo-hints">
          <p class="hint-title">Akun Uji Coba Demo:</p>
          <div class="hint-account" (click)="fillDemo('081234567890', 'Admin123!')">
            <span>👑 Pengurus: 081234567890 (Admin123!)</span>
          </div>
          <div class="hint-account" (click)="fillDemo('081299998888', 'Anggota123!')">
            <span>👤 Anggota: 081299998888 (Anggota123!)</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 180px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .auth-card {
      background: #ffffff;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-card);
      padding: 2.5rem 2rem;
      width: 100%;
      max-width: 420px;
      box-shadow: var(--shadow-subtle);
    }
    .brand-badge {
      display: inline-block;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
      color: var(--color-accent);
      background: var(--color-accent-soft);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-pill);
      margin-bottom: 1rem;
    }
    .auth-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0 0 0.25rem 0;
    }
    .auth-subtitle {
      font-size: 0.875rem;
      color: var(--color-muted);
      margin: 0 0 1.5rem 0;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .auth-form app-alert {
      display: block;
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
      color: var(--color-ink-2);
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-input);
      font-size: 0.95rem;
      outline: none;
    }
    .form-control:focus {
      border-color: var(--color-focus);
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }
    .btn-block {
      width: 100%;
      padding: 0.75rem;
      margin-top: 0.5rem;
    }
    .demo-hints {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px dashed var(--color-rule);
      font-size: 0.8rem;
    }
    .hint-title {
      color: var(--color-muted);
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .hint-account {
      padding: 0.35rem 0.6rem;
      background: var(--color-paper-2);
      border-radius: 6px;
      margin-bottom: 0.35rem;
      cursor: pointer;
      color: var(--color-ink-2);
      transition: background 0.15s ease;
    }
    .hint-account:hover {
      background: var(--color-paper-3);
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  waNumber = '';
  password = '';
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (!this.waNumber || !this.password) {
      this.errorMessage = 'Nomor WhatsApp dan kata sandi wajib diisi.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ waNumber: this.waNumber, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || err.error?.error || 'Gagal masuk. Periksa nomor WhatsApp dan kata sandi.';
      }
    });
  }

  fillDemo(wa: string, pass: string): void {
    this.waNumber = wa;
    this.password = pass;
  }
}
