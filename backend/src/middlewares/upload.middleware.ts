import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { NextFunction, RequestHandler, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import prisma from '../config/database';
import { AuthRequest } from './auth.middleware';
import { HttpError } from '../utils/http-error';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new HttpError(400, 'Format gambar harus JPEG, PNG, atau WebP.'));
      return;
    }
    cb(null, true);
  }
});

const singleUpload = upload.single('image');

export const uploadImage: RequestHandler = (req, res, next) => {
  singleUpload(req, res, (error) => {
    if (!error) {
      if (!req.file) {
        next(new HttpError(400, 'Berkas gambar wajib diunggah pada field "image".'));
        return;
      }
      next();
      return;
    }

    if (error instanceof HttpError) {
      next(error);
      return;
    }
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      next(new HttpError(400, 'Ukuran gambar maksimal 5 MB.'));
      return;
    }
    next(new HttpError(400, error.message || 'Unggah gambar gagal.'));
  });
};

const escapeXml = (value: string): string =>
  value.replace(/[<>&"']/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;'
    };
    return entities[char];
  });

const timestampWib = (): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '00';
  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}`;
};

const buildWatermarkSvg = (width: number, height: number, text: string): Buffer => {
  const stepX = Math.max(320, Math.round(width / 3));
  const stepY = 96;
  const labels: string[] = [];

  for (let y = -height; y < height * 2; y += stepY) {
    for (let x = -width; x < width * 2; x += stepX) {
      labels.push(`<text x="${x}" y="${y}">${text}</text>`);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<g transform="rotate(-30 ${width / 2} ${height / 2})" ` +
    'font-family="sans-serif" font-size="18" font-weight="600" ' +
    'fill="rgba(255,255,255,0.55)">' +
    labels.join('') +
    '</g></svg>';

  return Buffer.from(svg, 'utf-8');
};

const resolveWatermarkText = async (req: AuthRequest): Promise<string> => {
  const orgId = req.membership!.orgId;
  let actorName = '';
  let actorWa = '';

  if (req.membership!.role === 'ADMIN') {
    actorName = req.user!.fullName;
    actorWa = req.user!.waNumber;
  } else {
    const admin = await prisma.membership.findFirst({
      where: { orgId, role: 'ADMIN', status: 'TERVERIFIKASI' },
      orderBy: { joinedAt: 'asc' },
      include: { user: true }
    });

    if (admin) {
      actorName = admin.user.fullName;
      actorWa = admin.user.waNumber;
    } else {
      const organization = await prisma.organization.findUnique({ where: { id: orgId } });
      actorName = organization?.name ?? 'Organisasi';
      actorWa = organization?.contact ?? '-';
    }
  }

  const organization = await prisma.organization.findUnique({ where: { id: orgId } });
  const orgName = organization?.name ?? actorName;
  return `${orgName} • ${actorName} • WA ${actorWa} • ${timestampWib()} WIB`;
};

export const watermarkImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.membership!.orgId;
    const watermarkText = await resolveWatermarkText(req);
    const metadata = await sharp(req.file!.buffer).metadata();
    const width = metadata.width ?? 1;
    const height = metadata.height ?? 1;

    const processed = await sharp(req.file!.buffer)
      .composite([{ input: buildWatermarkSvg(width, height, escapeXml(watermarkText)), top: 0, left: 0 }])
      .jpeg({ quality: 85 })
      .toBuffer();

    const name = `${randomUUID()}.jpg`;
    const directory = path.resolve(process.cwd(), 'uploads', orgId);
    await fs.promises.mkdir(directory, { recursive: true });
    const filePath = path.join(directory, name);
    await fs.promises.writeFile(filePath, processed);

    req.processedImage = {
      path: filePath,
      url: `/uploads/${orgId}/${name}`,
      name,
      watermarkText
    };
    next();
  } catch (error) {
    next(new HttpError(500, error instanceof Error ? error.message : 'Gagal memproses gambar.'));
  }
};
