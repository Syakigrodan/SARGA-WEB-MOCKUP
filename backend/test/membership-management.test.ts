import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createMember, createOrg, resetDb } from './helpers';

describe('BE-SKI-15: manajemen anggota', () => {
  let orgA: { id: string };
  let admin: { user: { id: string }; token: string; membership: { id: string } };
  let secondAdmin: { user: { id: string }; token: string; membership: { id: string } };
  let target: { user: { id: string }; token: string; membership: { id: string } };

  const auth = (token: string, orgId: string) => ({
    Authorization: `Bearer ${token}`,
    'x-organization-id': orgId
  });
  const update = (membershipId: string, token: string, body: Record<string, unknown>, orgId = orgA.id) =>
    request(app).put(`/api/v1/memberships/${membershipId}`).set(auth(token, orgId)).send(body);

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi Manajemen', 'ORGMANAJEMEN2026');
    admin = await createMember(orgA.id, {
      waNumber: '081200000081',
      fullName: 'Pengurus Utama',
      role: 'ADMIN'
    });
    secondAdmin = await createMember(orgA.id, {
      waNumber: '081200000082',
      fullName: 'Pengurus Kedua',
      role: 'ADMIN'
    });
    target = await createMember(orgA.id, { waNumber: '081200000083', fullName: 'Anggota Target' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('admin mengubah role dan jabatan anggota', async () => {
    const res = await update(target.membership.id, admin.token, { role: 'ADMIN', position: 'Bendahara' });

    expect(res.status).toBe(200);
    expect(res.body.membership.role).toBe('ADMIN');
    expect(res.body.membership.position).toBe('Bendahara');
  });

  it('menurunkan admin terakhir ditolak', async () => {
    await prisma.membership.update({
      where: { id: secondAdmin.membership.id },
      data: { role: 'ANGGOTA' }
    });

    const res = await update(admin.membership.id, admin.token, { role: 'ANGGOTA', position: 'Anggota' });

    expect(res.status).toBe(409);
    const unchanged = await prisma.membership.findUnique({ where: { id: admin.membership.id } });
    expect(unchanged!.role).toBe('ADMIN');
  });

  it('admin yang masih punya rekan dapat diturunkan', async () => {
    const res = await update(secondAdmin.membership.id, admin.token, {
      role: 'ANGGOTA',
      position: 'Sekretaris'
    });

    expect(res.status).toBe(200);
    expect(res.body.membership.role).toBe('ANGGOTA');
  });

  it('role tidak valid ditolak', async () => {
    const res = await update(target.membership.id, admin.token, { role: 'OWNER', position: 'Anggota' });

    expect(res.status).toBe(400);
  });

  it('jabatan lebih dari 50 karakter ditolak', async () => {
    const res = await update(target.membership.id, admin.token, {
      role: 'ANGGOTA',
      position: 'x'.repeat(51)
    });

    expect(res.status).toBe(400);
  });

  it('jabatan kosong ditolak', async () => {
    const res = await update(target.membership.id, admin.token, { role: 'ANGGOTA', position: '   ' });

    expect(res.status).toBe(400);
  });

  it('target organisasi lain tidak ditemukan', async () => {
    const orgB = await createOrg('Organisasi Lain Kelola', 'ORGLAINKELOLA2026');
    const targetB = await createMember(orgB.id, { waNumber: '081200000084', fullName: 'Anggota Org B' });

    const res = await update(targetB.membership.id, admin.token, { role: 'ADMIN', position: 'Bendahara' });

    expect(res.status).toBe(404);
  });

  it('anggota biasa tidak bisa mengubah peran', async () => {
    const res = await update(target.membership.id, target.token, { role: 'ADMIN', position: 'Bendahara' });

    expect(res.status).toBe(403);
  });

  it('mencatat audit perubahan peran', async () => {
    await update(target.membership.id, admin.token, { role: 'ADMIN', position: 'Bendahara' });

    const audit = await prisma.auditLog.findFirst({ where: { orgId: orgA.id } });
    expect(audit!.action).toBe('Mengubah peran anggota');
    expect(audit!.actorId).toBe(admin.user.id);
    expect(audit!.target).toBe(target.membership.id);
  });
});
