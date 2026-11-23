import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dayNumber = (date: Date): number =>
  Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / MS_PER_DAY);

export const createLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId, expectedReturnDate, purpose } = req.body;
    const orgId = req.membership!.orgId;
    const borrowerId = req.user!.id;

    if (!itemId || !expectedReturnDate || typeof purpose !== 'string' || purpose.trim().length < 10) {
      res.status(400).json({
        success: false,
        message: 'Lengkapi barang, tanggal kembali, dan keperluan minimal 10 karakter.'
      });
      return;
    }

    const returnDate = new Date(expectedReturnDate);
    if (Number.isNaN(returnDate.getTime())) {
      res.status(400).json({ success: false, message: 'Tanggal kembali tidak valid.' });
      return;
    }

    const today = dayNumber(new Date());
    const returnDay = dayNumber(returnDate);
    if (returnDay < today) {
      res.status(400).json({ success: false, message: 'Tanggal kembali tidak boleh sebelum hari ini.' });
      return;
    }

    const item = await prisma.item.findFirst({ where: { id: itemId, orgId } });
    if (!item) {
      res.status(404).json({ success: false, message: 'Barang tidak ditemukan di organisasi ini.' });
      return;
    }

    if (item.status !== 'TERSEDIA') {
      res.status(400).json({ success: false, message: 'Barang ini sedang tidak tersedia.' });
      return;
    }

    if (item.ownerId === borrowerId) {
      res.status(400).json({ success: false, message: 'Anda tidak bisa meminjam barang milik sendiri.' });
      return;
    }

    const days = returnDay - today + 1;
    if (days > item.maxDays) {
      res.status(400).json({
        success: false,
        message: `Maksimal peminjaman ${item.maxDays} hari. Rentang yang dipilih ${days} hari.`
      });
      return;
    }

    const duplicate = await prisma.loanTransaction.findFirst({
      where: { itemId, borrowerId, status: 'MENUNGGU' }
    });
    if (duplicate) {
      res.status(409).json({ success: false, message: 'Anda sudah punya pengajuan menunggu untuk barang ini.' });
      return;
    }

    const loan = await prisma.loanTransaction.create({
      data: {
        orgId,
        itemId,
        borrowerId,
        ownerId: item.ownerId,
        startDate: new Date(),
        endDate: returnDate,
        status: 'MENUNGGU',
        purpose: purpose.trim()
      }
    });

    await prisma.auditLog.create({
      data: {
        orgId,
        actorId: borrowerId,
        action: 'Mengajukan pinjaman',
        target: item.name,
        note: `Pengajuan pinjaman sampai ${returnDate.toISOString().slice(0, 10)}.`
      }
    });

    res.status(201).json({
      success: true,
      loan,
      message: 'Pengajuan pinjaman berhasil dikirim dan menunggu persetujuan.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
