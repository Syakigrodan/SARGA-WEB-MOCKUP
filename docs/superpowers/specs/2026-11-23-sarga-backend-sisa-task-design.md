# SARGA Backend — Sisa Task BE-SKI-10..16

Tanggal: 2026-11-23

## Intent

Menyelesaikan seluruh alokasi backend Saki yang tersisa (`BE-SKI-10` sampai `BE-SKI-16`) di atas kode yang sudah di-merge lewat PR #5 dan dokumentasi PR #6. Setiap task dikirim sebagai PR tersendiri ke `DEV`, dikerjakan dengan TDD, dan mematuhi konvensi tim: modular, maksimal 1.000 baris per file sumber, serta `README.md` dan `All Feature.md` ikut diperbarui.

## Goals

- Menghadirkan API riwayat/monitoring pinjaman, approve, reject/cancel, return, verifikasi anggota, manajemen anggota, dan upload ber-watermark.
- Tujuh PR kecil ke `DEV`, satu per task, dibuat berurutan dari branch task sebelumnya sehingga diff tiap PR hanya berisi task tersebut.
- Seluruh perilaku dibuktikan dengan tes Vitest + Supertest yang ditulis lebih dulu (RED), lalu diimplementasikan sampai GREEN.
- Isolasi organisasi tetap dipaksakan: `orgId` selalu berasal dari `req.membership`, bukan body/query.
- Respons dan penamaan konsisten dengan endpoint loan yang sudah ada: `{ success, loan, message }` untuk mutasi tunggal.

## Non-goals

- Perubahan frontend. `LoanService` tetap menjadi catatan alignment untuk Wildan.
- Notifikasi WhatsApp/email, denda keterlambatan, skor amah, laporan cetak, dan sengketa barang rusak.
- Cloudinary. Storage yang dipilih adalah direktori lokal `backend/uploads/`.
- Perubahan skema Prisma. Field yang sudah ada cukup; identitas pengonfirmasi pengembalian dicatat di `AuditLog`.
- Mengikuti enum SRS `MENUNGGU_PERSETUJUAN` / `AKTIF_DIPINJAM`. Task board lebih baru dan memutuskan `MENUNGGU` → `AKTIF` langsung saat approve.

## Anti-goals

- Mengembalikan bentuk `{ success, data }` untuk loan; front-end yang harus menyesuaikan.
- Menerima `orgId` dari request dan mempercayainya.
- Menyimpan hasil upload ke root repositori atau memasukkan file biner ke Git.
- Membuat satu file controller loan yang membengkak melebihi batas 1.000 baris.

## Constraints

- Stack tetap: Node.js + Express + TypeScript, Prisma SQLite, JWT, bcryptjs, Vitest, Supertest.
- Database tes terpisah (`prisma/test.db`) lewat `npm test`; `dev.db` tidak boleh tersentuh.
- Task 10 harus lebih dulu karena 11–13 mengubah state yang sama.
- Task 14–15 berbagi controller/route membership baru.
- Task 16 membutuhkan dependency `sharp` dan `multer` sudah terpasang.
- Setiap PR wajib lulus `npm test` dan `npm run build`, lalu memperbarui dokumentasi yang relevan.

## Approaches yang dipertimbangkan

### Strategi PR
- **Satu PR per task (dipilih).** Tujuh PR kecil, branch berurutan `feat/be-ski-10` → `...16`. Review mudah dan bug terisolasi. Biayanya: urutan merge harus dijaga.
- Tiga PR per kelompok (loan, membership, watermark). Lebih sedikit PR, tapi diff loan tetap besar.
- Satu PR besar. Paling cepat, paling sulit di-review dan dibatalkan sebagian.

### State machine loan
- **Ikuti task board (dipilih).** `approve` mengubah `MENUNGGU` → `AKTIF` dan barang → `DIPINJAM` dalam satu transaksi. SRS masih menandai transisi `DISETUJUI` sebagai TBD, jadi tidak diimplementasikan.
- Ikuti SRS lengkap dengan status `DISETUJUI`. Menambah state yang belum ada di schema dan belum diputuskan tim.

### Watermark
- **sharp + storage lokal + endpoint (dipilih).** Dapat diuji penuh tanpa kredensial; lapisan storage bisa diganti kemudian.
- sharp + Cloudinary. Butuh kredensial dan tidak bisa diverifikasi di lingkungan ini.
- Middleware saja. Tidak ada jalur penyimpanan nyata sehingga sulit dibuktikan.

## Design

### Modul bersama

- `src/utils/http-error.ts` — kelas `HttpError` kecil berisi `statusCode` dan `message`, dipakai transaksi untuk memicu rollback dengan status HTTP yang jelas.
- `src/services/loan-view.service.ts` — fungsi `toLoanView(loan)` yang menambahkan `item`, `borrower`, `owner`, `isOverdue`, dan `daysOverdue`. Dipakai oleh semua endpoint loan agar tidak duplication.
- `src/middlewares/auth.middleware.ts` tetap. `requireAdmin` berarti `role === 'ADMIN'` pada membership organisasi aktif.
- Helper `withOrg(orgId)` tidak dibuat; tiap query menuliskan `orgId` secara eksplisit agar isolasi terlihat di review.

`isOverdue` bernilai `true` hanya jika `status === 'AKTIF'` dan `endDate` sudah lewat. Status tersimpan tidak diubah; ini mengikuti catatan SRS bahwa keterlambatan hanya memunculkan penanda.

Semua endpoint mengembalikan `message` kecuali endpoint list, yang mengembalikan `{ success, count, <nama-koleksi> }`.

### BE-SKI-10 — Riwayat & monitoring

- `GET /api/v1/loans/me` — `authenticateToken`, `requireActiveMember`. Filter opsional `?status=` (satu nilai `LoanStatus`). Hanya `borrowerId = req.user.id` dan `orgId` aktif. Urut `createdAt desc`.
- `GET /api/v1/loans` — `authenticateToken`, `requireActiveMember`, `requireAdmin`. Filter opsional `?status=`, `?q=` (nama barang, kode barang, atau nama peminjam), `?overdue=true|false`. Scope `orgId` aktif. Urut `createdAt desc`.
- Status query yang tidak dikenal → 400.
- Keduanya memakai `toLoanView`.

### BE-SKI-11 — Approve

- `PATCH /api/v1/loans/:id/approve` — `authenticateToken`, `requireActiveMember`.
- Diizinkan untuk `ADMIN` organisasi atau `ownerId` barang. Peminjam bukan pemilik tidak diizinkan.
- Prasyarat: loan harus ada dan berada di `orgId` aktif; jika tidak → 404. Setelah itu, status harus `MENUNGGU` dan item masih `TERSEDIA`; jika tidak → 409.
- Satu `prisma.$transaction` interaktif: `updateMany` loan (`MENUNGGU` → `AKTIF`), `updateMany` item (`TERSEDIA` → `DIPINJAM`), `auditLog` action `Menyetujui pinjaman`. Jika salah satu `count` nol, lempar `HttpError(409)` supaya transaksi rollback.
- Respons `{ success, loan, message }`.

### BE-SKI-12 — Reject & cancel

- `PATCH /api/v1/loans/:id/reject` — admin atau pemilik. `rejectionReason` wajib minimal 5 karakter. Hanya untuk `MENUNGGU`. Update status `DITOLAK`, simpan alasan, tulis audit `Menolak pinjaman`.
- `PATCH /api/v1/loans/:id/cancel` — hanya peminjam. Hanya untuk `MENUNGGU`. Update status `DIBATALKAN`, tulis audit `Membatalkan pinjaman`.
- Loan yang tidak ada atau di organisasi lain → 404; state yang bukan `MENUNGGU` → 409. Keduanya tidak mengubah status barang. Response `{ success, loan, message }`.

### BE-SKI-13 — Return

- `PATCH /api/v1/loans/:id/return` — admin atau pemilik (keputusan ini mengisi sebagian TBD SRS; admin diizinkan untuk barang komunal maupun pribadi dalam organisasi yang sama).
- Loan yang tidak ada atau di organisasi lain → 404; state yang bukan `AKTIF` → 409. Transaksi: loan → `SELESAI` + `returnConfirmedAt = now`, item → `TERSEDIA`, audit `Mengonfirmasi pengembalian`.
- Identitas pengonfirmasi tidak ditambahkan ke schema; actor tercatat di `AuditLog`.

### BE-SKI-14 — Pusat verifikasi

- Controller/route baru: `membership.controller.ts`, `membership.routes.ts`. Semua endpoint membership dipasang di `/api/v1/memberships` (jadi `GET /api/v1/memberships/pending`, `PATCH /api/v1/memberships/verify`, `PATCH /api/v1/memberships/reject`, dan `PUT /api/v1/memberships/:id`).
- `GET /pending` — admin, scope `orgId`, status `MENUNGGU_VERIFIKASI`, sertakan data user dan dokumen. Respons `{ success, memberships, count }`.
- `PATCH /verify` — admin, body `{ membershipId }`. Target harus satu org. Hanya dari `MENUNGGU_VERIFIKASI` → `TERVERIFIKASI`, `rejectionReason = null`, audit `Memverifikasi anggota`.
- `PATCH /reject` — admin, body `{ membershipId, rejectionReason }` minimal 5 karakter. Hanya dari `MENUNGGU_VERIFIKASI` → `DITOLAK` (state lain → 409), audit `Menolak anggota`.
- Status/role target tidak boleh diubah lewat endpoint ini selain status verifikasi.

### BE-SKI-15 — Manajemen anggota

- `PUT /memberships/:id` — admin, scope `orgId`. Body `{ role, position }`.
- `role` harus `ADMIN` atau `ANGGOTA`; `position` string 1–50 karakter.
- Proteksi pengurus tunggal: hitung membership dengan `role = ADMIN` dan `status = TERVERIFIKASI` di org. Jika target saat ini termasuk hitungan itu dan role baru `ANGGOTA` serta jumlahnya `<= 1` → 409.
- Audit `Mengubah peran anggota`. Respons `{ success, membership, message }`.

### BE-SKI-16 — Watermark forensik

- Tambah dependency `sharp`.
- `src/middlewares/upload.middleware.ts`:
  - `uploadImage`: `multer({ storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: image/jpeg|png|webp }).single('image')`.
  - `watermarkImage`: baca `req.file.buffer`, ambil metadata gambar, buat overlay SVG berisi teks diagonal berulang: nama organisasi, nama pengurus penanggung jawab + nomor WA, dan timestamp WIB. Karakter XML di-escape. Komposit dengan `sharp`, keluarkan JPEG.
  - Sumber "pengurus penanggung jawab": uploader jika `role = ADMIN`, otherwise membership `ADMIN` dengan `status = TERVERIFIKASI` pertama di organisasi (diurutkan `joinedAt asc`), fallback ke `Organization.contact` untuk WA dan nama organisasi untuk nama. Ini keputusan Saki; teks yang terpakai dikembalikan di respons sebagai `watermarkText` supaya tes bisa memastikannya.
  - Simpan ke `backend/uploads/<orgId>/<uuid>.jpg` dengan `fs.mkdir(..., { recursive: true })`. Isi `req.processedImage = { path, url: '/uploads/<orgId>/<nama>', name, watermarkText }`.
  - File >5 MB atau MIME selain gambar → 400 lewat `errorHandler`.
- `src/routes/upload.routes.ts` mendaftarkan `POST /api/v1/uploads` dengan `authenticateToken`, `requireActiveMember`, `uploadImage`, `watermarkImage`, `uploadImageHandler`.
- `app.ts` menyajikan `express.static` untuk `/uploads` dari `process.cwd()/uploads`.
- `.gitignore` mengabaikan `backend/uploads/*` kecuali `.gitkeep`.
- Respons `{ success, image, message }`.

### Tes per PR

Urutan TDD per task: tulis tes baru (RED) → jalankan hanya file itu untuk melihat kegagalan → implementasi minimal → jalankan `npm test` penuh + `npm run build`.

- Task 10: filter status, filter admin `q`/`overdue`, penanda overdue, isolasi org, penolakan anggota/admin salah.
- Task 11: approve oleh owner/admin, 403 untuk peminjam, 409 untuk state salah, item berubah `DIPINJAM`, rollback saat item tidak tersedia, audit.
- Task 12: reject dengan alasan, reject tanpa alasan → 400, cancel oleh peminjam, cancel oleh orang lain → 403, state salah → 409.
- Task 13: return mengubah loan/item, `returnConfirmedAt` terisi, 403 untuk peminjam, 409 untuk state salah.
- Task 14: daftar pending, verify, reject, target org lain → 404, non-admin → 403.
- Task 15: ubah role/position, proteksi admin terakhir → 409, target org lain → 404.
- Task 16: upload gambar valid menghasilkan file + URL, MIME invalid → 400, >5 MB → 400, tanpa file → 400, teks watermark mengandung nama org/pengurus.

Fixtures baru di `test/helpers.ts`: `createLoan(...)`, `createMembership(...)` dengan status/dokumen opsional, dan `withAdmin(...)`. Tetap di bawah 1.000 baris; kalau helper membengkak, pecah menjadi `test/factories/*.ts`.

### Dokumentasi per PR

- `All Feature.md`: centang task, status `Selesai`, tanggal `2026-11-23` (atau tanggal eksekusi), dan catatan teknis sesuai implementasi.
- `README.md` dan `backend/README.md`: tambah baris endpoint baru dan kontrak responsnya. Karena PR #6 sudah merge, perubahan ini bersih di tiap branch.
- `backend/README.md`: sebut dependensi `sharp` dan direktori upload pada task 16.

### Urutan PR

| Branch | Base | PR title |
|---|---|---|
| `feat/be-ski-10` | `DEV` | `feat(backend): add loan history and admin monitoring (BE-SKI-10)` |
| `feat/be-ski-11` | `feat/be-ski-10` | `feat(backend): add loan approval transaction (BE-SKI-11)` |
| `feat/be-ski-12` | `feat/be-ski-11` | `feat(backend): add loan rejection and cancellation (BE-SKI-12)` |
| `feat/be-ski-13` | `feat/be-ski-12` | `feat(backend): add loan return confirmation (BE-SKI-13)` |
| `feat/be-ski-14` | `feat/be-ski-13` | `feat(backend): add membership verification center (BE-SKI-14)` |
| `feat/be-ski-15` | `feat/be-ski-14` | `feat(backend): add member management with admin protection (BE-SKI-15)` |
| `feat/be-ski-16` | `feat/be-ski-15` | `feat(backend): add forensic watermark upload (BE-SKI-16)` |

Setiap PR di-push ke `myfork` karena push ke `origin` ditolak untuk akun `Syakigrodan`.

## Yang diserahkan ke builder

- Nama file helper/detail struktur mini selama tetap modular dan <1.000 baris.
- Layout visual SVG watermark dan format timestamp WIB yang paling mudah diuji.
- Detail fixture test dan urutan `beforeEach` sepanjang database tetap di-reset.
- Pesan error final dalam bahasa Indonesia yang konsisten dengan gaya kode yang ada.
