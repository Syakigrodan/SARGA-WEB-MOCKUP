import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createItem, createLoan, createMember, createOrg, resetDb } from './helpers';

describe('BE-SKI-11: persetujuan pinjaman', () => {
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
  const approve = (token: string, loanId: string, orgId = orgA.id) =>
    request(app).patch(`/api/v1/loans/${loanId}/approve`).set(auth(token, orgId));

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Approve', 'ORGAPPROVE2026');
    borrower = await createMember(orgA.id, { waNumber: '081200000031', fullName: 'Peminjam Approve' });
    owner = await createMember(orgA.id, { waNumber: '081200000032', fullName: 'Pemilik Approve' });
    admin = await createMember(orgA.id, {
      waNumber: '081200000033',
      fullName: 'Pengurus Approve',
      role: 'ADMIN'
    });
    other = await createMember(orgA.id, { waNumber: '081200000034', fullName: 'Anggota Lain' });
    item = await createItem(orgA.id, owner.user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('owner menyetujui pinjaman dan mengubah status barang', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await approve(owner.token, loan.id);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.loan.status).toBe('AKTIF');
    expect(res.body.message).toBeTruthy();
    const updated = await prisma.item.findUnique({ where: { id: item.id } });
    expect(updated!.status).toBe('DIPINJAM');
  });

  it('admin organisasi juga dapat menyetujui', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await approve(admin.token, loan.id);

    expect(res.status).toBe(200);
    expect(res.body.loan.status).toBe('AKTIF');
  });

  it('peminjam tidak bisa menyetujui pinjamannya sendiri', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await approve(borrower.token, loan.id);

    expect(res.status).toBe(403);
    const unchanged = await prisma.loanTransaction.findUnique({ where: { id: loan.id } });
    expect(unchanged!.status).toBe('MENUNGGU');
  });

  it('anggota bukan pemilik tidak bisa menyetujui', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await approve(other.token, loan.id);

    expect(res.status).toBe(403);
  });

  it('loan organisasi lain tidak ditemukan', async () => {
    const orgB = await createOrg('Organisasi Lain Approve', 'ORGLAINAPPROVE2026');
    const ownerB = await createMember(orgB.id, { waNumber: '081200000035', fullName: 'Pemilik B' });
    const itemB = await createItem(orgB.id, ownerB.user.id);
    const loanB = await createLoan(orgB.id, itemB.id, borrower.user.id, ownerB.user.id);

    const res = await approve(admin.token, loanB.id);

    expect(res.status).toBe(404);
  });

  it('loan yang sudah AKTIF ditolak dengan 409', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, { status: 'AKTIF' });
    await prisma.item.update({ where: { id: item.id }, data: { status: 'DIPINJAM' } });

    const res = await approve(owner.token, loan.id);

    expect(res.status).toBe(409);
  });

  it('barang tidak tersedia memicu rollback', async () => {
    await prisma.item.update({ where: { id: item.id }, data: { status: 'PERAWATAN' } });
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await approve(owner.token, loan.id);

    expect(res.status).toBe(409);
    const unchanged = await prisma.loanTransaction.findUnique({ where: { id: loan.id } });
    expect(unchanged!.status).toBe('MENUNGGU');
    const itemAfter = await prisma.item.findUnique({ where: { id: item.id } });
    expect(itemAfter!.status).toBe('PERAWATAN');
  });

  it('mencatat audit approve', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    await approve(owner.token, loan.id);

    const audit = await prisma.auditLog.findFirst({ where: { orgId: orgA.id } });
    expect(audit!.action).toBe('Menyetujui pinjaman');
    expect(audit!.actorId).toBe(owner.user.id);
    expect(audit!.target).toBe(loan.id);
  });
});
