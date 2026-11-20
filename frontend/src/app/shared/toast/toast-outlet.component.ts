import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastKind, ToastService } from './toast.service';

@Component({
  selector: 'app-toast-outlet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="toast-stack" aria-label="Notifikasi">
      <article
        *ngFor="let toast of toastService.messages()"
        class="toast"
        [ngClass]="'toast-' + toast.kind"
        [attr.role]="toast.kind === 'error' ? 'alert' : 'status'"
        [attr.aria-live]="toast.kind === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-content">
          <strong>{{ kindLabel(toast.kind) }}</strong>
          <p>{{ toast.message }}</p>
        </div>
        <button
          type="button"
          class="toast-dismiss"
          aria-label="Tutup notifikasi"
          (click)="toastService.dismiss(toast.id)"
        >×</button>
      </article>
    </section>
  `,
  styles: [`
    .toast-stack {
      position: fixed;
      z-index: 1000;
      top: 1rem;
      right: 1rem;
      display: grid;
      gap: 0.75rem;
      width: min(26rem, calc(100vw - 2rem));
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border: 1px solid;
      border-radius: var(--radius-input);
      background: #ffffff;
      box-shadow: var(--shadow-floating);
      pointer-events: auto;
    }

    .toast-content {
      min-width: 0;
    }

    .toast-content p {
      margin: 0.2rem 0 0;
      overflow-wrap: anywhere;
    }

    .toast-success {
      color: var(--color-success-ink);
      border-color: var(--color-success-border);
    }

    .toast-error {
      color: var(--color-rose-ink);
      border-color: var(--color-rose-border);
    }

    .toast-warning {
      color: var(--color-amber-ink);
      border-color: var(--color-amber-border);
    }

    .toast-info {
      color: var(--color-accent-soft-ink);
      border-color: var(--color-accent-border);
    }

    .toast-dismiss {
      flex: 0 0 44px;
      min-width: 44px;
      min-height: 44px;
      border: 0;
      border-radius: var(--radius-input);
      background: transparent;
      color: var(--color-ink-2);
      font-size: 1.5rem;
      line-height: 1;
    }

    .toast-dismiss:hover {
      background: var(--color-paper-2);
    }

    .toast-dismiss:active {
      background: var(--color-paper-3);
    }

    .toast-dismiss:focus-visible {
      outline: 3px solid var(--color-focus);
      outline-offset: 2px;
    }

    @media (max-width: 480px) {
      .toast-stack {
        top: 0.75rem;
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
      }
    }
  `]
})
export class ToastOutletComponent {
  readonly toastService = inject(ToastService);

  kindLabel(kind: ToastKind): string {
    const labels: Record<ToastKind, string> = {
      success: 'Berhasil',
      error: 'Gagal',
      warning: 'Perhatian',
      info: 'Informasi'
    };
    return labels[kind];
  }
}
