import { Response } from 'express';
import { LoanStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { LOAN_STATUSES, loanInclude, LoanWithRelations, toLoanView } from '../services/loan.service';

const parseStatus = (query: unknown): LoanStatus | undefined => {
  if (typeof query !== 'string' || query.length === 0) return undefined;
  return LOAN_STATUSES.includes(query as LoanStatus) ? (query as LoanStatus) : undefined;
};

const invalidStatus = (query: unknown): boolean =>
  typeof query === 'string' && query.length > 0 && !LOAN_STATUSES.includes(query as LoanStatus);

const listResponse = (res: Response, loans: LoanWithRelations[]): void => {
  res.json({ success: true, count: loans.length, loans: loans.map(toLoanView) });
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status;
    if (invalidStatus(status)) {
      res.status(400).json({ success: false, message: 'Status pinjaman tidak dikenal.' });
      return;
    }

    const loans = await prisma.loanTransaction.findMany({
      where: {
        orgId: req.membership!.orgId,
        borrowerId: req.user!.id,
        ...(parseStatus(status) ? { status: parseStatus(status) } : {})
      },
      include: loanInclude,
      orderBy: { createdAt: 'desc' }
    }) as LoanWithRelations[];

    listResponse(res, loans);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status;
    if (invalidStatus(status)) {
      res.status(400).json({ success: false, message: 'Status pinjaman tidak dikenal.' });
      return;
    }

    const overdue = req.query.overdue;
    if (overdue !== undefined && overdue !== 'true' && overdue !== 'false') {
      res.status(400).json({ success: false, message: 'Filter overdue harus bernilai true atau false.' });
      return;
    }

    const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
    const conditions: Prisma.LoanTransactionWhereInput[] = [];
    const parsedStatus = parseStatus(status);
    if (parsedStatus) conditions.push({ status: parsedStatus });
    if (q) {
      conditions.push({
        OR: [
          { item: { name: { contains: q } } },
          { item: { code: { contains: q } } },
          { borrower: { fullName: { contains: q } } }
        ]
      });
    }
    if (overdue === 'true') conditions.push({ status: 'AKTIF', endDate: { lt: new Date() } });
    if (overdue === 'false') {
      conditions.push({
        OR: [{ status: { not: 'AKTIF' } }, { endDate: { gte: new Date() } }]
      });
    }

    const loans = await prisma.loanTransaction.findMany({
      where: { orgId: req.membership!.orgId, AND: conditions },
      include: loanInclude,
      orderBy: { createdAt: 'desc' }
    }) as LoanWithRelations[];

    listResponse(res, loans);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
