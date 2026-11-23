import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { createItem, createMember, createOrg, resetDb } from './helpers';

describe('isolasi organisasi pada katalog barang', () => {
  let orgA: { id: string };
  let orgB: { id: string };
  let memberA: { token: string };
  let itemB: { id: string };

  beforeEach(async () => {
    await resetDb();
    orgA = await createOrg('Organisasi A', 'ORGA2026');
    orgB = await createOrg('Organisasi B', 'ORGB2026');
    memberA = await createMember(orgA.id, { waNumber: '081100000001', fullName: 'Anggota A' });
    const ownerB = await createMember(orgB.id, { waNumber: '081100000002', fullName: 'Pemilik B' });
    itemB = await createItem(orgB.id, ownerB.user.id, { name: 'Alat milik B' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('tidak mengembalikan barang organisasi lain lewat query orgId', async () => {
    const response = await request(app)
      .get('/api/v1/items')
      .query({ orgId: orgB.id })
      .set('Authorization', `Bearer ${memberA.token}`)
      .set('x-organization-id', orgA.id);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });

  it('menolak detail barang milik organisasi lain', async () => {
    const response = await request(app)
      .get(`/api/v1/items/${itemB.id}`)
      .set('Authorization', `Bearer ${memberA.token}`)
      .set('x-organization-id', orgA.id);

    expect(response.status).toBe(404);
  });

  it('menyimpan barang baru di organisasi aktif, bukan orgId dari body', async () => {
    const response = await request(app)
      .post('/api/v1/items')
      .set('Authorization', `Bearer ${memberA.token}`)
      .set('x-organization-id', orgA.id)
      .send({
        orgId: orgB.id,
        name: 'Alat baru A',
        maxDays: 3,
        location: 'Gudang A',
        description: 'Barang uji',
        contents: ['Unit utama'],
        instructions: 'Gunakan dengan benar',
        isSafeAndReady: true
      });

    expect(response.status).toBe(201);
    expect(response.body.item.orgId).toBe(orgA.id);
  });
});
