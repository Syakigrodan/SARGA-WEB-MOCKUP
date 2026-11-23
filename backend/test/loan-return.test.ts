import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createItem, createLoan, createMember, createOrg, resetDb } from './helpers';

describe('BE-SKI-13: konfirmasi pengembalian', () => {
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
  const returnLoan = (token: string, loanId: string, orgId = orgA.id) =>
    request(app).patch(`/api/v1/loans/${loanId}/return`).set(auth(token, orgId));

  const activeLoan = async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, { status: 'AKTIF' });
    await prisma.item.update({ where: { id: item.id }, data: { status: 'DIPINJAM' } });
    return loan;
  };

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Kembali', 'ORGKEMBALI2026');
    borrower = await createMember(orgA.id, { waNumber: '081200000051', fullName: 'Peminjam Kembali' });
    owner = await createMember(orgA.id, { waNumber: '081200000052', fullName: 'Pemilik Kembali' });
    admin = await createMember(orgA.id, {
      waNumber: '081200000053',
      fullName: 'Pengurus Kembali',
      role: 'ADMIN'
    });
    other = await createMember(orgA.id, { waNumber: '081200000054', fullName: 'Anggota Lain' });
    item = await createItem(orgA.id, owner.user.id);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('owner mengonfirmasi pengembalian', async () => {
    const loan = await activeLoan();

    const res = await returnLoan(owner.token, loan.id);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.loan.status).toBe('SELESAI');
    expect(res.body.loan.returnConfirmedAt).toBeTruthy();
    expect(res.body.loan.isOverdue).toBe(false);
    expect((await prisma.item.findUnique({ where: { id: item.id } }))!.status).toBe('TERSEDIA');
  });

  it('admin organisasi juga dapat mengonfirmasi', async () => {
    const loan = await activeLoan();

    const res = await returnLoan(admin.token, loan.id);

    expect(res.status).toBe(200);
    expect(res.body.loan.status).toBe('SELESAI');
  });

  it('peminjam tidak bisa mengonfirmasi pengembalian', async () => {
    const loan = await activeLoan();

    const res = await returnLoan(borrower.token, loan.id);

    expect(res.status).toBe(403);
    const unchanged = await prisma.loanTransaction.findUnique({ where: { id: loan.id } });
    expect(unchanged!.status).toBe('AKTIF');
  });

  it('anggota lain tidak bisa mengonfirmasi pengembalian', async () => {
    const loan = await activeLoan();

    const res = await returnLoan(other.token, loan.id);

    expect(res.status).toBe(403);
  });

  it('loan organisasi lain tidak ditemukan', async () => {
    const orgB = await createOrg('Organisasi Lain Kembali', 'ORGLAINKEMBALI2026');
    const ownerB = await createMember(orgB.id, { waNumber: '081200000055', fullName: 'Pemilik B' });
    const itemB = await createItem(orgB.id, ownerB.user.id);
    const loanB = await createLoan(orgB.id, itemB.id, borrower.user.id, ownerB.user.id, { status: 'AKTIF' });

    const res = await returnLoan(admin.token, loanB.id);

    expect(res.status).toBe(404);
  });

  it('loan MENUNGGU tidak bisa dikonfirmasi', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);

    const res = await returnLoan(owner.token, loan.id);

    expect(res.status).toBe(409);
  });

  it('barang belum berstatus DIPINJAM memicu rollback', async () => {
    const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, { status: 'AKTIF' });

    const res = await returnLoan(owner.token, loan.id);

    expect(res.status).toBe(409);
    const unchanged = await prisma.loanTransaction.findUnique({ where: { id: loan.id } });
    expect(unchanged!.status).toBe('AKTIF');
    expect(unchanged!.returnConfirmedAt).toBeNull();
  });

  it('mencatat audit pengembalian', async () => {
    const loan = await activeLoan();

    await returnLoan(admin.token, loan.id);

    const audit = await prisma.auditLog.findFirst({ where: { orgId: orgA.id } });
    expect(audit!.action).toBe('Mengonfirmasi pengembalian');
    expect(audit!.actorId).toBe(admin.user.id);
    expect(audit!.target).toBe(loan.id);
  });
});
