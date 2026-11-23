import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middlewares/auth.middleware';
import { respondError } from '../utils/respond-error';

const createSchema = z.object({
  title: z.string().trim().min(3).max(120),
  content: z.string().trim().min(5).max(2000)
});

const invalidBodyMessage = 'Judul wajib 3–120 karakter dan isi wajib 5–2000 karakter.';

type AnnouncementWithAuthor = Prisma.AnnouncementGetPayload<{
  include: { author: { select: { id: true; fullName: true } } };
}>;

type AnnouncementView = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { id: string; fullName: string };
};

const authorSelect = { id: true, fullName: true } as const;

const toView = (announcement: AnnouncementWithAuthor): AnnouncementView => ({
  id: announcement.id,
  title: announcement.title,
  content: announcement.content,
  createdAt: announcement.createdAt.toISOString(),
  author: { id: announcement.author.id, fullName: announcement.author.fullName }
});

export const listAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { orgId: req.membership!.orgId },
      include: { author: { select: authorSelect } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      success: true,
      count: announcements.length,
      announcements: announcements.map(toView)
    });
  } catch (error) {
    respondError(res, error);
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: invalidBodyMessage });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        orgId: req.membership!.orgId,
        authorId: req.user!.id,
        title: parsed.data.title,
        content: parsed.data.content
      },
      include: { author: { select: authorSelect } }
    });

    res.status(201).json({
      success: true,
      announcement: toView(announcement),
      message: 'Pengumuman berhasil diterbitkan.'
    });
  } catch (error) {
    respondError(res, error);
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await prisma.announcement.deleteMany({
      where: { id: req.params.id, orgId: req.membership!.orgId }
    });
    if (result.count === 0) {
      res.status(404).json({
        success: false,
        message: 'Pengumuman tidak ditemukan di organisasi ini.'
      });
      return;
    }
    res.json({ success: true, message: 'Pengumuman berhasil dihapus.' });
  } catch (error) {
    respondError(res, error);
  }
};
