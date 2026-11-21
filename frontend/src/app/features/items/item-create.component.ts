import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Item } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ItemService } from '../../core/services/item.service';
import { AlertComponent } from '../../shared/alert/alert.component';

interface ItemCreateForm {
  name: string;
  description: string;
  location: string;
  maxDays: number | null;
  contents: string;
  instructions: string;
  isSafeAndReady: boolean;
}

@Component({
  selector: 'app-item-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AlertComponent],
  template: `
    <div class="page-shell">
      <section class="form-panel" aria-labelledby="create-item-title">
        <a routerLink="/katalog" class="back-link">Kembali ke katalog</a>
        <h1 id="create-item-title">Daftar barang baru</h1>
        <p class="intro">Barang yang disimpan akan langsung tersedia di katalog organisasi aktif.</p>

        <app-alert
          *ngIf="!canCreateItems"
          kind="warning"
          title="Keanggotaan terverifikasi diperlukan"
          [message]="membershipMessage"
        />
        <app-alert
          *ngIf="canCreateItems && !createdItem"
          kind="info"
          title="Batas fitur saat ini"
          message="API belum mendukung kategori atau unggah foto. Barang akan memakai gambar placeholder sampai dukungan foto tersedia."
        />
        <app-alert
          *ngIf="errorMessage"
          kind="error"
          title="Barang gagal disimpan"
          [message]="errorMessage"
        />
        <app-alert
          *ngIf="successMessage"
          kind="success"
          title="Barang berhasil disimpan"
          [message]="successMessage"
        />

        <p *ngIf="saving" class="loading-message" role="status" aria-live="polite">
          Menyimpan barang ke katalog...
        </p>

        <form
          *ngIf="canCreateItems && !createdItem"
          (ngSubmit)="onSubmit()"
          class="form-layout"
          [attr.aria-busy]="saving"
        >
          <div class="form-field">
            <label for="item-name">Nama barang</label>
            <input id="item-name" name="name" type="text" required [(ngModel)]="form.name" />
          </div>

          <div class="form-field">
            <label for="item-description">Catatan kondisi</label>
            <textarea
              id="item-description"
              name="description"
              rows="3"
              maxlength="250"
              required
              [(ngModel)]="form.description"
            ></textarea>
          </div>

          <div class="form-field">
            <label for="item-location">Lokasi penyimpanan atau pengambilan</label>
            <input id="item-location" name="location" type="text" required [(ngModel)]="form.location" />
          </div>

          <div class="form-field">
            <label for="item-max-days">Maksimal masa pinjam (hari)</label>
            <input
              id="item-max-days"
              name="maxDays"
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              required
              [(ngModel)]="form.maxDays"
            />
          </div>

          <div class="form-field">
            <label for="item-contents">Kelengkapan barang (opsional, satu per baris)</label>
            <textarea
              id="item-contents"
              name="contents"
              rows="3"
              [(ngModel)]="form.contents"
            ></textarea>
          </div>

          <div class="form-field">
            <label for="item-instructions">Petunjuk penggunaan atau pengambilan</label>
            <textarea
              id="item-instructions"
              name="instructions"
              rows="3"
              maxlength="250"
              required
              [(ngModel)]="form.instructions"
            ></textarea>
          </div>

          <label class="safety-check">
            <input
              name="isSafeAndReady"
              type="checkbox"
              required
              [(ngModel)]="form.isSafeAndReady"
            />
            <span>Saya menyatakan barang aman dan layak digunakan.</span>
          </label>

          <button type="submit" class="submit-button" [disabled]="saving">
            {{ saving ? 'Menyimpan barang...' : 'Simpan ke katalog' }}
          </button>
        </form>

        <a *ngIf="createdItem" class="detail-link" [routerLink]="['/katalog', createdItem.id]">
          Lihat barang di katalog
        </a>
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
      max-width: 680px;
      padding: clamp(1.25rem, 4vw, 2rem);
      border: 1px solid var(--color-rule);
      border-radius: var(--radius-card);
      background: #ffffff;
      box-shadow: var(--shadow-subtle);
    }
    .back-link,
    .detail-link {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      color: var(--color-accent);
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 0.15em;
    }
    .back-link {
      margin-bottom: 0.5rem;
    }
    .back-link:hover,
    .detail-link:hover {
      color: var(--color-ink);
    }
    .back-link:active,
    .detail-link:active {
      text-decoration-thickness: 2px;
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
    .form-field label {
      color: var(--color-ink-2);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
    }
    input:not([type="checkbox"]),
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
    input:not([type="checkbox"]):hover:not(:focus-visible),
    textarea:hover:not(:focus-visible) {
      border-color: var(--color-muted);
    }
    input[type="checkbox"] {
      width: 1.25rem;
      height: 1.25rem;
      flex: 0 0 auto;
      accent-color: var(--color-accent);
      cursor: pointer;
    }
    .safety-check {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: 44px;
      padding: 0.5rem 0;
      color: var(--color-ink);
      line-height: 1.45;
      cursor: pointer;
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
  `]
})
export class ItemCreateComponent {
  private readonly authService = inject(AuthService);
  private readonly itemService = inject(ItemService);

  form: ItemCreateForm = {
    name: '',
    description: '',
    location: '',
    maxDays: null,
    contents: '',
    instructions: '',
    isSafeAndReady: false
  };
  saving = false;
  errorMessage = '';
  successMessage = '';
  createdItem: Item | null = null;

  get canCreateItems(): boolean {
    return this.authService.activeMembership()?.status === 'TERVERIFIKASI';
  }

  get membershipMessage(): string {
    const membership = this.authService.activeMembership();
    if (!membership) return 'Pilih organisasi tempat Anda menjadi anggota terverifikasi melalui menu organisasi.';
    if (membership.status === 'MENUNGGU_VERIFIKASI') return 'Keanggotaan Anda masih menunggu verifikasi pengurus.';
    if (membership.status === 'DITOLAK') return 'Keanggotaan Anda ditolak. Hubungi pengurus organisasi untuk informasi lebih lanjut.';
    return 'Pilih organisasi aktif yang keanggotaannya sudah terverifikasi.';
  }

  onSubmit(): void {
    if (this.saving) return;

    const membership = this.authService.activeMembership();
    if (!membership || membership.status !== 'TERVERIFIKASI') {
      this.errorMessage = 'Keanggotaan terverifikasi diperlukan untuk mendaftarkan barang.';
      return;
    }
    if (this.form.maxDays === null || !Number.isInteger(this.form.maxDays) || this.form.maxDays < 1) {
      this.errorMessage = 'Masa pinjam harus berupa bilangan bulat minimal 1 hari.';
      return;
    }
    if (!this.form.isSafeAndReady) {
      this.errorMessage = 'Pernyataan barang aman dan layak digunakan harus disetujui.';
      return;
    }

    const name = this.form.name.trim();
    const description = this.form.description.trim();
    const location = this.form.location.trim();
    const instructions = this.form.instructions.trim();
    if (!name || !description || !location || !instructions) {
      this.errorMessage = 'Lengkapi semua field wajib sebelum menyimpan barang.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const itemData: Partial<Item> = {
      orgId: membership.orgId,
      name,
      description,
      location,
      maxDays: this.form.maxDays,
      contents: this.form.contents.split(/\r?\n/).map(entry => entry.trim()).filter(Boolean),
      instructions,
      isSafeAndReady: this.form.isSafeAndReady
    };

    this.itemService.createItem(itemData).subscribe({
      next: response => {
        this.saving = false;
        this.createdItem = response.item;
        this.successMessage = response.message || 'Barang berhasil disimpan ke katalog.';
      },
      error: (error: HttpErrorResponse) => {
        this.saving = false;
        this.errorMessage = error.error?.message || 'Barang gagal disimpan. Coba lagi.';
      }
    });
  }
}
