import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertComponent } from '../../shared/alert/alert.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AlertComponent],
  template: `
    <div class="page-shell">
      <section class="form-panel" aria-labelledby="register-title">
        <h1 id="register-title">Daftar dan gabung organisasi</h1>
        <p class="intro">
          Buat akun menggunakan kode undangan organisasi. Keanggotaan baru menunggu verifikasi pengurus.
        </p>

        <app-alert
          *ngIf="!successMessage"
          kind="info"
          title="Pendaftaran saat ini"
          message="OTP WhatsApp dan unggah dokumen belum tersedia pada API. Pendaftaran tetap dikirim untuk menunggu verifikasi pengurus."
        />
        <app-alert
          *ngIf="errorMessage"
          kind="error"
          title="Pendaftaran gagal"
          [message]="errorMessage"
        />
        <app-alert
          *ngIf="successMessage"
          kind="success"
          title="Pendaftaran berhasil"
          [message]="successMessage"
        />

        <p *ngIf="loading" class="loading-message" role="status" aria-live="polite">
          Mengirim data pendaftaran...
        </p>

        <form *ngIf="!successMessage" (ngSubmit)="onSubmit()" class="form-layout" [attr.aria-busy]="loading">
          <div class="form-field">
            <label for="register-full-name">Nama lengkap</label>
            <input
              id="register-full-name"
              name="fullName"
              type="text"
              autocomplete="name"
              required
              [(ngModel)]="form.fullName"
            />
          </div>

          <div class="form-field">
            <label for="register-wa-number">Nomor WhatsApp</label>
            <input
              id="register-wa-number"
              name="waNumber"
              type="tel"
              autocomplete="tel"
              inputmode="tel"
              required
              placeholder="Contoh: 081234567890"
              [(ngModel)]="form.waNumber"
            />
          </div>

          <div class="form-field">
            <label for="register-password">Kata sandi</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              [(ngModel)]="form.password"
            />
          </div>

          <div class="form-field">
            <label for="register-address">Alamat</label>
            <textarea
              id="register-address"
              name="address"
              autocomplete="street-address"
              rows="3"
              [(ngModel)]="form.address"
            ></textarea>
          </div>

          <div class="form-field">
            <label for="register-invite-code">Kode undangan organisasi</label>
            <input
              id="register-invite-code"
              name="inviteCode"
              type="text"
              autocomplete="off"
              autocapitalize="characters"
              required
              [(ngModel)]="form.inviteCode"
            />
          </div>

          <button type="submit" class="submit-button" [disabled]="loading">
            {{ loading ? 'Mengirim pendaftaran...' : 'Daftar' }}
          </button>
        </form>

        <div *ngIf="successMessage" class="success-actions">
          <a routerLink="/katalog">Lihat katalog</a>
        </div>

        <p *ngIf="!successMessage" class="login-prompt">
          Sudah memiliki akun? <a routerLink="/auth/login">Masuk</a>
        </p>
      </section>
    </div>
  `,
  styles: [`
    .page-shell {
      display: flex;
      justify-content: center;
      padding: clamp(1.5rem, 5vw, 3rem) 0;
    }
    .form-panel {
      width: 100%;
      max-width: 600px;
      padding: clamp(1.25rem, 4vw, 2rem);
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-card);
      background: #ffffff;
      box-shadow: var(--shadow-subtle);
    }
    h1 {
      margin: 0;
      color: var(--color-ink);
      font-size: clamp(1.5rem, 4vw, 2rem);
      line-height: 1.2;
    }
    .intro {
      margin: 0.75rem 0 1.25rem;
      color: var(--color-muted);
      line-height: 1.55;
    }
    app-alert {
      display: block;
      margin: 1rem 0;
    }
    .form-layout {
      display: grid;
      gap: 1rem;
      margin-top: 1.25rem;
    }
    .form-field {
      display: grid;
      gap: 0.4rem;
    }
    label {
      color: var(--color-ink-2);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
    }
    input,
    textarea {
      width: 100%;
      min-height: 44px;
      padding: 0.65rem 0.75rem;
      border: 1px solid var(--color-muted-light);
      border-radius: var(--radius-input);
      background: #ffffff;
      color: var(--color-ink);
      font: inherit;
    }
    textarea {
      min-height: 6rem;
      resize: vertical;
    }
    input:hover:not(:focus-visible),
    textarea:hover:not(:focus-visible) {
      border-color: var(--color-muted);
    }
    input:focus-visible,
    textarea:focus-visible,
    a:focus-visible,
    button:focus-visible {
      outline: 3px solid var(--color-focus);
      outline-offset: 2px;
    }
    .submit-button {
      min-height: 44px;
      padding: 0.65rem 1rem;
      border: 1px solid var(--color-accent);
      border-radius: var(--radius-input);
      background: var(--color-accent);
      color: #ffffff;
      font: inherit;
      font-weight: 600;
      cursor: pointer;
    }
    .submit-button:hover:not(:disabled) {
      filter: brightness(0.92);
    }
    .submit-button:active:not(:disabled) {
      transform: translateY(1px);
    }
    .submit-button:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }
    .loading-message {
      color: var(--color-ink);
    }
    .login-prompt {
      margin: 1.25rem 0 0;
      color: var(--color-muted);
    }
    .login-prompt a,
    .success-actions a {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      color: var(--color-accent);
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }
    .login-prompt a:hover,
    .success-actions a:hover {
      color: var(--color-ink);
    }
    .login-prompt a:active,
    .success-actions a:active {
      text-decoration-thickness: 2px;
    }
    .success-actions {
      margin-top: 1rem;
    }
    @media (max-width: 600px) {
      .form-panel {
        padding: 1.25rem 1rem;
      }
    }
  `]
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);

  form = {
    fullName: '',
    waNumber: '',
    password: '',
    address: '',
    inviteCode: ''
  };
  loading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (this.loading) return;

    if (!this.form.fullName.trim() || !this.form.waNumber.trim() || !this.form.inviteCode.trim()) {
      this.errorMessage = 'Nama, nomor WhatsApp, dan kode undangan wajib diisi.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.authService.register({
      ...this.form,
      fullName: this.form.fullName.trim(),
      waNumber: this.form.waNumber.trim(),
      address: this.form.address.trim(),
      inviteCode: this.form.inviteCode.trim().toUpperCase()
    }).subscribe({
      next: response => {
        this.loading = false;
        this.successMessage = response.message;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Pendaftaran tidak berhasil. Periksa data dan kode undangan.';
      }
    });
  }
}
