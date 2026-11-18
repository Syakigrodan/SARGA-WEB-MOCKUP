export type Role = 'ANGGOTA' | 'ADMIN';

export type VerificationStatus = 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'DITOLAK';

export type ItemStatus = 'TERSEDIA' | 'DIPINJAM' | 'PERAWATAN' | 'DIARSIPKAN';

export type LoanStatus = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK' | 'AKTIF' | 'SELESAI' | 'DIBATALKAN';

export interface User {
  id: string;
  waNumber: string;
  fullName: string;
  address?: string;
  memberships?: Membership[];
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  address: string;
  contact: string;
  inviteCode: string;
  status: string;
}

export interface Membership {
  id: string;
  userId: string;
  orgId: string;
  role: Role;
  position: string;
  status: VerificationStatus;
  rejectionReason?: string;
  documentType?: string;
  documentUrl?: string;
  documentName?: string;
  documentNote?: string;
  address?: string;
  organization?: Organization;
}

export interface Item {
  id: string;
  code: string;
  orgId: string;
  ownerId?: string | null;
  name: string;
  maxDays: number;
  location: string;
  status: ItemStatus;
  description: string;
  contents: string | string[];
  instructions: string;
  image: string;
  isSafeAndReady: boolean;
  owner?: { id: string; fullName: string; waNumber: string };
  organization?: { id: string; name: string };
}

export interface LoanTransaction {
  id: string;
  orgId: string;
  itemId: string;
  borrowerId: string;
  ownerId?: string | null;
  startDate: string;
  endDate: string;
  status: LoanStatus;
  purpose: string;
  rejectionReason?: string;
  item?: Item;
  borrower?: { id: string; fullName: string; waNumber: string };
}
