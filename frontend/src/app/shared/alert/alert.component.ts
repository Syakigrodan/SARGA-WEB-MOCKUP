import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertKind = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section
      class="alert"
      [ngClass]="'alert-' + kind"
      [attr.role]="kind === 'error' ? 'alert' : 'status'"
      [attr.aria-live]="kind === 'error' ? 'assertive' : 'polite'"
    >
      <strong *ngIf="title">{{ title }}</strong>
      <p>{{ message }}</p>
    </section>
  `,
  styles: [`
    .alert {
      padding: 0.875rem 1rem;
      border: 1px solid;
      border-radius: var(--radius-input);
      overflow-wrap: anywhere;
    }

    .alert p {
      margin: 0;
    }

    .alert strong + p {
      margin-top: 0.25rem;
    }

    .alert-success {
      color: var(--color-success-ink);
      background: var(--color-success-soft);
      border-color: var(--color-success-border);
    }

    .alert-error {
      color: var(--color-rose-ink);
      background: var(--color-rose-soft);
      border-color: var(--color-rose-border);
    }

    .alert-warning {
      color: var(--color-amber-ink);
      background: var(--color-amber-soft);
      border-color: var(--color-amber-border);
    }

    .alert-info {
      color: var(--color-accent-soft-ink);
      background: var(--color-accent-soft);
      border-color: var(--color-accent-border);
    }
  `]
})
export class AlertComponent {
  @Input({ required: true }) message = '';
  @Input() kind: AlertKind = 'info';
  @Input() title = '';
}
