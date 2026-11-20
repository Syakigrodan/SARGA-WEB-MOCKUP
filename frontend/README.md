# SARGA Frontend (Angular SPA)

Frontend aplikasi **SARGA** (Sistem Inventaris dan Peminjaman Komunitas), dibangun berbasis Single Page Application (SPA) menggunakan **Angular 19** dan **TypeScript** sesuai spesifikasi pada Dokumen SRS v1.2 (Section 2.3 & 5.2).

---

## 🛠️ Tech Stack & Konvensi

- **Framework:** Angular 19 (Standalone Components, signals & RxJS)
- **Language:** TypeScript 5.5+
- **Styling:** CSS3 dengan Design Tokens Civic Inventory Registry (Epilogue Typography, Emerald Accent `#0f766e`, Warm Paper `#fffefb`)
- **State & HTTP:** RxJS, Angular HttpClient, JWT Interceptor
- **Responsive:** Mobile-first (min-width: 360px)

---

## 📁 Struktur Direktori

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                  # Core singleton services, models, guards, interceptors
│   │   │   ├── guards/            # authGuard, adminGuard
│   │   │   ├── interceptors/      # jwtInterceptor
│   │   │   ├── models/            # TypeScript interfaces & types (SRS Domain Model)
│   │   │   └── services/          # AuthService, ItemService, LoanService
│   │   ├── features/              # Feature modules (Lazy-loadable)
│   │   │   ├── admin/             # Panel pengurus (kelola anggota, verifikasi, audit)
│   │   │   ├── auth/              # Login dan pendaftaran via kode undangan; OTP/upload menunggu API
│   │   │   ├── catalog/           # Katalog dan detail alat; filter kategori menunggu dukungan API
│   │   │   ├── items/             # Daftar barang baru; foto/kategori/edit menunggu dukungan API
│   │   │   └── loans/             # Riwayat pinjaman saya & transaksi aktif
│   │   ├── shared/                # Komponen bersama (Navbar, Alert, Confirmation Dialog, Toast, Status Badge)
│   │   ├── app.component.ts       # Shell root component
│   │   ├── app.config.ts          # Application providers (HttpClient, Router)
│   │   └── app.routes.ts          # Routing configuration
│   ├── assets/
│   │   ├── fonts/                 # Epilogue TTF fonts (400, 500, 600, 700)
│   │   └── img/                   # Asset gambar barang & mockup SVG
│   ├── environments/              # Environment config (dev & prod API URL)
│   ├── index.html                 # Entry point HTML
│   ├── main.ts                    # Bootstrap entry point
│   └── styles.css                 # Global CSS variables & design tokens
├── angular.json                   # Angular CLI configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript compiler options
```

---

`ToastService` dan `ToastOutletComponent` menyediakan notifikasi aplikasi. `AlertComponent` digunakan
untuk umpan balik langsung pada halaman, sedangkan `ConfirmationDialogComponent` adalah dialog native
yang dapat dipakai ulang untuk aksi yang memerlukan konfirmasi.

## 🚀 Cara Menjalankan

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Jalankan Development Server
```bash
npm start
# atau
npx ng serve
```
Akses di browser pada: [http://localhost:4200](http://localhost:4200)

### 3. Build untuk Production
```bash
npm run build
```
Hasil build akan berada di direktori `dist/sarga-frontend`.

---

## 🔗 Endpoint API Backend Terhubung
- Base URL dev: `http://localhost:5000/api/v1`
- Autentikasi otomatis menyematkan header `Authorization: Bearer <token>` melalui `jwtInterceptor`.
- Pendaftaran dasar memakai `POST /auth/register` dengan kode undangan; OTP WhatsApp dan unggah dokumen belum tersedia.
- Katalog memakai `GET /items` dan `GET /items/:id`; pendaftaran barang memakai `POST /items`.
- Filter kategori, unggah foto, edit/hapus barang, serta endpoint pinjaman dan administrasi belum tersedia.
