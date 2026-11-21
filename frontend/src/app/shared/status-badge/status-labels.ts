import { ItemStatus, LoanStatus } from '../../core/models';

export type Perspective = 'peminjam' | 'pemilik';
export type Tone = 'warn' | 'ok' | 'info' | 'muted' | 'danger';

interface LoanLabel {
  peminjam: string;
  pemilik: string;
  tone: Tone;
}

export const LOAN_LABELS: Record<LoanStatus, LoanLabel> = {
  MENUNGGU:   { peminjam: 'Menunggu Persetujuan',   pemilik: 'Menunggu Verifikasi Anda',   tone: 'warn' },
  DISETUJUI:  { peminjam: 'Disetujui (Koordinasi)', pemilik: 'Terima (Koordinasi jadwal)', tone: 'info' },
  AKTIF:      { peminjam: 'Aktif Dipinjam',         pemilik: 'Sedang Dipinjam',            tone: 'ok' },
  SELESAI:    { peminjam: 'Selesai',                pemilik: 'Barang tersedia kembali',    tone: 'muted' },
  DITOLAK:    { peminjam: 'Pengajuan ditolak',      pemilik: 'Permintaan ditolak',         tone: 'danger' },
  DIBATALKAN: { peminjam: 'Pengajuan dibatalkan',   pemilik: 'Tidak lagi aktif',           tone: 'muted' },
};

export const ITEM_LABELS: Record<ItemStatus, { label: string; tone: Tone }> = {
  TERSEDIA:   { label: 'Tersedia',        tone: 'ok' },
  DIPINJAM:   { label: 'Sedang Dipinjam', tone: 'warn' },
  PERAWATAN:  { label: 'Perawatan',       tone: 'muted' },
  DIARSIPKAN: { label: 'Diarsipkan',      tone: 'muted' },
};
