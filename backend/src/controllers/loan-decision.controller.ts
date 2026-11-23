import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { findLoanForOrg, toLoanView } from '../services/loan.service';
import { HttpError } from '../utils/http-error';
import { respondError } from '../utils/respond-error';

const canDecide = (req: AuthRequest, ownerId: string | null): boolean =>
  req.membership!.role === 'ADMIN' || ownerId === req.user!.id;

export const approveLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.membership!.orgId;
    const loan = await findLoanForOrg(req.params.id, orgId);

    if (!loan) {
      res.status(404).json({ success: false, message: 'Pinjaman tidak ditemukan di organisasi ini.' });
      return;
    }

    if (!canDecide(req, loan.ownerId)) {
      res.status(403).json({
        success: false,
        message: 'Hanya pemilik barang atau pengurus organisasi yang dapat menyetujui pinjaman.'
      });
      return;
    }

    if (loan.status !== 'MENUNGGU') {
      res.status(409).json({ success: false, message: 'Pinjaman ini sudah diproses.' });
      return;
    }

    if (loan.item.status !== 'TERSEDIA') {
      res.status(409).json({ success: false, message: 'Barang tidak tersedia untuk dipinjam.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const loanUpdate = await tx.loanTransaction.updateMany({
        where: { id: loan.id, orgId, status: 'MENUNGGU' },
        data: { status: 'AKTIF' }
      });
      if (loanUpdate.count === 0) throw new HttpError(409, 'Pinjaman ini sudah diproses.');

      const itemUpdate = await tx.item.updateMany({
        where: { id: loan.itemId, orgId, status: 'TERSEDIA' },
        data: { status: 'DIPINJAM' }
      });
      if (itemUpdate.count === 0) throw new HttpError(409, 'Barang tidak tersedia untuk dipinjam.');

      await tx.auditLog.create({
        data: {
          orgId,
          actorId: req.user!.id,
          action: 'Menyetujui pinjaman',
          target: loan.id,
          note: `Pinjaman ${loan.id} disetujui; barang ${loan.itemId} berstatus DIPINJAM.`
        }
      });
    });

    const updated = await findLoanForOrg(loan.id, orgId);
    res.json({
      success: true,
      loan: toLoanView(updated!),
      message: 'Pinjaman disetujui dan barang sedang dipinjam.'
    });
  } catch (error) {
    respondError(res, error);
  }
};

const rejectReason = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length < 5) {
    throw new HttpError(400, 'Alasan penolakan wajib diisi minimal 5 karakter.');
  }
  return value.trim();
};

export const rejectLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.membership!.orgId;
    const loan = await findLoanForOrg(req.params.id, orgId);

    if (!loan) {
      res.status(404).json({ success: false, message: 'Pinjaman tidak ditemukan di organisasi ini.' });
      return;
    }

    if (!canDecide(req, loan.ownerId)) {
      res.status(403).json({
        success: false,
        message: 'Hanya pemilik barang atau pengurus organisasi yang dapat menolak pinjaman.'
      });
      return;
    }

    const reason = rejectReason(req.body?.rejectionReason);

    if (loan.status !== 'MENUNGGU') {
      res.status(409).json({ success: false, message: 'Pinjaman ini sudah diproses.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const update = await tx.loanTransaction.updateMany({
        where: { id: loan.id, orgId, status: 'MENUNGGU' },
        data: { status: 'DITOLAK', rejectionReason: reason }
      });
      if (update.count === 0) throw new HttpError(409, 'Pinjaman ini sudah diproses.');

      await tx.auditLog.create({
        data: {
          orgId,
          actorId: req.user!.id,
          action: 'Menolak pinjaman',
          target: loan.id,
          note: reason
        }
      });
    });

    const updated = await findLoanForOrg(loan.id, orgId);
    res.json({
      success: true,
      loan: toLoanView(updated!),
      message: 'Pinjaman ditolak.'
    });
  } catch (error) {
    respondError(res, error);
  }
};

export const cancelLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.membership!.orgId;
    const loan = await findLoanForOrg(req.params.id, orgId);

    if (!loan) {
      res.status(404).json({ success: false, message: 'Pinjaman tidak ditemukan di organisasi ini.' });
      return;
    }

    if (loan.borrowerId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: 'Hanya peminjam yang dapat membatalkan pengajuannya.'
      });
      return;
    }

    if (loan.status !== 'MENUNGGU') {
      res.status(409).json({ success: false, message: 'Pinjaman ini sudah diproses.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const update = await tx.loanTransaction.updateMany({
        where: { id: loan.id, orgId, status: 'MENUNGGU' },
        data: { status: 'DIBATALKAN' }
      });
      if (update.count === 0) throw new HttpError(409, 'Pinjaman ini sudah diproses.');

      await tx.auditLog.create({
        data: {
          orgId,
          actorId: req.user!.id,
          action: 'Membatalkan pinjaman',
          target: loan.id
        }
      });
    });

    const updated = await findLoanForOrg(loan.id, orgId);
    res.json({
      success: true,
      loan: toLoanView(updated!),
      message: 'Pengajuan pinjaman dibatalkan.'
    });
  } catch (error) {
    respondError(res, error);
  }
};
