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
│   └── schema.prisma        # Skema database SQLite (users, organizations, items, loans, audit)
├── src/
│   ├── config/              # Konfigurasi Prisma, JWT, env
│   ├── controllers/         # Handler REST API
│   ├── middlewares/         # Autentikasi JWT, RBAC (Anggota/Admin), Error handler
│   ├── routes/              # Routing endpoint API (/api/v1/...)
│   ├── services/            # Logika bisnis & integrasi
│   ├── types/               # TypeScript interface & DTO
│   ├── app.ts               # Setup Express application
│   └── server.ts            # Entry point listener
├── .env.example
├── package.json
└── tsconfig.json
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
   npx prisma migrate dev --name init
   ```

4. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Server akan aktif di `http://localhost:5000` dengan endpoint health check di `http://localhost:5000/api/health`.
