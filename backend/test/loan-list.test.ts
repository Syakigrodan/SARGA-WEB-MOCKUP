import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createItem, createLoan, createMember, createOrg, resetDb } from './helpers';

describe('BE-SKI-10: riwayat dan monitoring pinjaman', () => {
  let orgA: { id: string; name: string };
  let borrower: { user: { id: string }; token: string };
  let owner: { user: { id: string }; token: string };
  let admin: { user: { id: string }; token: string };
  let item: { id: string; name: string };

  const auth = (token: string, orgId: string) => ({
    Authorization: `Bearer ${token}`,
    'x-organization-id': orgId
  });

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Monitoring', 'ORGMON2026');
    borrower = await createMember(orgA.id, { waNumber: '081200000021', fullName: 'Peminjam Monitoring' });
    owner = await createMember(orgA.id, { waNumber: '081200000022', fullName: 'Pemilik Monitoring' });
    admin = await createMember(orgA.id, {
      waNumber: '081200000023',
      fullName: 'Pengurus Monitoring',
      role: 'ADMIN'
    });
    item = await createItem(orgA.id, owner.user.id, { name: 'Alat uji' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('mengembalikan pinjaman peminjam beserta penanda overdue', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, {
      status: 'AKTIF',
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });

    const res = await request(app).get('/api/v1/loans/me').set(auth(borrower.token, orgA.id));

    expect(res.status).toBe(200);
    expect(res.body.loans[0].id).toBe(loan.id);
    expect(res.body.loans[0].isOverdue).toBe(true);
    expect(res.body.loans[0].status).toBe('AKTIF');
    expect(res.body.loans[0].item.name).toBe(item.name);
  });

  it('hanya mengembalikan pinjaman organisasi aktif', async () => {
    const orgB = await createOrg('Organisasi Lain', 'ORGLAINMON2026');
    const ownerB = await createMember(orgB.id, { waNumber: '081200000024', fullName: 'Pemilik B' });
    const itemB = await createItem(orgB.id, ownerB.user.id);
    const loanB = await createLoan(orgB.id, itemB.id, borrower.user.id, ownerB.user.id);
    await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await request(app).get('/api/v1/loans/me').set(auth(borrower.token, orgA.id));

    expect(res.status).toBe(200);
    expect(res.body.loans.some((l: any) => l.id === loanB.id)).toBe(false);
  });

  it('admin melihat monitoring dengan filter q dan status', async () => {
    await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, { status: 'AKTIF' });
    await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, { status: 'MENUNGGU' });

    const res = await request(app)
      .get('/api/v1/loans?status=AKTIF&q=Alat%20uji')
      .set(auth(admin.token, orgA.id));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.loans.every((l: any) => l.status === 'AKTIF')).toBe(true);
  });

  it('admin bisa memfilter pinjaman yang terlambat', async () => {
    await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, {
      status: 'AKTIF',
      endDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    });
    await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, {
      status: 'AKTIF',
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    const res = await request(app).get('/api/v1/loans?overdue=true').set(auth(admin.token, orgA.id));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.loans[0].isOverdue).toBe(true);
  });

  it('anggota biasa ditolak mengakses monitoring admin', async () => {
    const res = await request(app).get('/api/v1/loans').set(auth(borrower.token, orgA.id));

    expect(res.status).toBe(403);
  });

  it('status query tidak dikenal ditolak', async () => {
    const res = await request(app).get('/api/v1/loans?status=ASDF').set(auth(admin.token, orgA.id));

    expect(res.status).toBe(400);
  });
});
