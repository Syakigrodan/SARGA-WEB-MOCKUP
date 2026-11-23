import { Item, LoanStatus, LoanTransaction, User } from '@prisma/client';
import prisma from '../config/database';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const LOAN_STATUSES: LoanStatus[] = [
  'MENUNGGU',
  'DITOLAK',
  'DIBATALKAN',
  'AKTIF',
  'SELESAI'
];

const itemSelect = { id: true, code: true, name: true, image: true, status: true } as const;
const userSelect = { id: true, fullName: true, waNumber: true } as const;

export const loanInclude = {
  item: { select: itemSelect },
  borrower: { select: userSelect },
  owner: { select: userSelect }
} as const;

export type LoanWithRelations = LoanTransaction & {
  item: Pick<Item, 'id' | 'code' | 'name' | 'image' | 'status'>;
  borrower: Pick<User, 'id' | 'fullName' | 'waNumber'>;
  owner: Pick<User, 'id' | 'fullName' | 'waNumber'> | null;
};

export type LoanView = LoanWithRelations & {
  isOverdue: boolean;
  daysOverdue: number;
};

export async function findLoanForOrg(id: string, orgId: string): Promise<LoanWithRelations | null> {
  return prisma.loanTransaction.findFirst({
    where: { id, orgId },
    include: loanInclude
  }) as Promise<LoanWithRelations | null>;
}

export function toLoanView(loan: LoanWithRelations): LoanView {
  const now = Date.now();
  const isOverdue = loan.status === 'AKTIF' && loan.endDate.getTime() < now;
  const daysOverdue = isOverdue
    ? Math.max(1, Math.ceil((now - loan.endDate.getTime()) / MS_PER_DAY))
    : 0;

  return { ...loan, isOverdue, daysOverdue };
}
