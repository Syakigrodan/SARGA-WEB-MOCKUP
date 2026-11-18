import { PrismaClient, Role, VerificationStatus, ItemStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing tables (in order of foreign keys)
  await prisma.auditLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.loanTransaction.deleteMany();
  await prisma.item.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 1. Create Organizations
  const orgGraha = await prisma.organization.create({
    data: {
      name: 'Komunitas Graha Indah',
      type: 'Komunitas',
      address: 'Perum Graha Indah Blok C, Jakarta',
      contact: '081234567890',
      inviteCode: 'GRAHA2026',
      status: 'Aktif'
    }
  });

  const orgNusantara = await prisma.organization.create({
    data: {
      name: 'PT Nusantara Digital',
      type: 'Kantor',
      address: 'Gedung Cyber 2 Lt. 14, Kuningan, Jakarta Selatan',
      contact: '081298765432',
      inviteCode: 'NUSANTARA2026',
      status: 'Aktif'
    }
  });

  console.log('✅ Organizations created:', orgGraha.name, orgNusantara.name);

  // 2. Create Users
  const passwordAdmin = await bcrypt.hash('Admin123!', 10);
  const passwordAnggota = await bcrypt.hash('Anggota123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      waNumber: '081234567890',
      fullName: 'Hendra Pengurus',
      passwordHash: passwordAdmin,
      address: 'Jl. Graha Indah No. 12',
      primaryOrgId: orgGraha.id
    }
  });

  const memberUser = await prisma.user.create({
    data: {
      waNumber: '081299998888',
      fullName: 'Budi Santoso',
      passwordHash: passwordAnggota,
      address: 'Jl. Graha Indah No. 45',
      primaryOrgId: orgGraha.id
    }
  });

  console.log('✅ Users created:', adminUser.fullName, memberUser.fullName);

  // 3. Create Memberships
  await prisma.membership.create({
    data: {
      userId: adminUser.id,
      orgId: orgGraha.id,
      role: Role.ADMIN,
      position: 'Ketua / Pengurus Utama',
      status: VerificationStatus.TERVERIFIKASI,
      address: 'Blok C1 No. 12'
    }
  });

  await prisma.membership.create({
    data: {
      userId: memberUser.id,
      orgId: orgGraha.id,
      role: Role.ANGGOTA,
      position: 'Anggota Aktif',
      status: VerificationStatus.TERVERIFIKASI,
      documentType: 'KTP',
      documentUrl: 'assets/img/sample-ktp.svg',
      documentName: 'ktp-budi.jpg',
      address: 'Blok C3 No. 45'
    }
  });

  console.log('✅ Memberships linked');

  // 4. Create Items
  const itemsData = [
    {
      code: 'ITM-001',
      orgId: orgGraha.id,
      name: 'Set Obeng Presisi Elektrik',
      description: 'Set obeng presisi elektrik 24 mata bor untuk perbaikan elektronik dan gawai rumah tangga.',
      contents: JSON.stringify(['Gagang obeng elektrik', '24 mata bor baja S2', 'Kabel USB-C', 'Kotak aluminium']),
      instructions: 'Gunakan torsi rendah untuk sekrup plastik kecil. Cas selama 1 jam sebelum penggunaan jangka panjang.',
      image: 'assets/img/obeng.jpg',
      location: 'Lemari Perkakas A1',
      maxDays: 3,
      status: ItemStatus.TERSEDIA
    },
    {
      code: 'ITM-002',
      orgId: orgGraha.id,
      name: 'Tangga Lipat Aluminium 3.8m',
      description: 'Tangga teleskopik multifungsi aluminium dengan daya tampung beban maksimal 150kg.',
      contents: JSON.stringify(['Tangga lipat teleskopik', 'Kaki karet anti-slip']),
      instructions: 'Pastikan kunci engsel di tiap undakan terkunci klik sempurna sebelum dinaiki.',
      image: 'assets/img/tangga.jpg',
      location: 'Gudang Samping Blok C',
      maxDays: 2,
      status: ItemStatus.TERSEDIA
    },
    {
      code: 'ITM-003',
      orgId: orgGraha.id,
      name: 'Tenda Dome Kapasitas 4 Orang',
      description: 'Tenda kemping double layer tahan air dengan frame fiber dan terpal alas.',
      contents: JSON.stringify(['Tenda inner', 'Flysheet waterproof', 'Set frame fiber', '8 pasak besi', 'Tas simpan']),
      instructions: 'Bersihkan dan jemur sampai kering sebelum disimpan kembali ke dalam tas.',
      image: 'assets/img/tenda.jpg',
      location: 'Gudang Perlengkapan B2',
      maxDays: 4,
      status: ItemStatus.DIPINJAM
    },
    {
      code: 'ITM-004',
      orgId: orgGraha.id,
      name: 'Mesin Potong Rumput 2-Tak',
      description: 'Pemotong rumput portable tenaga bensin campur untuk halaman dan lapangan bersama.',
      contents: JSON.stringify(['Mesin rumput', 'Mata pisau baja', 'Kacamata pelindung safety', 'Botol takar campur bensin']),
      instructions: 'Gunakan campuran bensin dan oli samping 25:1. Wajib gunakan pelindung mata dan sepatu.',
      image: 'assets/img/mower.jpg',
      location: 'Gudang Alat Berat',
      maxDays: 1,
      status: ItemStatus.TERSEDIA
    },
    {
      code: 'ITM-005',
      orgId: orgGraha.id,
      name: 'Proyektor Mini Portable 1080p',
      description: 'Proyektor multimedia HDMI/WiFi untuk nobar, rapat warga, dan presentasi.',
      contents: JSON.stringify(['Proyektor unit', 'Remote control', 'Kabel HDMI 3m', 'Kabel power', 'Tripod mini']),
      instructions: 'Hindari mematikan stop kontak secara mendadak agar kipas pendingin lampu mati sempurna.',
      image: 'assets/img/projector.jpg',
      location: 'Ruang Sekretariat',
      maxDays: 3,
      status: ItemStatus.TERSEDIA
    }
  ];

  for (const item of itemsData) {
    await prisma.item.create({ data: item });
  }

  console.log('✅ Inventory items seeded:', itemsData.length, 'items');

  // 5. Create Sample Announcement
  await prisma.announcement.create({
    data: {
      orgId: orgGraha.id,
      authorId: adminUser.id,
      title: 'Jadwal Pemeliharaan Alat Bulanan',
      content: 'Bagi seluruh anggota yang meminjam perkakas mesin, mohon diperiksa kondisi dan kebersihan sebelum pengembalian.'
    }
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
