import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createMember, createOrg, resetDb } from './helpers';

describe('BE-MHD-01: pengumuman organisasi', () => {
  let orgA: { id: string; name: string; contact: string };
  let admin: { user: { id: string; fullName: string; waNumber: string }; token: string };
  let member: { user: { id: string; fullName: string; waNumber: string }; token: string };

  const auth = (token: string, orgId: string) => ({
    Authorization: `Bearer ${token}`,
    'x-organization-id': orgId
  });

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Pengumuman', 'ORGPENGUMUMAN2026');
    admin = await createMember(orgA.id, {
      waNumber: '081200000071',
      fullName: 'Pengurus Pengumuman',
      role: 'ADMIN'
    });
    member = await createMember(orgA.id, {
      waNumber: '081200000072',
      fullName: 'Anggota Pengumuman'
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET mengembalikan pengumuman organisasi aktif, terbaru lebih dulu, beserta penulis', async () => {
    await prisma.announcement.create({ data: {
      orgId: orgA.id, authorId: admin.user.id, title: 'Pengumuman lama',
      content: 'Isi pengumuman lama', createdAt: new Date('2020-01-01T00:00:00.000Z')
    }});
    await prisma.announcement.create({ data: {
      orgId: orgA.id, authorId: admin.user.id, title: 'Pengumuman baru',
      content: 'Isi pengumuman baru', createdAt: new Date('2026-01-01T00:00:00.000Z')
    }});
    const orgB = await createOrg('Organisasi Lain', 'ORGLAINPENGUMUMAN2026');
    await prisma.announcement.create({ data: {
      orgId: orgB.id, authorId: (await createMember(orgB.id, { waNumber: '081200000079', fullName: 'Pengurus Lain' })).user.id,
      title: 'Rahasia org lain', content: 'Tidak boleh tampil'
    }});

    const res = await request(app).get('/api/v1/announcements').set(auth(member.token, orgA.id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.announcements.map((a: any) => a.title)).toEqual(['Pengumuman baru', 'Pengumuman lama']);
    expect(res.body.announcements[0].author).toEqual({ id: admin.user.id, fullName: admin.user.fullName });
    expect(JSON.stringify(res.body)).not.toContain('Rahasia org lain');
  });

  it('GET tanpa header organisasi ditolak 403', async () => {
    const res = await request(app).get('/api/v1/announcements')
      .set('Authorization', `Bearer ${member.token}`);
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET anggota belum terverifikasi ditolak 403', async () => {
    const pending = await createMember(orgA.id, {
      waNumber: '081200000073', fullName: 'Calon Anggota', status: 'MENUNGGU_VERIFIKASI'
    });
    const res = await request(app).get('/api/v1/announcements').set(auth(pending.token, orgA.id));
    expect(res.status).toBe(403);
  });

  it('POST admin membuat pengumuman dengan orgId dan authorId dari konteks', async () => {
    const orgB = await createOrg('Organisasi Sasar Sifat', 'ORGSASARPENGUMUMAN2026');
    const outsider = await createMember(orgB.id, { waNumber: '081200000074', fullName: 'Orang Luar' });

    const res = await request(app).post('/api/v1/announcements')
      .set(auth(admin.token, orgA.id))
      .send({ title: 'Jadwal Rapat', content: 'Rapat diadakan hari Sabtu.', orgId: orgB.id, authorId: outsider.user.id });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.announcement.title).toBe('Jadwal Rapat');
    expect(res.body.message).toBe('Pengumuman berhasil diterbitkan.');
    const saved = await prisma.announcement.findUnique({ where: { id: res.body.announcement.id } });
    expect(saved?.orgId).toBe(orgA.id);
    expect(saved?.authorId).toBe(admin.user.id);
  });

  it('POST anggota biasa ditolak 403', async () => {
    const res = await request(app).post('/api/v1/announcements')
      .set(auth(member.token, orgA.id))
      .send({ title: 'Izin angles', content: 'Anggota biasa tidak boleh menerbitkan.' });
    expect(res.status).toBe(403);
    expect(await prisma.announcement.count()).toBe(0);
  });

  it('POST judul kosong ditolak 400', async () => {
    const res = await request(app).post('/api/v1/announcements')
      .set(auth(admin.token, orgA.id))
      .send({ title: '   ', content: 'Isi yang cukup panjang.' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(await prisma.announcement.count()).toBe(0);
  });

  it('DELETE admin menghapus pengumuman organisasinya', async () => {
    const item = await prisma.announcement.create({ data: {
      orgId: orgA.id, authorId: admin.user.id, title: 'Akan dihapus', content: 'Isi pengumuman.'
    }});
    const res = await request(app).delete(`/api/v1/announcements/${item.id}`).set(auth(admin.token, orgA.id));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Pengumuman berhasil dihapus.');
    expect(await prisma.announcement.findUnique({ where: { id: item.id } })).toBeNull();
  });

  it('DELETE pengumuman organisasi lain tidak ditemukan 404', async () => {
    const orgB = await createOrg('Organisasi Terlindungi', 'ORGTERLINDUNGI2026');
    const adminB = await createMember(orgB.id, {
      waNumber: '081200000075', fullName: 'Pengurus B', role: 'ADMIN'
    });
    const item = await prisma.announcement.create({ data: {
      orgId: orgB.id, authorId: adminB.user.id, title: 'Milik org B', content: 'Tidak boleh dihapus.'
    }});
    const res = await request(app).delete(`/api/v1/announcements/${item.id}`).set(auth(admin.token, orgA.id));
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(await prisma.announcement.findUnique({ where: { id: item.id } })).not.toBeNull();
  });

  it('DELETE anggota biasa ditolak 403', async () => {
    const item = await prisma.announcement.create({ data: {
      orgId: orgA.id, authorId: admin.user.id, title: 'Tetap ada', content: 'Isi pengumuman.'
    }});
    const res = await request(app).delete(`/api/v1/announcements/${item.id}`).set(auth(member.token, orgA.id));
    expect(res.status).toBe(403);
    expect(await prisma.announcement.findUnique({ where: { id: item.id } })).not.toBeNull();
  });
});
