import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import request from 'supertest';
import sharp from 'sharp';
import app from '../src/app';
import prisma from '../src/config/database';
import { createMember, createOrg, resetDb } from './helpers';

describe('BE-SKI-16: unggah citra dengan watermark forensik', () => {
  let orgA: { id: string; name: string; contact: string };
  let uploader: { user: { id: string; fullName: string; waNumber: string }; token: string };
  const uploadedOrgIds: string[] = [];

  const auth = (token: string, orgId: string) => ({
    Authorization: `Bearer ${token}`,
    'x-organization-id': orgId
  });

  const pngBuffer = async () =>
    sharp({ create: { width: 400, height: 300, channels: 3, background: '#ffffff' } })
      .png()
      .toBuffer();

  const createAdmin = async (waNumber: string, fullName: string) =>
    createMember(orgA.id, { waNumber, fullName, role: 'ADMIN' });

  const upload = (
    token: string,
    orgId: string,
    buffer: Buffer,
    filename = 'contoh.png',
    contentType = 'image/png'
  ) =>
    request(app).post('/api/v1/uploads').set(auth(token, orgId)).attach('image', buffer, {
      filename,
      contentType
    });

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Unggah', 'ORGUNGGAH2026');
    uploadedOrgIds.push(orgA.id);
    uploader = await createMember(orgA.id, { waNumber: '081200000091', fullName: 'Anggota Unggah' });
  });

  afterEach(() => {
    for (const orgId of new Set(uploadedOrgIds)) {
      fs.rmSync(path.resolve(process.cwd(), 'uploads', orgId), { recursive: true, force: true });
    }
    uploadedOrgIds.length = 0;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('menghasilkan gambar ber-watermark dan mengembalikan watermarkText', async () => {
    const admin = await createAdmin('081200000092', 'Pengurus Unggah');
    const buffer = await pngBuffer();

    const res = await upload(admin.token, orgA.id, buffer);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.image.url).toMatch(/^\/uploads\//);
    expect(res.body.image.name).toMatch(/\.jpg$/);
    expect(res.body.image.watermarkText).toContain(orgA.name);
    expect(res.body.image.watermarkText).toContain(admin.user.fullName);
    expect(res.body.image.watermarkText).toContain(admin.user.waNumber);
    expect(res.body.image.watermarkText).toContain('WIB');
    expect(res.body.message).toBeTruthy();

    const filePath = path.resolve(process.cwd(), 'uploads', orgA.id, path.basename(res.body.image.url));
    expect(fs.existsSync(filePath)).toBe(true);
    const output = fs.readFileSync(filePath);
    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe('jpeg');
    expect(metadata.width).toBe(400);
    expect(metadata.height).toBe(300);

    const raw = await sharp(output).removeAlpha().raw().toBuffer();
    let darkPixels = 0;
    for (let i = 0; i < raw.length; i += 3) {
      if (raw[i] < 240) darkPixels += 1;
    }
    expect(darkPixels).toBeGreaterThan(50);
  });

  it('MIME bukan gambar ditolak 400', async () => {
    const res = await upload(
      uploader.token,
      orgA.id,
      Buffer.from('bukan gambar'),
      'catatan.txt',
      'text/plain'
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('MIME gambar tetapi isi bukan gambar ditolak 400', async () => {
    const res = await upload(
      uploader.token,
      orgA.id,
      Buffer.from('bukan gambar'),
      'palsu.png',
      'image/png'
    );

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('file lebih dari 5 MB ditolak 400', async () => {
    const res = await upload(uploader.token, orgA.id, Buffer.alloc(6 * 1024 * 1024, 1));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('tanpa file ditolak 400', async () => {
    const res = await request(app)
      .post('/api/v1/uploads')
      .set(auth(uploader.token, orgA.id));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('uploader non-admin memakai admin terverifikasi pertama', async () => {
    const adminEarly = await createAdmin('081200000093', 'Pengurus Pertama');
    await prisma.membership.update({
      where: { id: adminEarly.membership.id },
      data: { joinedAt: new Date('2020-01-01T00:00:00.000Z') }
    });
    const adminLate = await createAdmin('081200000094', 'Pengurus Kedua');
    await prisma.membership.update({
      where: { id: adminLate.membership.id },
      data: { joinedAt: new Date('2023-01-01T00:00:00.000Z') }
    });
    await createMember(orgA.id, {
      waNumber: '081200000095',
      fullName: 'Calon Pengurus',
      role: 'ADMIN',
      status: 'MENUNGGU_VERIFIKASI'
    });

    const res = await upload(uploader.token, orgA.id, await pngBuffer());

    expect(res.status).toBe(201);
    expect(res.body.image.watermarkText).toContain(adminEarly.user.fullName);
    expect(res.body.image.watermarkText).toContain(adminEarly.user.waNumber);
    expect(res.body.image.watermarkText).not.toContain(adminLate.user.fullName);
    expect(res.body.image.watermarkText).not.toContain('Calon Pengurus');
  });

  it('tanpa admin terverifikasi memakai kontak organisasi', async () => {
    const orgB = await createOrg('Organisasi Tanpa Pengurus', 'ORGTANPAPENGURUS2026');
    uploadedOrgIds.push(orgB.id);
    const memberB = await createMember(orgB.id, { waNumber: '081200000096', fullName: 'Anggota Org B' });

    const res = await upload(memberB.token, orgB.id, await pngBuffer());

    expect(res.status).toBe(201);
    expect(res.body.image.watermarkText).toContain(orgB.name);
    expect(res.body.image.watermarkText).toContain(orgB.contact);
  });
});
