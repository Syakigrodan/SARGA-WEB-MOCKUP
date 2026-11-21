import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ItemStatus, LoanStatus } from '../../core/models';
import { ITEM_LABELS, LOAN_LABELS, Perspective } from './status-labels';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="'badge tone-' + info().tone">{{ info().label }}</span>
    @if (overdue()) {
      <span class="badge tone-danger">Terlambat</span>
    }
  `,
  styles: [`
    .badge { display: inline-block; padding: 2px 10px; border-radius: 999px;
             font-size: 0.8125rem; font-weight: 600; border: 1px solid transparent; }
    .badge + .badge { margin-left: 6px; }
    .tone-warn   { background: #fef3c7; color: #78350f; border-color: #fcd34d; }
    .tone-ok     { background: #d1fae5; color: #064e3b; border-color: #6ee7b7; }
    .tone-info   { background: #e0f2fe; color: #0c4a6e; border-color: #7dd3fc; }
    .tone-muted  { background: #f1f5f9; color: #334155; border-color: #cbd5e1; }
    .tone-danger { background: #ffe4e6; color: #881337; border-color: #fda4af; }
  `],
})
export class StatusBadgeComponent {
  kind = input<'loan' | 'item'>('loan');
  status = input.required<LoanStatus | ItemStatus>();
  perspective = input<Perspective>('peminjam');
  overdue = input(false);

  info = computed(() => {
    const s = this.status();
    if (this.kind() === 'item') {
      return ITEM_LABELS[s as ItemStatus];
    }
    const entry = LOAN_LABELS[s as LoanStatus];
    return { label: entry[this.perspective()], tone: entry.tone };
  });
}
