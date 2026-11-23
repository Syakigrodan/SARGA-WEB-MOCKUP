# SARGA - Sistem Inventaris & Peminjaman Komunitas

Repositori ini memuat seluruh aset rancangan, spesifikasi kebutuhan, prototipe antarmuka, inisialisasi arsitektur kode sumber untuk aplikasi **SARGA**, serta konfigurasi standar pengembangan tim (*AI Agent Skills*).

---

## 📚 Dokumen Spesifikasi & Fitur
- **Laporan Lengkap Fitur & Keamanan:** [All Feature.md](./All%20Feature.md) *(Inventarisasi seluruh fitur antarmuka mockup + fitur sensor & watermark identitas)*.
- **Dokumen SRS Versi Markdown:** [SRS_Sarga_v1.2.md](./SRS_Sarga_v1.2.md) *(Dikonversi dari `SRS_Sarga_v1.2.pdf` untuk kemudahan analisis dan implementasi teknis)*.
- **Dokumen SRS PDF Asli:** `SRS_Sarga_v1.2.pdf`.

---

## 🏗️ Struktur Proyek (Monorepo)

```
WEB MOCKUP/
├── .agents/skills/        # AI Coding Agent Skills bersama untuk tim (Anti-slop, UI, Mobile, a11y)
├── .gemini/plugins/       # Plugin efisiensi konteks (context-mode)
├── backend/               # Node.js + Express + TypeScript + Prisma ORM (SQLite)
├── frontend/              # Angular 19 SPA + TypeScript (Standalone Components)
├── mockup/                # Prototipe interaktif statis (HTML/CSS/JS - Live di Vercel)
├── All Feature.md         # Laporan inventaris seluruh fitur antarmuka & proteksi data
├── SRS_Sarga_v1.2.md      # Spesifikasi Software Requirement Specification lengkap
├── .gitignore             # Konfigurasi filter git monorepo
└── README.md              # Dokumentasi utama proyek
```

---

## 💻 Tech Stack (Sesuai SRS v1.2 Bab 2 & 5)

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Frontend** | **Angular 19**, TypeScript, CSS3 | Single Page Application, mobile-first responsive (min 360px), palet warna emerald `#0f766e` / civic registry |
| **Backend** | **Node.js**, **Express**, TypeScript | RESTful API, arsitektur modular (routes, controllers, services, middlewares) |
| **Database & ORM** | **SQLite**, **Prisma ORM** | Skema database relasional: `Organization`, `User`, `Membership`, `Item`, `LoanTransaction`, `AuditLog`, `Announcement` |
| **Keamanan & Validasi** | **JWT**, **bcryptjs**, **Zod** | Enkripsi password, validasi skema request, proteksi role & token |
| **Prototipe UI** | HTML5, Vanilla JS, CSS3 | Tersedia di direktori `mockup/` |

---

## 🧠 Standar Pengembangan & AI Agent Skills (`.agents/skills/`)

Untuk menjaga kualitas kode, konsistensi desain, dan mencegah *AI slop* (kode/komentar generik hasil generate AI yang tidak perlu), proyek ini menyertakan direktori standar **AI Skills** di dalam repositori.

### Mengapa Skills ini Perlu Digunakan Bersama oleh Tim?
1. **Standar Desain & Warna Seragam:** Mencegah AI menghasilkan warna sembarangan di luar palet resmi SARGA (Emerald `#0f766e`, Paper `#fffefb`, Slate Muted `#475569`).
2. **Kualitas & Kebersihan Kode:** Menghindari komentar basa-basi AI dan struktur kode yang redundan.
3. **Mobile-First & Aksesibilitas:** Memastikan seluruh halaman yang dikembangkan tim responsif (min 360px) dan memenuhi standar kontras WCAG AA.
4. **Otomatis untuk Semua Anggota Tim:** Karena disimpan di folder `.agents/skills/`, setiap anggota tim yang menggunakan AI coding assistant (seperti Antigravity) akan langsung membaca dan menerapkan panduan yang sama tanpa perlu konfigurasi ulang.

### Daftar Skills yang Aktif:
- **`antislop`**: Filter acuan utama untuk menghentikan output kode dan styling AI yang generik/klise.
- **`antislop-code`**: Aturan kebersihan komentar kode (hanya simpan komentar penting/logika bisnis, hapus komentar penjelasan sintaks dasar).
- **`antislop-human`**: Standar aksesibilitas manusia (kontras warna teks/latar, interaksi keyboard, focus ring, tap target min 44x44px).
- **`antislop-layoutmobile`**: Standar layout responsif, pencegahan horizontal scroll/overflow, dan adaptasi grid mobile ke desktop.
- **`antislop-ui`**: Standar visual komponen, hierarki tipografi Epilogue, border radius, serta ritme spasi.
- **`context-mode` (`.gemini/plugins/`)**: Melindungi context window agent agar tidak boros token saat membaca log atau berkas besar.

---

## ⚡ Panduan Menjalankan Sistem

### 1. Menjalankan Backend (`backend/`)
```bash
cd backend
npm install

# Inisialisasi Database SQLite & Prisma Client
npx prisma generate
npx prisma db push

# Jalankan Server Development
npm run dev
```
Server backend akan aktif di: `http://localhost:5000` (API Base: `http://localhost:5000/api/v1`).

---

### 2. Menjalankan Frontend (`frontend/`)
```bash
cd frontend
npm install

# Jalankan Server Frontend Angular
npm start
```
Aplikasi web Angular dapat dibuka di browser melalui: `http://localhost:4200`.

---

### 3. Prototipe Antarmuka Mockup (`mockup/`)
Direktori `mockup/` tetap terjaga utuh dan independen untuk kebutuhan presentasi, pitch deck, atau deployment Vercel.
```bash
cd mockup
# Buka index.html di browser atau gunakan Live Server
```

---

### 4. Menjalankan Tes Backend
```bash
cd backend
npm install
npm test
```
Tes memakai database terpisah (`backend/prisma/test.db`) sehingga tidak mengubah data development. Script `pretest` menyiapkan skema secara otomatis.

---

## 🔌 Ringkasan Endpoint Backend

Base URL: `http://localhost:5000/api/v1`. Endpoint yang membutuhkan konteks organisasi mengirim header `x-organization-id` bersama `Authorization: Bearer <token>`.

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/auth/register` | Pendaftaran anggota dengan kode undangan |
| `POST` | `/auth/login` | Login, mengembalikan token dan daftar membership |
| `GET` | `/auth/me` | Data pengguna beserta membership aktif |
| `GET` | `/items` | Katalog barang organisasi aktif |
| `GET` | `/items/:id` | Detail barang, hanya untuk organisasi aktif |
| `POST` | `/items` | Menambah barang ke organisasi aktif |
| `POST` | `/loans` | Pengajuan pinjaman baru, status awal `MENUNGGU` |
| `GET` | `/loans/me` | Riwayat pinjaman peminjam, bisa difilter `?status=` |
| `GET` | `/loans` | Monitoring admin: filter `?status=`, `?q=`, dan `?overdue=` |
| `PATCH` | `/loans/:id/approve` | Setujui pinjaman (pemilik barang atau admin) |

Contoh body `POST /loans`:

```json
{
  "itemId": "<uuid barang>",
  "expectedReturnDate": "2026-11-25T10:00:00.000Z",
  "purpose": "Keperluan presentasi rapat tim mingguan"
}
```

Respons sukses memakai bentuk `{ success, loan, message }`. Validasi yang diterapkan: barang harus tersedia dan berada di organisasi yang sama, bukan milik peminjam, tanggal tidak boleh di masa lalu, durasi tidak melebihi `maxDays`, dan tidak ada pengajuan `MENUNGGU` ganda untuk barang yang sama.

> **Catatan frontend:** `LoanService` saat ini masih menyiapkan tipe `{ success, data }`. Perlu diselaraskan dengan bentuk respons di atas oleh tim frontend.

---

## ✅ Konvensi Pengembangan Tim

Berlaku untuk setiap fitur baru, baik perubahan backend, frontend, maupun mockup:

1. **Modular.** Pisahkan routing, handler, dan logika bisnis. Tambahkan `services/` hanya ketika logika mulai dipakai ulang, bukan untuk memindahkan satu fungsi.
2. **Batas ukuran file.** Satu file sumber tidak boleh lebih dari **1.000 baris**. Jika mendekati batas, pecah menjadi beberapa file sebelum menambah kode lagi. File generate seperti `package-lock.json` dan aset biner tidak termasuk aturan ini.
3. **Perbarui dokumentasi.** Setiap fitur baru wajib diiringi pembaruan `README.md` yang relevan, baik dokumentasi root maupun dokumentasi modul.
4. **Tes terlebih dahulu.** Tulis tes yang gagal, jalankan untuk memastikan kegagalannya, lalu tulis implementasi minimal, dan jalankan seluruh suite sampai hijau. `npm test` di `backend/` adalah gerbang sebelum PR.

Konvensi ini berasal dari catatan Haikal dan disepakati untuk dipakai seluruh tim.
