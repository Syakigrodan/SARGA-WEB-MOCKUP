import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createItem, createMember, createOrg, futureDate, resetDb } from './helpers';

describe('POST /api/v1/loans', () => {
  let orgA: { id: string };
  let borrower: { user: { id: string }; token: string };
  let owner: { user: { id: string }; token: string };
  let item: { id: string; name: string };

  const payload = (overrides: Record<string, unknown> = {}) => ({
    itemId: item.id,
    expectedReturnDate: futureDate(2),
    purpose: 'Keperluan presentasi rapat tim mingguan',
    ...overrides
  });

  const postLoan = (token: string, body: Record<string, unknown>, orgId = orgA.id) =>
    request(app)
      .post('/api/v1/loans')
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send(body);

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Peminjam', 'ORGPINJAM2026');
    borrower = await createMember(orgA.id, { waNumber: '081200000011', fullName: 'Peminjam Uji' });
    owner = await createMember(orgA.id, { waNumber: '081200000012', fullName: 'Pemilik Uji' });
    item = await createItem(orgA.id, owner.user.id, { name: 'Alat uji pinjam', maxDays: 3 });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('membuat pengajuan dengan status MENUNGGU dan mengembalikan bentuk respons backend', async () => {
    const response = await postLoan(borrower.token, payload());

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBeTruthy();
    expect(response.body.loan).toMatchObject({
      orgId: orgA.id,
      itemId: item.id,
      borrowerId: borrower.user.id,
      ownerId: owner.user.id,
      status: 'MENUNGGU',
      purpose: 'Keperluan presentasi rapat tim mingguan'
    });
    expect(response.body.data).toBeUndefined();
  });

  it('menolak peminjaman barang milik sendiri', async () => {
    const response = await postLoan(owner.token, payload());

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('menolak rentang pinjam melebihi maxDays barang', async () => {
    const response = await postLoan(borrower.token, payload({ expectedReturnDate: futureDate(4) }));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('menolak tanggal kembali di masa lalu', async () => {
    const response = await postLoan(borrower.token, payload({ expectedReturnDate: futureDate(-1) }));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('menolak barang yang sedang dipinjam', async () => {
    const unavailable = await createItem(orgA.id, owner.user.id, { status: 'DIPINJAM' });
    const response = await postLoan(borrower.token, payload({ itemId: unavailable.id }));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('menolak pengajuan ganda untuk barang yang sama', async () => {
    await postLoan(borrower.token, payload());
    const response = await postLoan(borrower.token, payload());

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  it('menolak barang milik organisasi lain', async () => {
    const orgB = await createOrg('Organisasi Lain', 'ORGLAIN2026');
    const ownerB = await createMember(orgB.id, { waNumber: '081200000013', fullName: 'Pemilik B' });
    const itemB = await createItem(orgB.id, ownerB.user.id);

    const response = await postLoan(borrower.token, payload({ itemId: itemB.id }));

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('menolak anggota yang belum terverifikasi', async () => {
    const pending = await createMember(orgA.id, {
      waNumber: '081200000014',
      fullName: 'Anggota Menunggu',
      status: 'MENUNGGU_VERIFIKASI'
    });

    const response = await postLoan(pending.token, payload());

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('menulis log audit pengajuan pinjaman', async () => {
    await postLoan(borrower.token, payload());

    const log = await prisma.auditLog.findFirst({
      where: { orgId: orgA.id, actorId: borrower.user.id, action: 'Mengajukan pinjaman' }
    });

    expect(log).not.toBeNull();
    expect(log!.target).toBe(item.name);
  });
});
