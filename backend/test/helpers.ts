import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../src/config/database';

export async function resetDb(): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.loanTransaction.deleteMany();
  await prisma.item.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

export async function createOrg(name: string, inviteCode: string) {
  return prisma.organization.create({
    data: {
      name,
      inviteCode,
      type: 'Komunitas',
      address: 'Jl. Test No. 1',
      contact: '081200000000'
    }
  });
}

export async function createMember(
  orgId: string,
  options: { waNumber: string; fullName: string; role?: 'ADMIN' | 'ANGGOTA'; status?: 'TERVERIFIKASI' | 'MENUNGGU_VERIFIKASI' }
) {
  const passwordHash = await bcrypt.hash('rahasia123', 10);
  const user = await prisma.user.create({
    data: {
      waNumber: options.waNumber,
      fullName: options.fullName,
      passwordHash,
      address: 'Alamat uji',
      primaryOrgId: orgId
    }
  });
  const membership = await prisma.membership.create({
    data: {
      userId: user.id,
      orgId,
      role: options.role ?? 'ANGGOTA',
      status: options.status ?? 'TERVERIFIKASI',
      position: 'Anggota'
    }
  });
  const token = jwt.sign(
    { id: user.id, waNumber: user.waNumber },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' as never }
  );
  return { user, membership, token };
}

export async function createItem(
  orgId: string,
  ownerId: string,
  overrides: { name?: string; maxDays?: number; status?: 'TERSEDIA' | 'DIPINJAM' } = {}
) {
  return prisma.item.create({
    data: {
      code: `ITM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      orgId,
      ownerId,
      name: overrides.name ?? 'Alat uji',
      maxDays: overrides.maxDays ?? 3,
      location: 'Gudang uji',
      status: overrides.status ?? 'TERSEDIA',
      description: 'Deskripsi uji',
      contents: JSON.stringify(['Unit utama']),
      instructions: 'Gunakan dengan benar',
      image: 'assets/placeholder-item.svg'
    }
  });
}

export async function createLoan(
  orgId: string,
  itemId: string,
  borrowerId: string,
  ownerId: string,
  overrides: {
    status?: 'MENUNGGU' | 'AKTIF' | 'DITOLAK' | 'DIBATALKAN' | 'SELESAI';
    startDate?: Date;
    endDate?: Date;
    purpose?: string;
    rejectionReason?: string;
    returnConfirmedAt?: Date;
  } = {}
) {
  return prisma.loanTransaction.create({
    data: {
      orgId,
      itemId,
      borrowerId,
      ownerId,
      startDate: overrides.startDate ?? new Date(),
      endDate: overrides.endDate ?? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: overrides.status ?? 'MENUNGGU',
      purpose: overrides.purpose ?? 'Keperluan uji monitoring pinjaman',
      ...(overrides.rejectionReason !== undefined ? { rejectionReason: overrides.rejectionReason } : {}),
      ...(overrides.returnConfirmedAt !== undefined ? { returnConfirmedAt: overrides.returnConfirmedAt } : {})
    }
  });
}

export function futureDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
