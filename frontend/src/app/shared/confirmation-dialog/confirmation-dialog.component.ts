import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <dialog
      #dialog
      class="confirmation-dialog"
      [attr.aria-label]="title"
      (cancel)="onNativeCancel($event)"
    >
      <h2>{{ title }}</h2>
      <p *ngIf="message" id="confirmation-message">{{ message }}</p>
      <div class="dialog-actions">
        <button type="button" class="btn btn-outline" (click)="onCancel()">
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="btn confirm-button"
          [class.confirm-destructive]="destructive"
          (click)="onConfirm()"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </dialog>
  `,
  styles: [`
    .confirmation-dialog {
      width: min(32rem, calc(100vw - 2rem));
      max-width: calc(100vw - 2rem);
      padding: 1.5rem;
      border: 1px solid var(--color-muted);
      border-radius: var(--radius-card);
      color: var(--color-ink);
      box-shadow: var(--shadow-floating);
    }

    .confirmation-dialog::backdrop {
      background: rgba(17, 17, 17, 0.48);
    }

    .confirmation-dialog h2 {
      margin: 0;
      font-size: 1.25rem;
    }

    .confirmation-dialog p {
      margin: 0.75rem 0 0;
      color: var(--color-ink-2);
      overflow-wrap: anywhere;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }

    .dialog-actions .btn {
      min-width: 6rem;
      min-height: 44px;
    }

    .confirm-button {
      background: var(--color-ink);
      color: #ffffff;
    }

    .confirm-button:hover {
      background: var(--color-ink-hover);
    }

    .confirm-button:active {
      background: #000000;
    }

    .confirm-button.confirm-destructive {
      background: var(--color-rose-ink);
      color: #ffffff;
    }

    .confirm-button.confirm-destructive:hover {
      background: #741827;
    }

    button:focus-visible {
      outline: 3px solid var(--color-focus);
      outline-offset: 2px;
    }

    @media (max-width: 480px) {
      .dialog-actions {
        flex-direction: column-reverse;
      }

      .dialog-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class ConfirmationDialogComponent implements AfterViewInit, OnChanges {
  @Input() open = false;
  @Input() title = 'Konfirmasi tindakan';
  @Input() message = '';
  @Input() confirmLabel = 'Konfirmasi';
  @Input() cancelLabel = 'Batal';
  @Input() destructive = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('dialog') private dialogRef?: ElementRef<HTMLDialogElement>;

  ngAfterViewInit(): void {
    this.syncOpenState();
  }

  ngOnChanges(): void {
    this.syncOpenState();
  }

  onNativeCancel(event: Event): void {
    event.preventDefault();
    this.onCancel();
  }

  onCancel(): void {
    this.closeDialog();
    this.cancelled.emit();
  }

  onConfirm(): void {
    this.closeDialog();
    this.confirmed.emit();
  }

  private syncOpenState(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (!dialog) return;

    if (this.open && !dialog.open) {
      dialog.showModal();
    } else if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  private closeDialog(): void {
    const dialog = this.dialogRef?.nativeElement;
    if (dialog?.open) dialog.close();
  }
}
