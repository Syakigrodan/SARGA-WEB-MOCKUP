# SARGA Mockup

Mockup antarmuka statis untuk **SARGA**, sistem inventaris dan peminjaman alat antar-anggota organisasi. Semua data disimpan di peramban lewat `localStorage`; tidak ada server, build tool, atau basis data nyata.

## Menjalankan

Buka `index.html` langsung di peramban. Tidak perlu memasang apa pun.

Beberapa peramban membatasi `file://`. Bila halaman kosong, jalankan server statis dari folder ini:

```powershell
python -m http.server 8080
```

Lalu buka `http://localhost:8080`.

## Akun Demo

Semua akun contoh memakai kata sandi **`rahasia123`**. Akun yang ditambahkan pengurus lewat portal memakai **`sarga123`**.

| Akun                | Peran                                           | Keadaan                                                      |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| Bambang Irawan      | Pengurus Komunitas Graha Indah, admin platform  | Bisa meminjam, menayangkan alat, dan membuka portal pengurus |
| H. Sudirman Santoso | Org Admin Komunitas Graha Indah, admin platform | Persetujuan anggota dan pengaturan organisasi                |
| Agus Setiawan, S.T. | Anggota baru                                    | Menunggu verifikasi pengurus                                 |
| Rian Hidayat        | Anggota baru                                    | Pendaftaran ditolak, bisa diajukan ulang                     |
| Maya Putri          | Org Admin PT Nusantara Digital                  | Contoh organisasi kantor                                     |
| Dewi Lestari        | Org Admin RT 05 / RW 08 Sukamaju                | Contoh organisasi RT/RW                                      |

Panel **Data demo** di kiri bawah bisa mengganti akun, menampilkan akun menunggu atau ditolak, membuka akun pengurus, dan mereset seluruh data.

## Kode Undangan

| Organisasi             | Kode                             |
| ---------------------- | -------------------------------- |
| Komunitas Graha Indah  | `GRAHA2026`                      |
| RT 05 / RW 08 Sukamaju | `RT05-2026`                      |
| PT Nusantara Digital   | `NUSANTARA2026`                  |
| Karawitan Argo Budoyo  | `ARGO2026` (organisasi nonaktif) |

## Halaman

**Umum dan akun**

- Beranda, masuk (kata sandi dan OTP demo), daftar dengan kode undangan
- Status pendaftaran: menunggu, ditolak dengan alasan, ajukan ulang
- Gabung organisasi lain, profil, ganti kata sandi

**Anggota**

- Katalog dengan pencarian dan filter kategori
- Rincian barang, pengajuan pinjaman dengan validasi tanggal
- Pinjaman saya dengan filter status dan rincian transaksi
- Barang saya, permintaan masuk, tambah dan ubah barang, tarik/tayangkan lagi
- Struktur organisasi dan pengumuman

**Pengurus**

- Monitoring sirkulasi dengan pencarian
- Verifikasi anggota dan pengajuan pinjaman
- Profil organisasi, kode undangan, status organisasi, aktivitas terakhir
- Anggota: daftar, filter status, rincian, ubah peran, tambah manual
- Bagan dan peran anggota

**Admin platform**

- Direktori seluruh organisasi
- Buat organisasi baru beserta Org Admin pertama

## Alur yang Dicakup

- Pendaftaran mandiri dengan kode undangan, lalu verifikasi pengurus
- Penolakan dengan alasan dan pengajuan ulang
- Satu akun untuk beberapa organisasi dengan peran berbeda
- Pengajuan pinjaman, persetujuan pemilik atau pengurus, penolakan beralasan, pembatalan, dan konfirmasi pengembalian
- Perubahan status barang mengikuti pinjaman yang disetujui atau dikembalikan
- Pencatatan aktivitas organisasi dan jejak transaksi
- Pembuatan organisasi hanya oleh admin platform
- Penambahan anggota manual oleh pengurus

## Data dan Reset

- Kunci penyimpanan: `sarga_db_v5`
- Kunci sesi: `sarga_session_v1`
- Reset lewat panel **Data demo**, atau hapus dua kunci tersebut dari penyimpanan peramban

Data awal berisi empat organisasi, 18 akun, sepuluh barang, dan sembilan transaksi pinjaman. Tanggal demo mengikuti November 2026; transaksi `ln-9` sengaja terlambat.

## Berkas

| Berkas                        | Isi                                                                              |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `index.html`                  | Kerangka halaman: header, navigasi, breadcrumb, footer, panel demo, wadah dialog |
| `styles.css`                  | Seluruh tampilan, token warna, tipografi lokal, dan aturan responsif             |
| `data.js`                     | Data awal dan API penyimpanan `window.SARGA_DB`                                  |
| `app.js`                      | Sesi, pembantu tampilan, router, header, toast, dialog, dan penanganan peristiwa |
| `pages-public.js`             | Beranda, masuk, daftar, status akun, gabung organisasi                           |
| `pages-member.js`             | Katalog, rincian, pinjaman, barang, struktur, pengumuman, profil                 |
| `pages-admin.js`              | Monitoring, verifikasi, organisasi, direktori, anggota, bagan                    |
| `forms.js`                    | Penanganan formulir dan pembangun dialog                                         |
| `actions.js`                  | Aksi tombol dan perubahan data                                                   |
| `img/`, `fonts/`, `image.png` | Foto contoh, font Epilogue, dan logo                                             |

## Batasan

- Pemeriksaan akses berjalan di peramban dan hanya membentuk alur prototipe, bukan keamanan nyata.
- Unggahan dokumen hanya menyimpan nama berkas.
- Foto barang dipilih dari daftar contoh; unggahan foto asli belum disimpan.
- Notifikasi WhatsApp hanya berupa tautan `wa.me`; tidak ada pengiriman pesan.
- Kata sandi tersimpan apa adanya di `localStorage` karena ini data demo.
