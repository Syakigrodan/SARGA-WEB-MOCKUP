import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { waNumber, password, fullName, address, inviteCode, documentType, documentUrl, documentName, documentNote } = req.body;

    if (!waNumber || !password || !fullName || !inviteCode) {
      res.status(400).json({ success: false, message: 'Mohon lengkapi seluruh field wajib pendaftaran.' });
      return;
    }

    const org = await prisma.organization.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() }
    });

    if (!org) {
      res.status(404).json({ success: false, message: 'Kode undangan organisasi tidak valid atau sudah kedaluwarsa.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { waNumber }
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'Nomor WhatsApp sudah terdaftar. Silakan masuk.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        waNumber,
        passwordHash,
        fullName,
        address: address || '',
        primaryOrgId: org.id,
        memberships: {
          create: {
            orgId: org.id,
            role: 'ANGGOTA',
            position: 'Anggota',
            status: 'MENUNGGU_VERIFIKASI',
            documentType: documentType || 'KTP',
            documentUrl: documentUrl || null,
            documentName: documentName || null,
            documentNote: documentNote || null,
            address: address || ''
          }
        }
      },
      include: {
        memberships: true
      }
    });

    const secret = process.env.JWT_SECRET || 'sarga_jwt_secret_dev';
    const token = jwt.sign({ id: user.id, waNumber: user.waNumber }, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil. Akun Anda menunggu verifikasi pengurus.',
      token,
      user: {
        id: user.id,
        waNumber: user.waNumber,
        fullName: user.fullName,
        memberships: user.memberships
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { waNumber, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { waNumber },
      include: {
        memberships: {
          include: { organization: true }
        }
      }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Nomor WhatsApp atau kata sandi tidak cocok.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Nomor WhatsApp atau kata sandi tidak cocok.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'sarga_jwt_secret_dev';
    const token = jwt.sign({ id: user.id, waNumber: user.waNumber }, secret, {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any
    });

    res.json({
      success: true,
      message: 'Berhasil masuk.',
      token,
      user: {
        id: user.id,
        waNumber: user.waNumber,
        fullName: user.fullName,
        address: user.address,
        memberships: user.memberships
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        waNumber: true,
        fullName: true,
        address: true,
        memberships: {
          include: { organization: true }
        }
      }
    });

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
