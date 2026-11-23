import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createItem, createLoan, createMember, createOrg, resetDb } from './helpers';

describe('BE-SKI-12: penolakan dan pembatalan pinjaman', () => {
  let orgA: { id: string };
  let borrower: { user: { id: string }; token: string };
  let owner: { user: { id: string }; token: string };
  let admin: { user: { id: string }; token: string };
  let other: { user: { id: string }; token: string };
  let item: { id: string };

  const auth = (token: string, orgId: string) => ({
    Authorization: `Bearer ${token}`,
    'x-organization-id': orgId
  });
  const patch = (action: string, token: string, loanId: string, body: Record<string, unknown> = {}, orgId = orgA.id) =>
    request(app).patch(`/api/v1/loans/${loanId}/${action}`).set(auth(token, orgId)).send(body);

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Keputusan', 'ORGKEPUTUSAN2026');
    borrower = await createMember(orgA.id, { waNumber: '081200000041', fullName: 'Peminjam Keputusan' });
    owner = await createMember(orgA.id, { waNumber: '081200000042', fullName: 'Pemilik Keputusan' });
    admin = await createMember(orgA.id, {
      waNumber: '081200000043',
      fullName: 'Pengurus Keputusan',
      role: 'ADMIN'
    });
    other = await createMember(orgA.id, { waNumber: '081200000044', fullName: 'Anggota Lain' });
    item = await createItem(orgA.id, owner.user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('pemilik menolak dengan alasan', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await patch('reject', owner.token, loan.id, {
      rejectionReason: 'Jadwal bentrok dengan pemakaian lain.'
    });

    expect(res.status).toBe(200);
    expect(res.body.loan.status).toBe('DITOLAK');
    expect(res.body.loan.rejectionReason).toContain('Jadwal bentrok');
    expect((await prisma.item.findUnique({ where: { id: item.id } }))!.status).toBe('TERSEDIA');
  });

  it('admin organisasi juga dapat menolak', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await patch('reject', admin.token, loan.id, { rejectionReason: 'Barang sedang perawatan.' });

    expect(res.status).toBe(200);
    expect(res.body.loan.status).toBe('DITOLAK');
  });

  it('alasan penolakan kurang dari 5 karakter ditolak', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await patch('reject', owner.token, loan.id, { rejectionReason: 'sib' });

    expect(res.status).toBe(400);
  });

  it('peminjam tidak dapat menolak pinjamannya sendiri', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await patch('reject', borrower.token, loan.id, { rejectionReason: 'Tidak jadi dipakai.' });

    expect(res.status).toBe(403);
  });

  it('loan lintas organisasi tidak ditemukan saat reject', async () => {
    const orgB = await createOrg('Organisasi Lain Tolak', 'ORGLAINTOLAK2026');
    const ownerB = await createMember(orgB.id, { waNumber: '081200000045', fullName: 'Pemilik B' });
    const itemB = await createItem(orgB.id, ownerB.user.id);
    const loanB = await createLoan(orgB.id, itemB.id, borrower.user.id, ownerB.user.id);

    const res = await patch('reject', owner.token, loanB.id, { rejectionReason: 'Tidak tersedia.' });

    expect(res.status).toBe(404);
  });

  it('loan yang tidak MENUNGGU tidak bisa ditolak', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, { status: 'AKTIF' });
    await prisma.item.update({ where: { id: item.id }, data: { status: 'DIPINJAM' } });

    const res = await patch('reject', owner.token, loan.id, { rejectionReason: 'Tidak tersedia.' });

    expect(res.status).toBe(409);
  });

  it('peminjam membatalkan pengajuan sendiri', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await patch('cancel', borrower.token, loan.id);

    expect(res.status).toBe(200);
    expect(res.body.loan.status).toBe('DIBATALKAN');
    expect((await prisma.item.findUnique({ where: { id: item.id } }))!.status).toBe('TERSEDIA');
  });

  it('pemilik tidak bisa membatalkan pengajuan peminjam', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await patch('cancel', owner.token, loan.id);

    expect(res.status).toBe(403);
  });

  it('anggota lain tidak bisa membatalkan', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await patch('cancel', other.token, loan.id);

    expect(res.status).toBe(403);
  });

  it('loan lintas organisasi tidak ditemukan saat cancel', async () => {
    const orgB = await createOrg('Organisasi Lain Batal', 'ORGLAINBATAL2026');
    const ownerB = await createMember(orgB.id, { waNumber: '081200000046', fullName: 'Pemilik B' });
    const itemB = await createItem(orgB.id, ownerB.user.id);
    const loanB = await createLoan(orgB.id, itemB.id, borrower.user.id, ownerB.user.id);

    const res = await patch('cancel', borrower.token, loanB.id);

    expect(res.status).toBe(404);
  });

  it('loan AKTIF tidak bisa dibatalkan', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, { status: 'AKTIF' });
    await prisma.item.update({ where: { id: item.id }, data: { status: 'DIPINJAM' } });

    const res = await patch('cancel', borrower.token, loan.id);

    expect(res.status).toBe(409);
  });

  it('mencatat audit penolakan dan pembatalan', async () => {
    const loanA = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);
    await patch('reject', owner.token, loanA.id, { rejectionReason: 'Jadwal bentrok dengan pemakaian lain.' });
    const loanB = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);
    await patch('cancel', borrower.token, loanB.id);

    const audits = await prisma.auditLog.findMany({ where: { orgId: orgA.id }, orderBy: { createdAt: 'asc' } });
    expect(audits.map((a) => a.action)).toEqual(['Menolak pinjaman', 'Membatalkan pinjaman']);
    expect(audits[0].actorId).toBe(owner.user.id);
    expect(audits[1].actorId).toBe(borrower.user.id);
  });
});
