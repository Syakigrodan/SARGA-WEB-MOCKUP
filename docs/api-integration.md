# Panduan Integrasi API SARGA (Frontend)

Dokumen ini adalah acuan bagi frontend saat memanggil backend SARGA. Rincian per modul juga ada di [`backend/README.md`](../backend/README.md); daftar tanggung jawab tiap fitur ada di [`All Feature.md`](../All%20Feature.md).

## 1. Dasar

| Item | Nilai |
|---|---|
| Base URL dev | `http://localhost:5000/api/v1` |
| Health check | `GET http://localhost:5000/api/health` |
| Format body | `application/json` (kecuali upload gambar: `multipart/form-data`) |
| CORS | Origin `http://localhost:4200` dan `127.0.0.1:4200` diizinkan pada mode dev |
| Format tanggal | ISO 8601 UTC dari API (contoh `2026-11-23T10:00:00.000Z`); tampilkan ke WIB di UI |

Contoh environment Angular:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/v1'
};
```

## 2. Autentikasi dan konteks organisasi

Hanya `POST /auth/register` dan `POST /auth/login` yang tidak membutuhkan token.

- Simpan `token` dari respons login/register.
- `jwtInterceptor` di frontend sudah menyematkan `Authorization: Bearer <token>`.
- **Selain itu, kirim header `x-organization-id: <orgId>`** untuk hampir semua endpoint. `orgId` diambil dari `user.memberships[].organization.id` pada respons `/auth/login` atau `/auth/me`, atau dari switcher organisasi aktif.
- Token tidak ada → `401`. Token tidak valid/kedaluwarsa → `403`. Header organisasi tidak ada, pengguna bukan anggota organisasi itu, atau keanggotaan belum `TERVERIFIKASI` → `403`.

Contoh interceptor untuk header organisasi (dipasang bersama `jwtInterceptor`):

```ts
@Injectable()
export class OrgHeaderInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler) {
    const orgId = this.auth.activeOrgId();
    if (!orgId || !req.url.startsWith(environment.apiUrl)) return next.handle(req);
    return next.handle(req.clone({ setHeaders: { 'x-organization-id': orgId } }));
  }
}
```

Status keanggotaan yang perlu dihandle UI: `MENUNGGU_VERIFIKASI`, `TERVERIFIKASI`, `DITOLAK`. Endpoint selain auth mensyaratkan `TERVERIFIKASI`.

## 3. Format respons dan kode status

Semua respons memakai envelope `success`:

```json
{ "success": true, "message": "...", "<objek>": {} }
{ "success": false, "message": "Penjelasan kegagalan untuk ditampilkan ke pengguna." }
```

| Kode | Arti untuk frontend |
|---|---|
| `200` | GET/PATCH/PUT/DELETE berhasil |
| `201` | POST berhasil membuat data |
| `400` | Validasi input gagal — tampilkan `message` |
| `401` | Token belum ada — arahkan ke login |
| `403` | Token/akses ditolak, bukan admin, atau konteks organisasi salah |
| `404` | Data tidak ditemukan di **organisasi aktif** |
| `409` | Konflik state (misalnya pinjaman sudah diproses, admin terakhir) |
| `500` | Kesalahan server — `message` sengaja generik |

Nilai enum yang dipakai API:

- `role`: `ADMIN` (pengurus) | `ANGGOTA`
- `status` keanggotaan: `MENUNGGU_VERIFIKASI` | `TERVERIFIKASI` | `DITOLAK`
- `status` pinjaman: `MENUNGGU` | `DISETUJUI` | `DITOLAK` | `AKTIF` | `SELESAI` | `DIBATALKAN`
- `status` barang: `TERSEDIA` | `DIPINJAM` | `PERAWATAN` | `DIARSIPKAN`

## 4. Daftar endpoint

Legenda akses: **Publik** = tanpa token; **Token** = token + `x-organization-id`; **Anggota** = token + anggota `TERVERIFIKASI`; **Admin** = anggota + role `ADMIN`.

### Auth

| Method | Path | Akses | Body / Query | Respons sukses |
|---|---|---|---|---|
| `POST` | `/auth/register` | Publik | `waNumber`, `password`, `fullName`, `address`, `inviteCode`, dokumen opsional | `201 { success, token, user, message }` |
| `POST` | `/auth/login` | Publik | `waNumber`, `password` | `200 { success, token, user, message }` |
| `GET` | `/auth/me` | Token | — | `200 { success, user }` |

`user.memberships[]` berisi `orgId`, `role`, `status`, `position`, dan data `organization`. `inviteCode` dicocokkan case-insensitive.

### Barang

| Method | Path | Akses | Body / Query | Respons sukses |
|---|---|---|---|---|
| `GET` | `/items` | Anggota | `?q=` (opsional, cari nama/deskripsi/kode) | `200 { success, count, items }` |
| `GET` | `/items/:id` | Anggota | — | `200 { success, item }` (termasuk 5 loan terakhir) |
| `POST` | `/items` | Anggota | `name`, `maxDays`, `location`, `description`, `instructions`, `isSafeAndReady: true`, `contents?`, `image?` | `201 { success, item, message }` |

`GET /items` tidak mengembalikan barang `DIARSIPKAN`. `maxDays` wajib > 0 dan `isSafeAndReady` harus `true`.

### Peminjaman

| Method | Path | Akses | Body / Query | Respons sukses |
|---|---|---|---|---|
| `POST` | `/loans` | Anggota | `itemId`, `expectedReturnDate` (ISO), `purpose` | `201 { success, loan, message }` |
| `GET` | `/loans/me` | Anggota | `?status=` | `200 { success, count, loans }` |
| `GET` | `/loans` | Admin | `?status=`, `?q=`, `?overdue=true\|false` | `200 { success, count, loans }` |
| `PATCH` | `/loans/:id/approve` | Pemilik barang / Admin | — | `200 { success, loan, message }` |
| `PATCH` | `/loans/:id/reject` | Pemilik barang / Admin | `rejectionReason` (min. 5 karakter) | `200 { success, loan, message }` |
| `PATCH` | `/loans/:id/cancel` | Peminjam | — | `200 { success, loan, message }` |
| `PATCH` | `/loans/:id/return` | Pemilik barang / Admin | — | `200 { success, loan, message }` |

`approve` hanya untuk pinjaman `MENUNGGU` dengan barang `TERSEDIA`; `return` hanya untuk pinjaman `AKTIF`. Setiap loan menyertakan `isOverdue` dan `daysOverdue` (penanda saja, tidak mengubah `status`).

### Anggota

| Method | Path | Akses | Body / Query | Respons sukses |
|---|---|---|---|---|
| `GET` | `/memberships/pending` | Admin | — | `200 { success, count, memberships }` |
| `PATCH` | `/memberships/verify` | Admin | `membershipId` | `200 { success, membership, message }` |
| `PATCH` | `/memberships/reject` | Admin | `membershipId`, `rejectionReason` (min. 5 karakter) | `200 { success, membership, message }` |
| `PUT` | `/memberships/:id` | Admin | `role: "ADMIN"\|"ANGGOTA"`, `position` (1–50 karakter) | `200 { success, membership, message }` |

Menurunkan satu-satunya admin terverifikasi ditolak `409`.

### Struktur organisasi

| Method | Path | Akses | Body / Query | Respons sukses |
|---|---|---|---|---|
| `GET` | `/organizations/:id/structure` | Anggota | — | `200 { success, organization, leaders, members }` |

Contoh pemanggilan:

```ts
getStructure(orgId: string) {
  return this.http.get<StructureResponse>(
    `${environment.apiUrl}/organizations/${orgId}/structure`,
    { headers: { 'x-organization-id': orgId } }
  );
}
```

```json
{
  "success": true,
  "organization": { "id": "...", "name": "...", "type": "...", "address": "...", "contact": "..." },
  "leaders": [{ "id": "...", "userId": "...", "fullName": "...", "waNumber": "...", "position": "Ketua", "division": "Divisi Timur", "role": "ADMIN", "joinedAt": "..." }],
  "members": [{ "id": "...", "userId": "...", "fullName": "...", "waNumber": "...", "position": "Anggota", "division": null, "role": "ANGGOTA", "joinedAt": "..." }]
}
```

- `:id` **harus sama** dengan `x-organization-id`; beda → `403`.
- `leaders` = role `ADMIN`, `members` = role `ANGGOTA`; hanya anggota `TERVERIFIKASI`.
- `division` diekstrak dari `position` (mis. `Koordinator Divisi B` → `Divisi B`), bukan dari alamat anggota; `null` bila tidak ada.
- Urutan: Ketua → Sekretaris → Bendahara → lainnya, lalu `joinedAt`, lalu `id`.
- `waNumber` bisa dipakai untuk tautan `https://wa.me/<angka>` (normalkan `08…` ke `628…`).
- Tidak ada `passwordHash`/dokumen di respons.

### Pengumuman

| Method | Path | Akses | Body / Query | Respons sukses |
|---|---|---|---|---|
| `GET` | `/announcements` | Anggota | — | `200 { success, count, announcements }` |
| `POST` | `/announcements` | Admin | `title` (3–120), `content` (5–2000) | `201 { success, announcement, message }` |
| `DELETE` | `/announcements/:id` | Admin | — | `200 { success, message }` |

```json
{
  "success": true,
  "count": 2,
  "announcements": [
    { "id": "...", "title": "Jadwal Rapat", "content": "...", "createdAt": "2026-11-23T10:00:00.000Z", "author": { "id": "...", "fullName": "..." } }
  ]
}
```

- Daftar sudah terurut terbaru lebih dulu; frontend tidak perlu sort ulang.
- Field `orgId`/`authorId` yang dikirim dari body **diabaikan** — server mengambil dari header dan token.
- Hapus pengumuman organisasi lain → `404` (tidak dibocorkan keberadaannya).

### Unggah gambar

| Method | Path | Akses | Body / Query | Respons sukses |
|---|---|---|---|---|
| `POST` | `/uploads` | Anggota | `multipart/form-data`, field `image` (jpeg/png/webp, maks. 5 MB) | `201 { success, image }` |

`image.url` berbentuk `/uploads/<orgId>/<uuid>.jpg` dan bisa langsung dipakai sebagai `src` (server menyajikan folder `/uploads`). Gambar diberi watermark forensik otomatis.

## 5. Catatan penting untuk integrasi

1. **Jangan kirim `orgId` di body.** Semua endpoint mengambil organisasi dari header `x-organization-id`. Kirim `orgId` di body tidak akan mengubah hasil.
2. **Switcher organisasi harus memperbarui header.** Simpan `orgId` aktif di state/auth service dan pakai di interceptor; kalau user pindah organisasi, semua request berikutnya otomatis memakai org baru.
3. **Role API vs label UI.** API memakai `ADMIN`/`ANGGOTA`; tampilan mockup memakai "Pengurus"/"Anggota". Lakukan pemetaan di frontend, jangan ubah kontrak API.
4. **Halaman `#/struktur` dan `#/admin-bagan`** bisa memakai satu endpoint `GET /organizations/:id/structure`. Untuk mengubah jabatan/role, pakai `PUT /memberships/:id`.
5. **Belum tersedia:** OTP WhatsApp, unggah dokumen pendaftaran lewat API, filter kategori barang, dan endpoint platform admin (`/api/v1/platform/organizations`). Tampilkan pesan "segera hadir", jangan memanggil endpoint yang belum ada.
6. Semua `message` dari server aman ditampilkan langsung ke user; untuk `500` tampilkan pesan umum.

## 6. Alur umum yang disarankan

```
login → simpan token + pilih orgId dari user.memberships
     → GET /auth/me untuk menyegarkan data profil/membership
     → tentukan UI: admin jika role === 'ADMIN' pada org aktif
     → panggil endpoint dengan Authorization + x-organization-id
     → 401 → logout; 403 → tampilkan "akses ditolak/verifikasi belum selesai"
```

Contoh seluruh permintaan memakai `fetch`:

```ts
const res = await fetch(`${API}/announcements`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'x-organization-id': orgId,
    'Content-Type': 'application/json'
  }
});
const body = await res.json();
if (!res.ok) showError(body.message);
```
