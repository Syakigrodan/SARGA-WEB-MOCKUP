import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { findLoanForOrg, toLoanView } from '../services/loan.service';
import { HttpError } from '../utils/http-error';
import { respondError } from '../utils/respond-error';

export const returnLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.membership!.orgId;
    const loan = await findLoanForOrg(req.params.id, orgId);

    if (!loan) {
      res.status(404).json({ success: false, message: 'Pinjaman tidak ditemukan di organisasi ini.' });
      return;
    }

    const isAdmin = req.membership!.role === 'ADMIN';
    const isOwner = loan.ownerId === req.user!.id;
    if (!isAdmin && !isOwner) {
      res.status(403).json({
        success: false,
        message: 'Hanya pemilik barang atau pengurus organisasi yang dapat mengonfirmasi pengembalian.'
      });
      return;
    }

    if (loan.status !== 'AKTIF') {
      res.status(409).json({ success: false, message: 'Hanya pinjaman aktif yang dapat dikonfirmasi kembali.' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const loanUpdate = await tx.loanTransaction.updateMany({
        where: { id: loan.id, orgId, status: 'AKTIF' },
        data: { status: 'SELESAI', returnConfirmedAt: new Date() }
      });
      if (loanUpdate.count === 0) throw new HttpError(409, 'Hanya pinjaman aktif yang dapat dikonfirmasi kembali.');

      const itemUpdate = await tx.item.updateMany({
        where: { id: loan.itemId, orgId, status: 'DIPINJAM' },
        data: { status: 'TERSEDIA' }
      });
      if (itemUpdate.count === 0) throw new HttpError(409, 'Barang tidak dalam status dipinjam.');

      await tx.auditLog.create({
        data: {
          orgId,
          actorId: req.user!.id,
          action: 'Mengonfirmasi pengembalian',
          target: loan.id,
          note: `Barang ${loan.itemId} kembali tersedia.`
        }
      });
    });

    const updated = await findLoanForOrg(loan.id, orgId);
    res.json({
      success: true,
      loan: toLoanView(updated!),
      message: 'Pengembalian dikonfirmasi. Barang kembali tersedia.'
    });
  } catch (error) {
    respondError(res, error);
  }
};
