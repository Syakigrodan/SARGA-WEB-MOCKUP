# SARGA Backend API

RESTful API backend untuk **SARGA (Platform Peminjaman dan Berbagi Barang untuk Komunitas dan Organisasi)** yang dirancang berdasarkan **SRS v1.2**.

---

## 🛠️ Tech Stack (Sesuai SRS Bagian 2.3 & 5.2)

- **Runtime**: Node.js (v20+ / v22+)
- **Framework**: Express (TypeScript)
- **Database**: SQLite (persistent local/cloud volume)
- **ORM**: Prisma ORM
- **Autentikasi**: JWT (JSON Web Tokens) & bcryptjs
- **Validasi**: Zod & Express Middlewares

---

## 📁 Struktur Direktori

```text
backend/
├── prisma/
│   ├── schema.prisma        # Skema database SQLite (organizations, users, items, loans, audit)
│   └── seed.ts              # Data awal untuk development
├── scripts/
│   └── prepare-test-db.js   # Menyiapkan test.db sebelum npm test
├── src/
│   ├── config/              # Klien Prisma dan konfigurasi lingkungan
│   ├── controllers/         # Handler REST API (auth, item, loan)
│   ├── middlewares/         # JWT, keanggotaan aktif, admin, error handler
│   ├── routes/              # Routing endpoint API (/api/v1/...)
│   ├── app.ts               # Setup Express application
│   └── server.ts            # Entry point listener
├── test/
│   ├── helpers.ts           # Reset DB dan fixture pengujian
│   ├── setup.ts             # Environment variabel untuk tes
│   ├── loan.test.ts         # Tes pengajuan pinjaman
│   └── org-isolation.test.ts # Tes isolasi organisasi
├── .env.example
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🚀 Cara Menjalankan

1. **Pasang Dependensi**:
   ```bash
   cd backend
   npm install
   ```

2. **Setup Konfigurasi Environment**:
   Salin `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Inisialisasi Database (Prisma SQLite)**:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run prisma:seed
   ```
   Di Windows dengan execution policy yang memblokir `npx.ps1`, gunakan `.\node_modules\.bin\prisma.cmd` sebagai pengganti `npx prisma`.

4. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Server akan aktif di `http://localhost:5000` dengan endpoint health check di `http://localhost:5000/api/health`.

---

## 🧪 Menjalankan Tes

```bash
npm test
```

Tes menggunakan Vitest dan Supertest. Sebelum tes berjalan, `pretest` menyiapkan `prisma/test.db` sehingga data development di `dev.db` tidak tersentuh. Seluruh tes harus hijau sebelum membuat PR.

---

## 📌 Endpoint Pengajuan Pinjaman

`POST /api/v1/loans` membutuhkan header `Authorization: Bearer <token>` dan `x-organization-id: <orgId>`.

```json
{
  "itemId": "<uuid barang>",
  "expectedReturnDate": "2026-11-25T10:00:00.000Z",
  "purpose": "Keperluan presentasi rapat tim mingguan"
}
```

Respons sukses: `{ "success": true, "loan": { ... }, "message": "..." }`. Status awal pinjaman adalah `MENUNGGU`.

Aturan yang divalidasi:

- Barang harus ada di organisasi aktif dan berstatus `TERSEDIA`.
- Peminjam tidak boleh menjadi pemilik barang.
- Tanggal kembali tidak boleh sebelum hari ini.
- Durasi pinjam tidak boleh melebihi `maxDays` barang.
- Tidak boleh ada pengajuan `MENUNGGU` lain untuk barang dan peminjam yang sama.

Kode status yang mungkin: `201` sukses, `400` validasi gagal, `403` keanggotaan belum terverifikasi, `404` barang tidak ditemukan di organisasi, `409` pengajuan ganda.

### Riwayat dan Monitoring Pinjaman

| Method | Endpoint | Akses | Filter |
|---|---|---|---|
| `GET` | `/api/v1/loans/me` | Anggota terverifikasi | `?status=` |
| `GET` | `/api/v1/loans` | Admin organisasi | `?status=`, `?q=`, `?overdue=true\|false` |

Respons list: `{ "success": true, "count": 2, "loans": [...] }`. Setiap loan menyertakan `isOverdue` dan `daysOverdue`; keterlambatan hanya penanda dan tidak mengubah `status`. `q` mencari nama/kode barang atau nama peminjam. Nilai `status` yang dikenal: `MENUNGGU`, `DITOLAK`, `DIBATALKAN`, `AKTIF`, `SELESAI`.

### Persetujuan Pinjaman

`PATCH /api/v1/loans/:id/approve` dapat dipanggil oleh pemilik barang atau admin organisasi. Hanya pinjaman `MENUNGGU` dengan barang `TERSEDIA` yang bisa disetujui. Dalam satu transaksi Prisma, status pinjaman menjadi `AKTIF`, status barang menjadi `DIPINJAM`, dan audit `Menyetujui pinjaman` ditulis. Jika salah satu mutasi gagal, seluruh transaksi di-rollback.

Respons sukses: `{ "success": true, "loan": { ... }, "message": "..." }`. Kode status: `200` sukses, `403` bukan pemilik/admin, `404` loan di organisasi lain, `409` state tidak sesuai atau barang tidak tersedia.

### Penolakan dan Pembatalan

| Method | Endpoint | Akses | Syarat |
|---|---|---|---|
| `PATCH` | `/api/v1/loans/:id/reject` | Pemilik barang atau admin | `rejectionReason` minimal 5 karakter |
| `PATCH` | `/api/v1/loans/:id/cancel` | Peminjam saja | Pinjaman masih `MENUNGGU` |

Keduanya hanya berlaku untuk pinjaman `MENUNGGU`, tidak mengubah status barang, dan menulis audit berturut-turut `Menolak pinjaman` dan `Membatalkan pinjaman`. Respons memakai `{ success, loan, message }`. Kode status: `200` sukses, `400` alasan terlalu pendek, `403` tanpa izin, `404` loan di organisasi lain, `409` state tidak sesuai.

### Konfirmasi Pengembalian

`PATCH /api/v1/loans/:id/return` dapat dipanggil pemilik barang atau admin organisasi. Hanya pinjaman `AKTIF` yang bisa dikonfirmasi. Satu transaksi Prisma mengubah pinjaman menjadi `SELESAI` dengan `returnConfirmedAt`, mengembalikan barang menjadi `TERSEDIA`, dan menulis audit `Mengonfirmasi pengembalian`. Identitas pengonfirmasi tercatat pada `AuditLog.actorId`.

Respons sukses: `{ "success": true, "loan": { ... }, "message": "..." }`. Kode status: `200` sukses, `403` peminjam/anggota lain, `404` loan di organisasi lain, `409` state tidak sesuai atau barang belum `DIPINJAM`.

### Pusat Verifikasi Anggota

Semua endpoint berikut memakai prefix `/api/v1/memberships` dan hanya untuk admin organisasi aktif.

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/pending` | Daftar `MENUNGGU_VERIFIKASI` beserta data user dan dokumen |
| `PATCH` | `/verify` | Body `{ "membershipId": "..." }` → `TERVERIFIKASI` |
| `PATCH` | `/reject` | Body `{ "membershipId": "...", "rejectionReason": "..." }` → `DITOLAK` |

Respons list: `{ success, count, memberships }`. Respons mutasi: `{ success, membership, message }`. `rejectionReason` minimal 5 karakter; verify menghapus alasan lama. Audit: `Memverifikasi anggota` / `Menolak anggota`. Kode status: `200`, `400` validasi gagal, `403` bukan admin, `404` target di organisasi lain, `409` state bukan `MENUNGGU_VERIFIKASI`.

### Manajemen Anggota

`PUT /api/v1/memberships/:id` dengan body `{ "role": "ADMIN" | "ANGGOTA", "position": "<1–50 karakter>" }`. Hanya admin organisasi. Proteksi pengurus tunggal: menurunkan satu-satunya admin terverifikasi ditolak dengan 409. Audit `Mengubah peran anggota`, respons `{ success, membership, message }`. Kode status: `200`, `400` input tidak valid, `403` bukan admin, `404` target di organisasi lain, `409` admin terakhir.

---

## ✅ Konvensi Pengembangan

- Struktur modular: `routes/` hanya mendaftarkan endpoint, `controllers/` menangani request dan response. Pindahkan logika ke `services/` hanya saat dipakai ulang.
- Maksimal **1.000 baris per file sumber**. Pecah file sebelum mendekati batas tersebut.
- Setiap fitur baru wajib memperbarui `README.md` ini dan `README.md` root.
- Ikuti TDD: tulis tes yang gagal, jalankan, implementasikan secara minimal, lalu jalankan `npm test` sampai seluruh suite hijau.
