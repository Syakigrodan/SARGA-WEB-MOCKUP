# SARGA Backend Sisa Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Selesaikan BE-SKI-10 sampai BE-SKI-16 sebagai tujuh PR berurutan ke `DEV`, masing-masing dengan TDD, dokumentasi, dan batas 1.000 baris per file sumber.

**Architecture:** Endpoint baru memakai Express router tipis yang memanggil controller per-domain. Logika bersama (view loan, transisi state, HttpError) ditempatkan di `services/` dan `utils/` supaya controller tetap kecil. Semua query difilter oleh `orgId` dari `req.membership`, bukan dari request.

**Tech Stack:** Node.js, Express, TypeScript, Prisma SQLite, JWT, Vitest, Supertest, multer, sharp.

**Spec:** `docs/superpowers/specs/2026-11-23-sarga-backend-sisa-task-design.md`

## Global Constraints

- Base URL: `/api/v1`. Semua endpoint dilindungi `authenticateToken`. Endpoint non-login juga memakai `requireActiveMember`.
- `orgId` **selalu** berasal dari `req.membership!.orgId`; menolak atau mengabaikan `x-organization-id` yang tidak cocok dengan membership.
- Respons mutasi tunggal: `{ success: true, <entitas>, message }`. Respons list: `{ success: true, count, <koleksi> }`.
- Loan yang tidak ada atau di organisasi lain → 404. Wrong state → 409. Unauthorized → 403. Validasi body → 400.
- Status loan yang dipakai: `MENUNGGU`, `DITOLAK`, `DIBATALKAN`, `AKTIF`, `SELESAI`. `DISETUJUI` tidak dipakai.
- `isOverdue` = `status === 'AKTIF' && endDate < now`; tidak mengubah `status`.
- TDD: tulis tes, jalankan sampai RED, implementasi minimal, jalankan `npm test` + `npm run build` sampai GREEN.
- Setiap file sumber maksimal **1.000 baris**. Pisahkan controllerloan menjadi file per-domain bila perlu.
- Setiap task memperbarui `All Feature.md`, `README.md`, dan `backend/README.md`.
- Push ke remote `myfork` (fork `Syakigrodan`), PR base `DEV`, satu PR per task, berurutan sesuai branch sebelumnya.
- `npm test` memakai `backend/prisma/test.db`; jangan menyentuh `dev.db`.

## Review Focus

- **Cross-org loan id pada approve/reject/cancel/return** → harus 404, bukan 409. Diuji di Task 11/12/13 dengan loan dari organisasi lain.
- **Admin terakhir diturunkan menjadi anggota** → harus 409. Diuji di Task 15.
- **Loan `AKTIF` lewat `endDate` belum dikonfirmasi** → `isOverdue: true` tanpa perubahan `status`. Diuji di Task 10.
- **Uploader bukan admin dan organisasi tanpa admin terverifikasi** → watermark memakai `Organization.contact`, dan `watermarkText` dikembalikan. Diuji di Task 16.
- **File upload >5 MB atau MIME bukan gambar** → 400, bukan 500. Diuji di Task 16.

---

### Task 1: Fondasi bersama + BE-SKI-10 (riwayat & monitoring)

**Files:**
- Create: `backend/src/utils/http-error.ts`
- Create: `backend/src/services/loan.service.ts`
- Create: `backend/src/controllers/loan-query.controller.ts`
- Create: `backend/test/loan-list.test.ts`
- Modify: `backend/src/routes/loan.routes.ts`, `backend/test/helpers.ts`, `README.md`, `backend/README.md`, `All Feature.md`, design doc path

**Interfaces:**
- Consumes: `AuthRequest`, `authenticateToken`, `requireActiveMember`, `requireAdmin`, `prisma`.
- Produces:
  - `class HttpError extends Error { statusCode: number }`
  - `type LoanWithRelations = LoanTransaction & { item: Pick<Item,'id'|'code'|'name'|'image'>; borrower: Pick<User,'id'|'fullName'|'waNumber'>; owner: Pick<User,'id'|'fullName'|'waNumber'> | null }`
  - `findLoanForOrg(id: string, orgId: string): Promise<LoanWithRelations | null>`
  - `toLoanView(loan: LoanWithRelations): LoanView` (menambah `isOverdue`, `daysOverdue`)
  - `getMyLoans(req: AuthRequest, res: Response): Promise<void>`
  - `getAllLoans(req: AuthRequest, res: Response): Promise<void>`
  - Test helper `createLoan(orgId, itemId, borrowerId, ownerId, overrides)`.

- [ ] **Step 1: Tulis tes RED untuk fondasi dan endpoint list**

`backend/test/loan-list.test.ts` harus berisi minimal:

```ts
it('mengembalikan pinjaman peminjam beserta penanda overdue', async () => {
  const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, {
    status: 'AKTIF',
    endDate: new Date(Date.now() - 24 * 3600 * 1000)
  });
  const res = await request(app).get('/api/v1/loans/me')
    .set('Authorization', `Bearer ${borrower.token}`)
    .set('x-organization-id', orgA.id);
  expect(res.status).toBe(200);
  expect(res.body.loans[0].id).toBe(loan.id);
  expect(res.body.loans[0].isOverdue).toBe(true);
  expect(res.body.loans[0].status).toBe('AKTIF');
  expect(res.body.loans[0].item.name).toBe(item.name);
});

it('hanya mengembalikan pinjaman organisasi aktif', async () => {
  // buat orgB + loanB, lalu GET /loans/me dengan orgA
  expect(res.body.loans.some((l: any) => l.id === loanB.id)).toBe(false);
});

it('admin melihat monitoring dengan filter q dan status', async () => {
  const res = await request(app).get('/api/v1/loans?status=AKTIF&q=Alat%20uji')
    .set('Authorization', `Bearer ${admin.token}`)
    .set('x-organization-id', orgA.id);
  expect(res.status).toBe(200);
  expect(res.body.loans.every((l: any) => l.status === 'AKTIF')).toBe(true);
});

it('anggota biasa ditolak mengakses monitoring admin', async () => {
  const res = await request(app).get('/api/v1/loans')
    .set('Authorization', `Bearer ${borrower.token}`)
    .set('x-organization-id', orgA.id);
  expect(res.status).toBe(403);
});

it('status query tidak dikenal ditolak', async () => {
  const res = await request(app).get('/api/v1/loans?status=ASDF')
    .set('Authorization', `Bearer ${admin.token}`)
    .set('x-organization-id', orgA.id);
  expect(res.status).toBe(400);
});
```

- [ ] **Step 2: Jalankan tes itu dan pastikan RED**

Run: `cd backend && npm test -- test/loan-list.test.ts`
Expected: FAIL karena modul/handler belum ada.

- [ ] **Step 3: Implementasi fondasi**

`http-error.ts`: `constructor(statusCode: number, message: string)` memanggil `super(message)` dan menyimpan `statusCode`. Perbarui `error.middleware.ts` agar memakai `err.statusCode` (sudah ada, cukup pastikan).

`loan.service.ts`: define `LoanWithRelations`, `findLoanForOrg` memakai `prisma.loanTransaction.findFirst({ where: { id, orgId }, include: { item: {select...}, borrower: {select...}, owner: {select...} } })`, dan `toLoanView` menghitung `isOverdue`/`daysOverdue` dengan `MS_PER_DAY`.

- [ ] **Step 4: Implementasi controller list**

`loan-query.controller.ts`: `getMyLoans` filter `borrowerId = req.user!.id`; `getAllLoans` tambah filter `q` dan `status`; validasi status terhadap array enum; keduanya memakai `findMany` dengan include yang sama, `orderBy: { createdAt: 'desc' }`, lalu `map(toLoanView)`.

- [ ] **Step 5: Daftarkan route**

`loan.routes.ts`: tambah `router.get('/me', authenticateToken, requireActiveMember, getMyLoans)` **sebelum** `router.get('/', ..., getAllLoans)` agar `/me` tidak tertangkap sebagai `:id`.

- [ ] **Step 6: Jalankan tes**

Run: `cd backend && npm test -- test/loan-list.test.ts`
Expected: PASS.

- [ ] **Step 7: Jalankan suite penuh + build**

Run: `cd backend && npm test && npm run build`
Expected: 17+ tes lulus, build tanpa error.

- [ ] **Step 8: Dokumentasi**

Centang BE-SKI-09 & BE-SKI-10 di `All Feature.md`, tambah baris `GET /loans/me` dan `GET /loans` di dua README, sebut `isOverdue`.

- [ ] **Step 9: Commit, push, PR**

Branch `feat/be-ski-10` dari `origin/DEV` (sertakan design doc di commit ini).
Commit: `feat(backend): add loan history and monitoring (BE-SKI-10)`
Push: `git push myfork feat/be-ski-10`
PR: base `DEV`, head `Syakigrodan:feat/be-ski-10`.

---

### Task 2: BE-SKI-11 (approve)

**Files:**
- Create: `backend/src/controllers/loan-decision.controller.ts`
- Create: `backend/test/loan-approve.test.ts`
- Modify: `backend/src/routes/loan.routes.ts`, README, `All Feature.md`
- Consumes: `HttpError`, `findLoanForOrg`, `toLoanView`, `createLoan` helper.

- [ ] **Step 1: Tulis tes RED**

```ts
it('owner menyetujui pinjaman dan mengubah status barang', async () => {
  const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id);
  const res = await request(app).patch(`/api/v1/loans/${loan.id}/approve`)
    .set('Authorization', `Bearer ${owner.token}`)
    .set('x-organization-id', orgA.id);
  expect(res.status).toBe(200);
  expect(res.body.loan.status).toBe('AKTIF');
  const updated = await prisma.item.findUnique({ where: { id: item.id } });
  expect(updated!.status).toBe('DIPINJAM');
});

it('peminjam tidak bisa menyetujui pinjamannya sendiri', async () => {
  // expect 403
});

it('loan organisasi lain tidak ditemukan', async () => {
  // expect 404
});

it('loan yang sudah AKTIF ditolak dengan 409', async () => {
  // expect 409
});

it('mencatat audit approve', async () => {
  // auditLog.action === 'Menyetujui pinjaman'
});
```

- [ ] **Step 2: Jalankan tes, pastikan RED**
- [ ] **Step 3: Implementasi `approveLoan(req: AuthRequest, res: Response): Promise<void>`**

Cek `findLoanForOrg`; 404 jika null. Izin: `req.membership!.role === 'ADMIN' || loan.ownerId === req.user!.id`, else 403. State: `MENUNGGU` dan `item.status === 'TERSEDIA'`, else `HttpError(409, ...)`. Jalankan `prisma.$transaction(async tx => { ... })`: `tx.loanTransaction.updateMany({ where: { id, orgId, status: 'MENUNGGU' }, data: { status: 'AKTIF' } })`, `tx.item.updateMany({ where: { id: loan.itemId, orgId, status: 'TERSEDIA' }, data: { status: 'DIPINJAM' } })`, `tx.auditLog.create(...)`. Jika `count === 0`, lempar `HttpError(409, ...)`. Setelah transaksi, ambil ulang dengan `findLoanForOrg` lalu kirim `{ success, loan: toLoanView(...), message }`.

- [ ] **Step 4: Daftarkan `PATCH /:id/approve` di `loan.routes.ts`**
- [ ] **Step 5: `npm test` + `npm run build` GREEN**
- [ ] **Step 6: Update dokumen, commit, push, PR** — branch `feat/be-ski-11` dari `feat/be-ski-10`.

---

### Task 3: BE-SKI-12 (reject & cancel)

**Files:**
- Create: `backend/test/loan-decision.test.ts`
- Modify: `backend/src/controllers/loan-decision.controller.ts`, `loan.routes.ts`, docs

**Interfaces:**
- Produces: `rejectLoan(req, res)`, `cancelLoan(req, res)`.

- [ ] **Step 1: Tulis tes RED**

```ts
it('pemilik menolak dengan alasan', async () => {
  const res = await request(app).patch(`/api/v1/loans/${loan.id}/reject`)
    .set('Authorization', `Bearer ${owner.token}`)
    .set('x-organization-id', orgA.id)
    .send({ rejectionReason: 'Jadwal bentrok dengan pemakaian lain.' });
  expect(res.status).toBe(200);
  expect(res.body.loan.status).toBe('DITOLAK');
  expect(res.body.loan.rejectionReason).toContain('Jadwal bentrok');
});

it('alasan penolakan kurang dari 5 karakter ditolak', async () => {
  // expect 400
});

it('peminjam membatalkan pengajuan sendiri', async () => {
  // expect 200, status DIBATALKAN
});

it('anggota lain tidak bisa membatalkan', async () => {
  // expect 403
});

it('loan AKTIF tidak bisa ditolak atau dibatalkan', async () => {
  // expect 409 untuk keduanya
});
```

- [ ] **Step 2: RED check**
- [ ] **Step 3: Implementasi `rejectLoan` dan `cancelLoan`** — `findLoanForOrg` + 404, izin admin/owner untuk reject dan borrower untuk cancel, guard `MENUNGGU`, update status + `rejectionReason`, audit `Menolak pinjaman` / `Membatalkan pinjaman`, respons `toLoanView`.
- [ ] **Step 4: Daftarkan `PATCH /:id/reject` dan `PATCH /:id/cancel`**
- [ ] **Step 5: GREEN check, docs, commit, push, PR** — branch `feat/be-ski-12`.

---

### Task 4: BE-SKI-13 (return)

**Files:**
- Create: `backend/src/controllers/loan-return.controller.ts`
- Create: `backend/test/loan-return.test.ts`
- Modify: `loan.routes.ts`, docs

- [ ] **Step 1: Tulis tes RED**

```ts
it('owner mengonfirmasi pengembalian', async () => {
  const loan = await createLoan(orgA.id, item.id, borrower.user.id, owner.user.id, { status: 'AKTIF' });
  await prisma.item.update({ where: { id: item.id }, data: { status: 'DIPINJAM' } });
  const res = await request(app).patch(`/api/v1/loans/${loan.id}/return`)
    .set('Authorization', `Bearer ${owner.token}`)
    .set('x-organization-id', orgA.id);
  expect(res.status).toBe(200);
  expect(res.body.loan.status).toBe('SELESAI');
  expect(res.body.loan.returnConfirmedAt).toBeTruthy();
  expect((await prisma.item.findUnique({ where: { id: item.id } }))!.status).toBe('TERSEDIA');
});

it('peminjam tidak bisa mengonfirmasi pengembalian', async () => { /* 403 */ });
it('loan organisasi lain tidak ditemukan', async () => { /* 404 */ });
it('loan MENUNGGU tidak bisa dikonfirmasi', async () => { /* 409 */ });
it('mencatat audit pengembalian', async () => { /* action 'Mengonfirmasi pengembalian' */ });
```

- [ ] **Step 2: RED check**
- [ ] **Step 3: Implementasi `returnLoan(req, res)`** — transaksi `loanTransaction.updateMany` status `AKTIF → SELESAI` + `returnConfirmedAt`, `item.updateMany` `DIPINJAM → TERSEDIA`, audit; rollback dengan `HttpError(409)` bila count nol.
- [ ] **Step 4: Daftarkan route, GREEN check, docs, commit, push, PR** — branch `feat/be-ski-13`.

---

### Task 5: BE-SKI-14 (pusat verifikasi)

**Files:**
- Create: `backend/src/controllers/membership.controller.ts`
- Create: `backend/src/routes/membership.routes.ts`
- Create: `backend/test/membership-verification.test.ts`
- Modify: `backend/src/app.ts`, docs

**Interfaces:**
- Produces: `listPendingMembers`, `verifyMember`, `rejectMember`; semua route di `/api/v1/memberships`.

- [ ] **Step 1: Tulis tes RED**

```ts
it('admin melihat calon anggota beserta dokumen', async () => {
  const res = await request(app).get('/api/v1/memberships/pending')
    .set('Authorization', `Bearer ${admin.token}`)
    .set('x-organization-id', orgA.id);
  expect(res.status).toBe(200);
  expect(res.body.memberships[0].documentUrl).toBeTruthy();
  expect(res.body.memberships[0].user.fullName).toBeTruthy();
});

it('admin memverifikasi anggota', async () => {
  const res = await request(app).patch('/api/v1/memberships/verify')
    .set('Authorization', `Bearer ${admin.token}`)
    .set('x-organization-id', orgA.id)
    .send({ membershipId: pending.id });
  expect(res.status).toBe(200);
  expect(res.body.membership.status).toBe('TERVERIFIKASI');
});

it('admin menolak anggota dengan alasan tertulis', async () => {
  // expect 200, DITOLAK, rejectionReason tersimpan
});

it('target dari organisasi lain tidak ditemukan', async () => { /* 404 */ });
it('angggota biasa ditolak', async () => { /* 403 */ });
it('verifikasi ulang anggota sudah terverifikasi ditolak', async () => { /* 409 */ });
```

- [ ] **Step 2: RED check**
- [ ] **Step 3: Implementasi controller** — helper internal `findMembershipForOrg(id, orgId)`; validasi `membershipId`, `rejectionReason >= 5`; update status, hapus/isikan `rejectionReason`; audit `Memverifikasi anggota` / `Menolak anggota`.
- [ ] **Step 4: Daftarkan router** di `app.ts`: `app.use('/api/v1/memberships', membershipRoutes)`.
- [ ] **Step 5: GREEN check, docs, commit, push, PR** — branch `feat/be-ski-14`.

---

### Task 6: BE-SKI-15 (manajemen anggota)

**Files:**
- Create: `backend/test/membership-management.test.ts`
- Modify: `backend/src/controllers/membership.controller.ts`, `membership.routes.ts`, docs

**Interfaces:**
- Produces: `updateMember(req, res)` untuk `PUT /memberships/:id`.

- [ ] **Step 1: Tulis tes RED**

```ts
it('admin mengubah role dan jabatan anggota', async () => {
  const res = await request(app).put(`/api/v1/memberships/${target.id}`)
    .set('Authorization', `Bearer ${admin.token}`)
    .set('x-organization-id', orgA.id)
    .send({ role: 'ADMIN', position: 'Bendahara' });
  expect(res.status).toBe(200);
  expect(res.body.membership.role).toBe('ADMIN');
  expect(res.body.membership.position).toBe('Bendahara');
});

it('menurunkan admin terakhir ditolak', async () => {
  // org hanya punya 1 ADMIN terverifikasi
  // PUT role ANGGOTA -> expect 409
});

it('role tidak valid ditolak', async () => { /* 400 */ });
it('jabatan lebih dari 50 karakter ditolak', async () => { /* 400 */ });
it('target organisasi lain tidak ditemukan', async () => { /* 404 */ });
it('mencatat audit perubahan peran', async () => { /* action 'Mengubah peran anggota' */ });
```

- [ ] **Step 2: RED check**
- [ ] **Step 3: Implementasi `updateMember`** — cari target di `orgId`; validasi `role` dan `position`; hitung `prisma.membership.count({ where: { orgId, role: 'ADMIN', status: 'TERVERIFIKASI' } })`; jika target saat ini admin terverifikasi, role baru `ANGGOTA`, dan count `<= 1` → `HttpError(409, ...)`; update + audit.
- [ ] **Step 4: Daftarkan route `PUT /:id`**
- [ ] **Step 5: GREEN check, docs, commit, push, PR** — branch `feat/be-ski-15`.

---

### Task 7: BE-SKI-16 (watermark forensik)

**Files:**
- Create: `backend/src/middlewares/upload.middleware.ts`
- Create: `backend/src/controllers/upload.controller.ts`
- Create: `backend/src/routes/upload.routes.ts`
- Create: `backend/test/upload.test.ts`
- Create: `backend/src/types/express.d.ts` (deklarasi `processedImage`)
- Create: `backend/uploads/.gitkeep`
- Modify: `backend/package.json`, `backend/package-lock.json`, `backend/.gitignore`, `backend/src/app.ts`, docs

**Interfaces:**
- Produces:
  - `uploadImage: RequestHandler`
  - `watermarkImage: RequestHandler` (men-set `req.processedImage`)
  - `uploadImageHandler(req: AuthRequest, res: Response): Promise<void>`
  - `POST /api/v1/uploads` → `{ success, image: { path, url, name, watermarkText }, message }`

- [ ] **Step 1: Pasang sharp dan tulis tes RED**

Run: `cd backend && npm install sharp`

```ts
it('menghasilkan gambar ber-watermark dan mengembalikan watermarkText', async () => {
  const buffer = await sharp({ create: { width: 400, height: 300, channels: 3, background: '#fff' } }).png().toBuffer();
  const res = await request(app).post('/api/v1/uploads')
    .set('Authorization', `Bearer ${admin.token}`)
    .set('x-organization-id', orgA.id)
    .attach('image', buffer, 'contoh.png');
  expect(res.status).toBe(201);
  expect(res.body.image.url).toMatch(/^\/uploads\//);
  expect(res.body.image.watermarkText).toContain(orgA.name);
  expect(res.body.image.watermarkText).toContain(admin.user.waNumber);
  expect(fs.existsSync(path.resolve('uploads', orgA.id, path.basename(res.body.image.url)))).toBe(true);
});

it('MIME bukan gambar ditolak 400', async () => { /* attach file .txt */ });
it('file lebih dari 5 MB ditolak 400', async () => { /* buffer 6 MB */ });
it('tanpa file ditolak 400', async () => { /* expect 400 */ });

it('uploader non-admin memakai admin terverifikasi pertama', async () => {
  // user ANGGOTA upload, ada admin lain
  // watermarkText mengandung nama admin tersebut
});

it('tanpa admin terverifikasi memakai Organization.contact', async () => {
  // org tanpa ADMIN, Organization.contact di-set
  // watermarkText mengandung contact
});
```

- [ ] **Step 2: Jalankan tes, pastikan RED**
- [ ] **Step 3: Implementasi `upload.middleware.ts`**

`uploadImage`: `multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter }).single('image')`; fileFilter memanggil `cb(new HttpError(400, ...))` untuk MIME selain `image/jpeg|png|webp`.

Tambah deklarasi `Express.Request.processedImage?: { path: string; url: string; name: string; watermarkText: string }` di `src/types/express.d.ts`.

`watermarkImage`: tentukan actor: uploader jika `role === 'ADMIN'`, else `prisma.membership.findFirst({ where: { orgId, role: 'ADMIN', status: 'TERVERIFIKASI' }, orderBy: { joinedAt: 'asc' }, include: { user: true } })`, else fallback `Organization.contact`. Bangun teks: `nama org • nama actor • WA • timestamp WIB` (format `Asia/Jakarta`). Escape XML. Buat SVG overlay diagonal berulang dengan `fill="rgba(0,0,0,0.45)"` dan stroke terang agar terbaca pada gambar gelap (koreksi hasil review: warna putih tidak terlihat pada dokumen putih), komposit dengan `sharp(req.file.buffer).composite(...)`, `.jpeg({ quality: 85 }).toBuffer()`. Simpan ke `path.resolve(process.cwd(), 'uploads', orgId, `${randomUUID()}.jpg`)`, `mkdir recursive`. Set `req.processedImage`.

- [ ] **Step 4: Implementasi controller + route + static**

`upload.controller.ts` mengembalikan `req.processedImage`. `upload.routes.ts`: `router.post('/', authenticateToken, requireActiveMember, uploadImage, watermarkImage, uploadImageHandler)`. `app.ts`: `app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')))` dan daftarkan router. Pastikan `errorHandler` menangani `HttpError` dari multer.

- [ ] **Step 5: Abaikan hasil upload dari Git**

`backend/.gitignore`: tambah `uploads/*` dan `!uploads/.gitkeep`.

- [ ] **Step 6: GREEN check** — `cd backend && npm test && npm run build`.
- [ ] **Step 7: Docs** — sebut `sharp`, endpoint upload, direktori `uploads/`, batas 5 MB, dan MIME yang didukung.
- [ ] **Step 8: Commit, push, PR** — branch `feat/be-ski-16`, title `feat(backend): add forensic watermark upload (BE-SKI-16)`.

---

## Self-review checklist (diisi saat eksekusi)

- [ ] Setiap requirement di spec punya task: 10, 11, 12, 13, 14, 15, 16 — lengkap.
- [ ] Setiap Review Focus punya tes: cross-org (11/12/13), admin terakhir (6), overdue (1), actor fallback (7), upload invalid (7).
- [ ] Nama `HttpError`, `toLoanView`, `findLoanForOrg`, `LoanWithRelations`, `watermarkText` konsisten di semua task.
- [ ] Tidak ada file sumber >1.000 baris; jalankan pengecekan sebelum PR terakhir.
- [ ] Urutan branch/PR sesuai spec dan tiap PR mergeable sebelum lanjut.
