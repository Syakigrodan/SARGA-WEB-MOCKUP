import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createMember, createOrg, resetDb } from './helpers';

describe('BE-MHD-02: struktur organisasi', () => {
  let orgA: { id: string; name: string; type: string; address: string; contact: string };
  let admin: { user: { id: string; fullName: string; waNumber: string }; token: string };

  const auth = (token: string, orgId: string) => ({
    Authorization: `Bearer ${token}`,
    'x-organization-id': orgId
  });

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Struktur', 'ORGSTRUKTUR2026');
    admin = await createMember(orgA.id, {
      waNumber: '081200000081',
      fullName: 'Ketua Struktur',
      role: 'ADMIN',
      position: 'Ketua'
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET mengembalikan struktur organisasi aktif, leaders dan members terpisah, urut prioritas jabatan', async () => {
    await createMember(orgA.id, { waNumber: '081200000082', fullName: 'Sekretaris Struktur', role: 'ADMIN', position: 'Sekretaris' });
    await createMember(orgA.id, { waNumber: '081200000083', fullName: 'Bendahara Struktur', position: 'Bendahara Divisi Keuangan', address: 'Blok C No. 04' });
    await createMember(orgA.id, { waNumber: '081200000084', fullName: 'Anggota Biasa', position: 'Anggota' });

    const res = await request(app).get(`/api/v1/organizations/${orgA.id}/structure`).set(auth(admin.token, orgA.id));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.organization).toEqual({
      id: orgA.id, name: orgA.name, type: orgA.type, address: orgA.address, contact: orgA.contact
    });
    expect(res.body.leaders.map((m: any) => m.position)).toEqual(['Ketua', 'Sekretaris']);
    expect(res.body.members.map((m: any) => m.position)).toEqual(['Bendahara Divisi Keuangan', 'Anggota']);
    expect(res.body.members[0].division).toBe('Divisi Keuangan');
    expect(res.body.members[1].division).toBeNull();
    expect(JSON.stringify(res.body)).not.toContain('Blok C No. 04');
    expect(res.body.leaders[0]).toMatchObject({
      userId: admin.user.id,
      fullName: 'Ketua Struktur',
      waNumber: '081200000081',
      role: 'ADMIN'
    });
    expect(typeof res.body.leaders[0].joinedAt).toBe('string');
  });

  it('GET hanya menyertakan anggota TERVERIFIKASI', async () => {
    await createMember(orgA.id, { waNumber: '081200000085', fullName: 'Calon', status: 'MENUNGGU_VERIFIKASI' });
    await createMember(orgA.id, { waNumber: '081200000086', fullName: 'Ditolak', status: 'DITOLAK' });

    const res = await request(app).get(`/api/v1/organizations/${orgA.id}/structure`).set(auth(admin.token, orgA.id));

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('Calon');
    expect(JSON.stringify(res.body)).not.toContain('Ditolak');
  });

  it('GET menolak :id organisasi lain 403', async () => {
    const orgB = await createOrg('Organisasi Lain', 'ORGLAINSTRUKTUR2026');
    const adminB = await createMember(orgB.id, { waNumber: '081200000087', fullName: 'Pengurus B', role: 'ADMIN' });
    const rahasia = await createMember(orgB.id, { waNumber: '081200000088', fullName: 'Rahasia Org B' });

    const res = await request(app).get(`/api/v1/organizations/${orgB.id}/structure`).set(auth(admin.token, orgA.id));

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(JSON.stringify(res.body)).not.toContain(rahasia.user.fullName);
    expect(JSON.stringify(res.body)).not.toContain(adminB.user.fullName);
  });

  it('GET tanpa header organisasi ditolak 403', async () => {
    const res = await request(app).get(`/api/v1/organizations/${orgA.id}/structure`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(403);
  });

  it('GET anggota belum terverifikasi ditolak 403', async () => {
    const pending = await createMember(orgA.id, {
      waNumber: '081200000089', fullName: 'Calon Pengurus', role: 'ADMIN', status: 'MENUNGGU_VERIFIKASI'
    });
    const res = await request(app).get(`/api/v1/organizations/${orgA.id}/structure`).set(auth(pending.token, orgA.id));
    expect(res.status).toBe(403);
  });

  it('GET tanpa token ditolak 401', async () => {
    const res = await request(app).get(`/api/v1/organizations/${orgA.id}/structure`)
      .set('x-organization-id', orgA.id);
    expect(res.status).toBe(401);
  });

  it('GET dapat diakses anggota terverifikasi, bukan hanya admin', async () => {
    const anggota = await createMember(orgA.id, {
      waNumber: '081200000091', fullName: 'Anggota Terverifikasi'
    });

    const res = await request(app).get(`/api/v1/organizations/${orgA.id}/structure`).set(auth(anggota.token, orgA.id));

    expect(res.status).toBe(200);
    expect(res.body.leaders.map((m: any) => m.fullName)).toEqual(['Ketua Struktur']);
    expect(res.body.members.map((m: any) => m.fullName)).toEqual(['Anggota Terverifikasi']);
  });

  it('GET mengurutkan jabatan yang sama berdasarkan joinedAt', async () => {
    await createMember(orgA.id, {
      waNumber: '081200000092', fullName: 'Lebih Awal', position: 'Anggota',
      joinedAt: new Date('2020-01-01T00:00:00.000Z')
    });
    await createMember(orgA.id, {
      waNumber: '081200000093', fullName: 'Lebih Baru', position: 'Anggota',
      joinedAt: new Date('2025-01-01T00:00:00.000Z')
    });

    const res = await request(app).get(`/api/v1/organizations/${orgA.id}/structure`).set(auth(admin.token, orgA.id));

    expect(res.status).toBe(200);
    const names = res.body.members.map((m: any) => m.fullName).filter((name: string) => name.startsWith('Lebih '));
    expect(names).toEqual(['Lebih Awal', 'Lebih Baru']);
  });

  it('GET tidak membocorkan data sensitif', async () => {
    await createMember(orgA.id, {
      waNumber: '081200000090',
      fullName: 'Anggota Berdokumen',
      documentType: 'KTP',
      documentUrl: 'https://rahasia.example/ktp.jpg',
      documentName: 'ktp.jpg'
    });
    const res = await request(app).get(`/api/v1/organizations/${orgA.id}/structure`).set(auth(admin.token, orgA.id));
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    expect(JSON.stringify(res.body)).not.toContain('https://rahasia.example/ktp.jpg');
    expect(JSON.stringify(res.body)).not.toContain('documentUrl');
  });
});
