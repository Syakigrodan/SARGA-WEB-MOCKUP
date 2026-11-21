import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly state = signal<ToastMessage[]>([]);
  private nextId = 0;

  readonly messages = this.state.asReadonly();

  show(message: string, kind: ToastKind = 'info', durationMs = 5000): number {
    if (!message.trim()) {
      throw new Error('Pesan notifikasi tidak boleh kosong.');
    }
    if (durationMs < 0) {
      throw new RangeError('Durasi notifikasi tidak boleh negatif.');
    }

    const id = ++this.nextId;
    this.state.update(messages => [...messages, { id, kind, message }]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }

    return id;
  }

  dismiss(id: number): void {
    this.state.update(messages => messages.filter(message => message.id !== id));
  }
}
