# Spesifikasi Kebutuhan Perangkat Lunak (SRS)
## SARGA: Platform Peminjaman dan Berbagi Barang untuk Komunitas dan Organisasi
**Versi 1.2** — 22 Oktober 2026  
*Disusun oleh: Tim Pengembang Sarga & Pengurus Organisasi dan Komunitas*

---

Daftar Isi
Daftar Isi ii
### Riwayat Revisi

## 1. Pendahuluan 1

### 1.1 Tujuan 1

### 1.2 Konvensi Dokumen 1

### 1.3 Ruang Lingkup Proyek 2

### 1.4 Referensi 3

## 2. Gambaran Umum 3

### 2.1 Perspektif Produk 3

### 2.2 Kelompok Pengguna dan Karakteristiknya 4

### 2.3 Lingkungan Operasional 5

### 2.4 Batasan Desain dan Implementasi 5

### 2.5 Asumsi dan Ketergantungan 5

## 3. Fitur Sistem 6

### 3.1 Autentikasi dan Pengelolaan Profil Akun Anggota 6

### 3.2 Penemuan dan Penelusuran Katalog Barang (UC-PJ-01) 7

### 3.3 Pengajuan dan Pembatalan Pinjaman Barang (UC-PJ-02 & UC-PJ-03) 9

### 3.4 Pemantauan Pinjaman Aktif dan Pengembalian Barang (UC-PJ-04) 10

### 3.5 Pendaftaran, Publikasi, dan Pengelolaan Barang Anggota (UC-PM-01 & UC-PM-02) 12

### 3.6 Penanggapan Permintaan Masuk dan Konfirmasi Pengembalian (UC-PM-03 & UC-PM-04) 13

### 3.7 Verifikasi Anggota Baru dan Pendaftaran Organisasi Baru (UC-AD-01 & UC-AD-04) 16

### 3.8 Pengelolaan Direktori Channel Organisasi, Anggota, dan Inventaris Alat Organisasi (UC-AD-

02 & UC-AD-03) 17
### 3.9 Monitoring Sirkulasi Barang Beredar Lintas Organisasi (UC-AD-04) 19

## 4. Kebutuhan Data 21

### 4.1 Model Data Logis 21

### 4.2 Kamus Data 21

### 4.3 Laporan 23

### 4.4 Perolehan, Integritas, Penyimpanan, dan Penghapusan Data 23

## 5. Kebutuhan Antarmuka Eksternal 23

### 5.1 Antarmuka Pengguna 23

### 5.2 Antarmuka Perangkat Lunak 24

### 5.3 Antarmuka Perangkat Keras 24

### 5.4 Antarmuka Komunikasi 24

## 6. Atribut Kualitas 24

### 6.1 Kemudahan Penggunaan (Usability) 24

### 6.2 Kinerja (Performance) 25

### 6.3 Keamanan (Security) 25

### 6.4 Keselamatan (Safety) 25

### 6.5 Konsistensi, Keterlacakan (Auditability), dan Ketersediaan (Availability) 25

## 7. Kebutuhan Internasionalisasi dan Lokalisasi 26

## 8. Kebutuhan Lainnya 26

### 8.1 Kepatuhan Pelindungan Data Pribadi dan Pencatatan Sistem 26

### 8.2 Aturan Bisnis (Business Rules) 26

### 8.3 Daftar Keputusan Terbuka / To Be Determined (Open Decisions) 27

## Lampiran A: Glosarium 28

## Lampiran B: Model Analisis 28

## Lampiran C: Skenario Pengujian Utama (Acceptance Test Cases) 31

Hak Cipta © 2013 oleh Karl Wiegers dan Seilevel. Diizinkan untuk menggunakan dan memodifikasi dokumen
ini.
### Riwayat Revisi

Nama Tanggal Alasan Perubahan Versi
Tim Pengembang
Sarga
12-10-
2026
Draf awal dokumen perencanaan aplikasi 0.1
Tim Pengembang
Sarga
15-10-
2026
Penyelarasan penuh dengan Flowchart & UML Use
Case (01 Peminjam, 02 Pemilik, 03 Admin) serta
pengisian template SRS standar
1.0
Tim Pengembang
Sarga
22-10-
2026
Perluasan profil aplikasi dari RT/RW menjadi
komunitas dan organisasi umum dengan konsep
Anggota dan Admin; istilah warga diganti anggota
dan RT diganti organisasi; alur fitur tidak berubah
1.2

## 1. Pendahuluan

Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SRS) ini menjelaskan secara terperinci kebutuhan
fungsional, kebutuhan data, antarmuka, serta atribut kualitas untuk sistem Sarga (Share Antar Tetangga),
yaitu aplikasi web berbagi dan peminjaman barang antaranggota di dalam sebuah organisasi atau komunitas
(misalnya RT/RW, kluster perumahan, komunitas hobi, kantor, sekolah, atau kampus). Bab 1 berisi
pengantar dan ruang lingkup, Bab 2 menjelaskan gambaran umum dan karakteristik pengguna, Bab 3 merinci
setiap fitur sistem, sedangkan Bab 4 hingga Bab 8 beserta Lampiran membahas spesifikasi data, antarmuka
eksternal, atribut kualitas, aturan bisnis, dan model analisis.
### 1.1 Tujuan

Dokumen ini menjelaskan kebutuhan perangkat lunak Sarga versi 1.0. Pembaca utama dokumen ini
meliputi:

## 1. Tim Programmer (Frontend & Backend) – sebagai acuan teknis dalam membangun antarmuka

Angular, layanan REST API Node.js, dan skema basis data SQLite.

## 2. Desainer UI/UX – untuk memastikan keselarasan antara desain layar, status transaksi, dan formulir

lanjutan yang masih perlu dilengkapi.

## 3. Pengurus Organisasi (Admin: ketua, koordinator, atau pihak berwenang lainnya) – untuk

memvalidasi bahwa aturan administrasi anggota, inventaris komunal, dan sirkulasi barang sudah sesuai
dengan kebutuhan organisasi.

## 4. Tim Penguji (Tester / QA) – sebagai dasar penyusunan skenario pengujian fungsional dan penerimaan

pengguna (User Acceptance Testing).
### 1.2 Konvensi Dokumen

Aturan penulisan dan pengodean yang digunakan di seluruh dokumen ini adalah sebagai berikut:
- Setiap kebutuhan fungsional diberi kode unik sesuai kelompok perannya:
- FR-UM-[nomor] untuk Kebutuhan Fungsional Umum (contoh: FR-UM-01).
- FR-PJ-[nomor] untuk Kebutuhan Fungsional Peminjam (contoh: FR-PJ-01).
- FR-PM-[nomor] untuk Kebutuhan Fungsional Pemilik Barang (contoh: FR-PM-01).
- FR-AD-[nomor] untuk Kebutuhan Fungsional Administrator (contoh: FR-AD-01).
- Setiap kebutuhan non-fungsional diberi kode NFR-[nomor] (contoh: NFR-01).
- Istilah teknis atau bahasa asing ditulis dengan huruf miring. Prioritas fitur dibagi menjadi Tinggi,
Sedang, atau Rendah.
- Setiap aturan bisnis lintas-fitur diberi kode BR-[nomor] (contoh: BR-01) dan skenario pengujian
utama diberi kode AC-[nomor] (contoh: AC-01).
- Agar dokumen SRS ini tidak menganggap seluruh detail teknis telah selesai ditentukan oleh desain awal,
setiap spesifikasi dibedakan menjadi lima kategori bukti:

## 1. Terlihat di Desain (Garis Solid): Layar, informasi, atau tombol aksi yang memang sudah tersedia

secara eksplisit pada desain antarmuka dan diagram alur.

## 2. Turunan Alur ([INFERENSI] / Garis Putus-putus): Kebutuhan logis atau status hasil tindakan

yang diperlukan agar proses pada flowchart dapat berjalan konsisten meskipun layar balikannya
belum digambarkan terpisah.

## 3. Batas Bukti (BATAS BUKTI): Tombol atau aksi sudah terlihat pada layar atau tabel monitoring,

namun formulir, dialog, atau aturan lanjutannya belum ditampilkan pada desain rujukan.

## 4. Proses Luar Sistem (MANUAL): Aktivitas koordinasi langsung, serah terima barang, dan

pemeriksaan fisik yang dilakukan mandiri oleh anggota di luar aplikasi.

## 5. Perlu Keputusan (TBD - To Be Determined): Aturan bisnis atau parameter teknis yang belum

ditentukan oleh desain dan wajib diputuskan sebelum tahap pengkodean final.
### 1.3 Ruang Lingkup Proyek

Sarga (Share Antar Tetangga) adalah aplikasi web berbasis komunitas yang memfasilitasi ekonomi
berbagi (sharing economy) tingkat mikro di dalam sebuah organisasi, yaitu sekelompok orang yang saling
mengenal dan dikelola oleh pihak yang berotoritas (Admin). Organisasi dapat berupa RT/RW, kluster
perumahan, komunitas hobi, kantor, sekolah, atau kampus. Istilah "tetangga" pada nama Sarga dimaknai
sebagai sesama anggota organisasi. Aplikasi ini bertujuan menekan perilaku konsumtif terhadap barang yang
jarang dipakai (seperti alat pertukangan, tangga lipat, atau perlengkapan kemping), mengurangi penumpukan
barang di rumah (zero waste), dan mempererat interaksi sosial antaranggota melalui sistem peminjaman yang
terstruktur.
Rilis 1.0 mencakup ruang lingkup fitur berikut:

## 1. Autentikasi anggota menggunakan kata sandi atau OTP WhatsApp serta pemberian hak akses

berdasarkan role dan status verifikasi.

## 2. Penelusuran katalog barang, pencarian kata kunci, dan penyaringan berdasarkan kategori.

## 3. Pengajuan pinjaman barang oleh peminjam serta pembatalan pengajuan selama status masih menunggu

persetujuan.

## 4. Persetujuan (Terima) atau penolakan (Tolak) permintaan pinjaman oleh pemilik barang.

## 5. Pendaftaran, publikasi, dan pengelolaan inventaris barang pribadi milik anggota.

## 6. Pencatatan siklus status peminjaman hingga konfirmasi pengembalian barang oleh pemilik.

## 7. Verifikasi pendaftaran anggota baru oleh Admin berdasarkan pemeriksaan dokumen dan bukti

keanggotaan (misalnya domisili atau kartu anggota).

## 8. Pengelolaan direktori organisasi, daftar anggota channel organisasi, inventaris alat komunal organisasi,

dan pengiriman pengumuman organisasi oleh Admin.
9. Monitoring sirkulasi barang beredar lintas organisasi, pengiriman pengingat jatuh tempo, dan konfirmasi
serah kembali oleh Admin.
10.Pengelolaan informasi profil pribadi, keamanan akun, dan komunikasi dengan pihak terkait transaksi.
Di Luar Ruang Lingkup (Out-of-Scope) Rilis 1.0:

- Sistem tidak mencakup pemrosesan pembayaran sewa, penahanan uang jaminan (deposit), perhitungan
denda keterlambatan otomatis, penyelesaian sengketa finansial, maupun pengelolaan kas/iuran/agenda
anggota secara lengkap.
- Serah terima fisik barang dan pemeriksaan kondisi fisik/kelengkapan dilakukan langsung secara tatap
muka di luar aplikasi (MANUAL). Sistem mendukung koordinasi dan pencatatan status, bukan
menggantikan pemeriksaan fisik tersebut.
### 1.4 Referensi

## 1. Dokumen Perencanaan Aplikasi Web Sarga, Versi 1.0, Tim Pengembang Sarga, Oktober 2026.

## 2. Dokumen Diagram Alur & UML Use Case 01 Peminjam — Dokumentasi Sarga.pdf, Versi

1.0, Tim Desain Sarga (Referensi Layar: Masuk Akun Anggota, Katalog Barang, Detail Barang, Form
Pengajuan, Dashboard Anggota/Pinjaman Saya, Informasi Pribadi, Keamanan & Kata Sandi).

## 3. Dokumen Diagram Alur & UML Use Case 02 Pemilik — Dokumentasi Sarga.pdf, Versi

1.0, Tim Desain Sarga (Referensi Layar: Dashboard Anggota — Barang Saya & Permintaan Masuk,
Daftar Barang Baru, Edit Barang).

## 4. Dokumen Diagram Alur & UML Use Case 03 Admin — Dokumentasi Sarga.pdf, Versi 1.0,

Tim Desain Sarga (Referensi Layar: Dashboard Admin, Verifikasi Anggota Baru, Direktori Organisasi,
Detail Channel Organisasi, Daftar Anggota, Detail Anggota, Inventaris Alat Organisasi, Detail Barang
Inventaris, Monitoring Barang Beredar).

## 2. Gambaran Umum

Bagian ini menjelaskan posisi sistem Sarga dalam ekosistem organisasi atau komunitas (misalnya RT/RW,
kluster perumahan, komunitas hobi, kantor, sekolah, atau kampus), profil kelompok penggunanya,
lingkungan teknis pengoperasian, serta batasan dan asumsi yang mendasari pengembangan sistem.
### 2.1 Perspektif Produk

Sarga adalah produk perangkat lunak mandiri (self-contained web application) yang baru dikembangkan
untuk mendigitalisasi proses peminjaman barang antaranggota dan pengelolaan inventaris komunal
organisasi yang sebelumnya dilakukan secara lisan atau melalui obrolan grup yang tidak terstruktur. Sistem
ini terdiri dari antarmuka web terpadu yang melayani anggota (sebagai peminjam dan pemilik barang) serta
portal administrasi khusus bagi pihak yang berotoritas atas organisasi (Admin). Untuk fungsi pengiriman
kode OTP dan komunikasi langsung antaranggota, sistem berinteraksi dengan layanan pesan WhatsApp serta
memanfaatkan penyimpanan cloud eksternal untuk media foto barang. Konsep organisasi dalam Sarga
sengaja dibuat sederhana, yaitu hanya terdiri dari Anggota dan Admin, sehingga aplikasi dapat dipakai pada
berbagai jenis organisasi tanpa mengubah alur aplikasi.
### 2.2 Kelompok Pengguna dan Karakteristiknya

Sarga memandang organisasi secara sederhana: hanya ada dua jenis keanggotaan, yaitu Anggota dan Admin.
Anggota dapat berperan sebagai Peminjam maupun Pemilik Barang. Admin adalah pihak yang memiliki
otoritas atas organisasi (misalnya ketua RT/RW, koordinator komunitas, atau pengelola kantor, sekolah, dan
kampus) dan bertugas memverifikasi anggota serta mengelola organisasi. Siapa yang berotoritas ditetapkan
oleh masing-masing organisasi; Sarga hanya menyediakan peran Admin tersebut.

## 1. Peminjam (Borrower – Pengguna Prioritas): Anggota organisasi yang membutuhkan barang tertentu

untuk penggunaan jangka pendek. Umumnya mengakses aplikasi melalui peramban ponsel (mobile
browser), membutuhkan pencarian barang yang cepat, kejelasan syarat peminjaman, dan kemudahan
memantau jatuh tempo pengembalian.

## 2. Pemilik Barang (Lender / Owner – Pengguna Prioritas): Anggota organisasi yang memiliki barang

layak pakai yang jarang digunakan dan bersedia meminjamkannya kepada sesama anggota.
Membutuhkan kejelasan identitas pemohon, durasi pinjam, serta kendali penuh untuk menyetujui,
menolak, dan mengonfirmasi pengembalian barangnya.

## 3. Administrator (Admin / Pengurus Organisasi): Pihak yang memiliki otoritas atas organisasi (misalnya

ketua RT/RW, koordinator komunitas, atau pengelola kantor, sekolah, dan kampus) yang bertugas
menjaga keamanan ekosistem melalui verifikasi identitas anggota baru, mengelola data anggota dan
inventaris alat milik organisasi, serta memantau peredaran barang di dalam organisasinya.
#### 2.2.1 Matriks Hak Akses dan Ketentuan Peran (Role-Based Access Control)

Aktor Tanggung Jawab Utama Batas Akses & Kewenangan
Peminjam Menemukan barang, mengajukan pinjaman,
memantau transaksi di Pinjaman Saya,
membatalkan pengajuan menunggu,
mengembalikan barang secara fisik.
Tidak boleh menyetujui pengajuannya sendiri dan
tidak memiliki tombol untuk menyelesaikan
transaksi atas nama pemilik.
Pemilik Mendaftarkan & mengedit barang, menanggapi
permintaan masuk (Terima/Tolak), melakukan
serah terima fisik, menekan Konfirmasi Kembali.
Hanya mengelola barang miliknya sendiri dan
menanggapi permintaan yang ditujukan pada
barang tersebut.
Admin Memverifikasi anggota baru, mengelola
direktori/channel organisasi, melihat anggota &
inventaris alat organisasi, mengirim pengumuman,
memonitor sirkulasi barang.
Hak akses diberikan berdasarkan role akun saat
login; cakupan organisasi yang boleh diakses
mengikuti ketetapan kewenangan (TBD).
Sistem Memvalidasi data masukan, menyimpan transaksi,
memeriksa kewenangan role, memperbarui status
secara konsisten.
Tidak otomatis menyetujui pinjaman tanpa
keputusan pemilik dan tidak menggantikan
pemeriksaan fisik.
Ketentuan Peran (Role Rules):
- Akun Anggota Terpadu: Anggota yang sama dapat bertindak sebagai Peminjam maupun
Pemilik barang menggunakan satu akun anggota yang sama.
- Layar Dashboard Anggota: Merupakan satu layar gabungan yang memuat aktivitas kedua
peran anggota tersebut (Pinjaman Saya serta Barang Saya & Permintaan Masuk).
- Pemeriksaan Kewenangan Server: Menyembunyikan tombol pada antarmuka tidak cukup;
setiap permintaan aksi ke server wajib diperiksa kewenangan role dan kepemilikan datanya oleh
sistem.

- Hal yang Perlu Diputuskan (TBD): Apakah akun Admin dapat merangkap sebagai akun
anggota biasa untuk meminjam barang, serta apakah terdapat pemisahan tingkat akses antar
tingkatan Admin (misalnya pengurus pusat dan pengurus unit).
### 2.3 Lingkungan Operasional

## 1. Perangkat Klien (Client Environment): Sistem diakses melalui peramban web modern (Google

Chrome, Mozilla Firefox, Microsoft Edge, atau Apple Safari versi terbaru) pada perangkat ponsel pintar
(Android/iOS) maupun komputer desktop/laptop.

## 2. Lingkungan Server & Basis Data:

- Frontend disajikan sebagai Single Page Application (SPA) berbasis Angular (TypeScript) yang di-
hosting pada layanan cloud (Vercel/Netlify).
- Backend berjalan di atas lingkungan Node.js dengan framework Express (TypeScript) pada
layanan cloud container (Render/Railway).
- Database menggunakan SQLite yang diakses melalui Prisma ORM / TypeORM pada
penyimpanan persisten (persistent volume atau SQLite edge cloud).
- Penyimpanan berkas foto barang dan dokumen menggunakan layanan penyimpanan objek
Cloudinary.
### 2.4 Batasan Desain dan Implementasi

## 1. Prinsip Antarmuka Minimalis: Desain antarmuka wajib mengutamakan kesederhanaan fungsional

tanpa elemen dekoratif berlebihan, hanya menampilkan tombol dan informasi esensial agar alur transaksi
berjalan jelas.

## 2. Batas Unggahan Media: Foto barang yang diunggah wajib berformat JPG atau PNG dengan ukuran

berkas maksimal 5 MB per foto.

## 3. Batas Input Teks: Kolom catatan kondisi dan instruksi pengambilan barang pada pendaftaran barang

dibatasi maksimal 250 karakter.

## 4. Ketergantungan Proses Fisik: Serah terima barang dan pengecekan kondisi fisik wajib dilakukan

secara langsung di luar aplikasi (MANUAL).

## 5. Kepatuhan Privasi Data: Pengelolaan data identitas dan bukti keanggotaan anggota harus mematuhi

prinsip pelindungan data pribadi (UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi).
### 2.5 Asumsi dan Ketergantungan

## 1. Asumsi: Setiap anggota yang mendaftar memiliki nomor telepon aktif yang terhubung dengan aplikasi

WhatsApp untuk keperluan penerimaan kode OTP dan koordinasi serah terima barang.

## 2. Asumsi: Admin organisasi aktif melakukan pemeriksaan dokumen anggota baru secara berkala sehingga

pendaftar tidak tertahan terlalu lama pada status belum terverifikasi.

## 3. Asumsi: Setiap organisasi yang menggunakan Sarga memiliki setidaknya satu Admin yang berotoritas

atas organisasi tersebut dan bertanggung jawab memeriksa keanggotaan anggota baru.

## 4. Ketergantungan: Pengiriman OTP login dan fitur tombol hubungi anggota/pemilik/pengurus

bergantung pada ketersediaan layanan WhatsApp (wa.me / WhatsApp Gateway).

## 5. Ketergantungan: Kecepatan unggah dan penampilan gambar katalog bergantung pada ketersediaan

layanan pihak ketiga (Cloudinary).

## 3. Fitur Sistem

Kebutuhan fungsional Sarga dikelompokkan ke dalam sembilan fitur sistem utama yang memetakan seluruh
alur pada dokumentasi Flowchart dan UML Use Case Diagram (01 Peminjam, 02 Pemilik, dan 03
Admin).
### 3.1 Autentikasi dan Pengelolaan Profil Akun Anggota

#### 3.1.1 Deskripsi

Fitur ini menangani proses masuk pengguna ke dalam sistem menggunakan kata sandi atau OTP
WhatsApp, mengenali role akun (Anggota atau Admin), menerapkan pembatasan akses berdasarkan
status verifikasi anggota, serta menyediakan pengelolaan informasi pribadi dan keamanan akun.
Prioritas: Tinggi.
#### 3.1.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat: Pengguna telah terdaftar di dalam sistem Sarga.
- Ketentuan Masukan: Nomor kontak/WhatsApp terdaftar dan kata sandi, atau kode OTP
WhatsApp yang masih berlaku.
- Pascakondisi: Sistem membuat sesi login aktif dan mengarahkan pengguna ke Dashboard
Anggota (untuk anggota) atau Dashboard Admin (untuk admin) sesuai role akunnya.
#### 3.1.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Pengguna membuka layar Masuk Akun Anggota dan memasukkan kontak terdaftar beserta kata

sandi, atau memilih metode OTP WhatsApp.

## 2. Sistem memvalidasi kredensial pengguna, memeriksa role akun, serta memuat status verifikasi

anggota.

## 3. Jika pengguna berstatus Anggota, sistem memberikan akses ke Katalog dan Dashboard

Anggota. Jika pengguna berstatus Admin, sistem mengarahkan ke Dashboard Admin.

## 4. Pengguna dapat membuka menu Informasi Pribadi atau Keamanan & Kata Sandi untuk

memperbarui data profil, alamat/unit, atau mengubah kata sandi.
#### 3.1.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Kredensial Tidak Valid: Jika kata sandi atau kode OTP salah/kedaluwarsa, sistem menolak

akses dan menampilkan pesan kesalahan tanpa membuka sesi.

## 2. Akun Belum Terverifikasi: Jika pengguna berhasil login namun status akunnya belum

diverifikasi oleh Admin, sistem membatasi akses sehingga pengguna belum dapat mengirim
pengajuan pinjaman.
#### 3.1.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-UM-01: Sistem harus menyediakan login anggota menggunakan kontak terdaftar dan kata sandi,**
atau OTP WhatsApp.
> *Kriteria Penerimaan: Kredensial valid menghasilkan sesi aktif; kredensial tidak valid tidak*

memberikan akses.

> **FR-UM-02: Sistem harus mengenali role akun setelah login berhasil.**
> *Kriteria Penerimaan: Pengguna hanya mendapatkan tampilan dan fungsi yang diizinkan*

untuk role akun tersebut.

> **FR-UM-03: Sistem harus menerapkan status verifikasi anggota pada hak akses peminjaman.**
> *Kriteria Penerimaan: Anggota yang belum memenuhi verifikasi tidak dapat mengajukan*

pinjaman barang.

> **FR-UM-04: Sistem harus menyediakan pengelolaan informasi pribadi, kontak, dan alamat/unit**
anggota.
> *Kriteria Penerimaan: Perubahan data yang valid tersimpan ke basis data dan ditampilkan*

kembali secara akurat.

> **FR-UM-05: Sistem harus menyediakan pengaturan kata sandi dan keamanan akun sesuai desain.**
> *Kriteria Penerimaan: Perubahan keamanan memerlukan validasi kredensial yang sesuai*

sebelum disimpan.

> **FR-UM-06: Sistem harus melindungi data pribadi dan dokumen verifikasi anggota.**
> *Kriteria Penerimaan: Kontak lengkap, alamat rumah, dan dokumen identitas tidak*

ditampilkan kepada pihak yang tidak berwenang.

> **FR-UM-07: Masa berlaku kode OTP, batas percobaan login gagal, durasi sesi, dan daftar field profil**
yang memerlukan verifikasi ulang saat diubah: TBD.
### 3.2 Penemuan dan Penelusuran Katalog Barang (UC-PJ-01)

#### 3.2.1 Deskripsi

Fitur ini memungkinkan peminjam menelusuri daftar barang yang dibagikan di dalam organisasi,
mencari berdasarkan kata kunci atau kategori, melihat detail kondisi serta ketentuan peminjaman,
dan menghubungi pemilik barang. Prioritas: Tinggi.
#### 3.2.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat: Pengguna memiliki akses ke layar Katalog Barang (ketentuan apakah katalog
dapat dilihat sebelum login berstatus TBD).
- Ketentuan Masukan: Kata kunci pencarian teks dan/atau pilihan filter kategori barang.

- Pascakondisi: Sistem menampilkan informasi detail barang secara akurat; belum ada transaksi
peminjaman baru yang tercatat.
#### 3.2.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Pengguna membuka halaman Katalog Barang → sistem menampilkan daftar kartu barang

beserta status ketersediaannya.

## 2. Pengguna memasukkan kata kunci pencarian atau memilih filter kategori → sistem

menyaring dan menampilkan daftar barang yang sesuai.

## 3. Pengguna memilih salah satu barang → sistem menampilkan halaman Detail Barang yang

berisi foto, kondisi, kelengkapan, identitas pemilik & lokasi, status ketersediaan, dan ketentuan
peminjaman.

## 4. Pengguna dapat menekan tombol Hubungi Pemilik untuk berdiskusi atau menekan Ajukan

Pinjam jika barang tersedia.
#### 3.2.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Hasil Pencarian Kosong: Jika tidak ada barang yang cocok dengan kata kunci atau kategori,

sistem menampilkan pesan keadaan kosong (empty state) dan mengizinkan pengguna mengatur
ulang filter.

## 2. Barang Tidak Tersedia: Jika status barang sedang dipinjam atau tidak tersedia, pengguna tetap

dapat melihat informasi barang namun diarahkan untuk kembali memilih barang lain di katalog.

## 3. Perubahan Status Saat Detail Dibuka: Jika ketersediaan barang berubah tepat ketika halaman

detail dibuka, sistem memuat ulang dan menampilkan status terbaru.
#### 3.2.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-PJ-01: Sistem harus menampilkan katalog barang yang dapat ditelusuri anggota.**
> *Kriteria Penerimaan: Seluruh barang anggota yang telah dipublikasikan tampil beserta*

badge status ketersediaannya.

> **FR-PJ-02: Sistem harus mendukung pencarian barang dan filter berdasarkan kategori.**
> *Kriteria Penerimaan: Hasil pencarian di katalog hanya menampilkan barang yang cocok*

dengan kata kunci dan kategori terpilih.

> **FR-PJ-03: Sistem harus menampilkan halaman detail barang yang memuat kondisi, kelengkapan,**
pemilik, lokasi, status, dan ketentuan peminjaman.
> *Kriteria Penerimaan: Data pada halaman detail konsisten dengan data barang yang dipilih*

dari katalog.

> **FR-PJ-04: Sistem harus menyediakan akses/tombol untuk menghubungi pemilik barang.**
> *Kriteria Penerimaan: Tombol Hubungi Pemilik mengarahkan pengguna ke kanal*

komunikasi pemilik barang yang bersangkutan.

### 3.3 Pengajuan dan Pembatalan Pinjaman Barang (UC-PJ-02 & UC-PJ-

03)
#### 3.3.1 Deskripsi

Fitur ini memfasilitasi peminjam yang telah terverifikasi untuk mengisi formulir pengajuan pinjaman
barang kepada pemilik, serta menyediakan opsi pembatalan apabila pengajuan tersebut masih
berstatus menunggu persetujuan. Prioritas: Tinggi.
#### 3.3.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat Pengajuan: Pengguna sudah login, berstatus anggota terverifikasi, dan barang
memenuhi aturan ketersediaan.
- Prasyarat Pembatalan: Pengajuan merupakan milik pengguna sendiri dan masih berstatus
Menunggu Persetujuan.
- Ketentuan Masukan Form Pengajuan:
- Barang: Mengacu pada barang yang dipilih di halaman detail; tidak boleh berubah tanpa
tindakan pengguna.
- Tanggal Pinjam: Wajib diisi.
- Tanggal Kembali: Wajib diisi, tidak boleh lebih awal dari tanggal pinjam, dan tidak
melampaui batas maksimal durasi barang.
- Catatan: Wajib diisi sesuai desain (batas panjang karakter maksimum: TBD).
- Persetujuan Menjaga Barang: Kotak centang komitmen menjaga barang wajib disetujui
sebelum pengiriman.
- Pascakondisi: Pada pengajuan baru, transaksi tersimpan dengan status Menunggu Persetujuan.
Pada pembatalan, status transaksi berubah menjadi Pengajuan dibatalkan ([INFERENSI]).
#### 3.3.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Pengguna memilih tombol Ajukan Pinjam pada halaman Detail Barang → sistem

menampilkan Form Pengajuan untuk barang tersebut.

## 2. Pengguna mengisi tanggal pinjam, tanggal kembali, catatan keperluan, dan mencentang

persetujuan komitmen menjaga barang → sistem menampilkan estimasi durasi pinjaman.

## 3. Pengguna menekan tombol Kirim Pengajuan → sistem memvalidasi kelengkapan data, hak

akses, dan ketersediaan barang terbaru, lalu menyimpan transaksi.

## 4. Sistem menampilkan pengajuan tersebut pada Dashboard Anggota — Pinjaman Saya dengan

status Menunggu Persetujuan, dan meneruskannya ke daftar permintaan masuk pemilik barang.

## 5. (Opsional — Pembatalan): Saat status masih Menunggu Persetujuan, peminjam membuka

Pinjaman Saya dan menekan tombol Batalkan → sistem memeriksa status terkini, mencatat
status Pengajuan dibatalkan, dan menghentikan permintaan agar tidak lagi dapat
diterima/ditolak oleh pemilik.

#### 3.3.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Isian Tidak Lengkap atau Tanggal Tidak Valid: Jika ada kolom wajib yang kosong, tanggal

kembali lebih awal dari tanggal pinjam, atau durasi melampaui batas maksimal barang, sistem
menolak pengiriman dan menandai bagian yang bermasalah.

## 2. Klik Berulang (Double Submit): Jika tombol Kirim Pengajuan diklik berulang kali secara

cepat, sistem mencegah pembuatan transaksi duplikat.

## 3. Konflik Pembatalan Simultan: Jika pemilik sudah menekan Terima atau Tolak sesaat sebelum

peminjam menekan Batalkan, sistem menolak pembatalan dan menampilkan status keputusan
terbaru dari pemilik.
#### 3.3.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-PJ-05: Sistem harus menyediakan form pengajuan berisi tanggal pinjam, tanggal kembali,**
catatan, dan persetujuan menjaga barang.
> *Kriteria Penerimaan: Seluruh field tampil sesuai desain dan wajib diisi sebelum form dapat*

dikirim.

> **FR-PJ-06: Sistem harus memvalidasi pengajuan (kelengkapan input, aturan tanggal, durasi, dan**
ketersediaan) sebelum menyimpannya.
> *Kriteria Penerimaan: Pengajuan yang melanggar aturan tanggal atau durasi ditolak disertai*

pesan validasi yang jelas.

> **FR-PJ-07: Sistem harus menampilkan pengajuan yang terkirim sebagai Menunggu Persetujuan**
pada bagian Pinjaman Saya.
> *Kriteria Penerimaan: Transaksi baru langsung muncul di Pinjaman Saya (sisi peminjam)*

dan Permintaan Masuk (sisi pemilik).

> **FR-PJ-08: Sistem harus menyediakan aksi pembatalan ketika pengajuan masih berstatus menunggu**
persetujuan.
> *Kriteria Penerimaan: Pengajuan yang dibatalkan berubah status menjadi Dibatalkan dan*

hilang dari antrean aktif pemilik. Kebutuhan dialog konfirmasi dan alasan pembatalan: TBD.
### 3.4 Pemantauan Pinjaman Aktif dan Pengembalian Barang (UC-PJ-04)

#### 3.4.1 Deskripsi

Fitur ini memungkinkan peminjam memantau status persetujuan dari pemilik, melakukan koordinasi
serta serah terima fisik barang di luar aplikasi, memantau tenggat jatuh tempo selama barang
berstatus Aktif Dipinjam, hingga mengembalikan barang dan melihat riwayat transaksi selesai.
Prioritas: Tinggi.
#### 3.4.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat: Pengajuan pinjaman telah disetujui oleh pemilik barang (Disetujui pemilik? → Ya
).

- Ketentuan Masukan: Peminjam tidak memasukkan konfirmasi penyelesaian sendiri;
konfirmasi pengembalian diinput oleh pemilik barang.
- Pascakondisi: Setelah pemilik menekan Konfirmasi Kembali, transaksi ditandai Selesai dan
masuk ke Riwayat Pinjaman Saya.
#### 3.4.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Pemilik menyetujui pengajuan → sistem memperbarui status pengajuan dan mengarahkan

peminjam untuk melakukan Koordinasi dengan pemilik.

## 2. Peminjam dan pemilik bertemu untuk melakukan Serah terima & cek fisik bersama (MANUAL

di luar aplikasi).

## 3. Status pinjaman tercatat sebagai Aktif Dipinjam → sistem menampilkan periode pinjaman

dan informasi jatuh tempo pada Pinjaman Saya.

## 4. Peminjam mengembalikan barang kepada pemilik dan melakukan Kembalikan barang & cek

fisik bersama (MANUAL di luar aplikasi).

## 5. Pemilik memilih aksi Konfirmasi Kembali pada sistem → sistem menandai transaksi Selesai

dan memindahkannya ke daftar Riwayat Pinjaman Saya.
#### 3.4.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Pengajuan Ditolak Pemilik: Jika pemilik menolak pengajuan, sistem menampilkan status

Pengajuan ditolak ([INFERENSI]) dan peminjam dapat kembali memilih barang lain di
katalog.

## 2. Percobaan Penyelesaian Sepihak oleh Peminjam: Sistem tidak menyediakan tombol

penyelesaian bagi peminjam dan menolak setiap upaya penyelesaian transaksi yang bukan
berasal dari pemilik atau admin berwenang.
#### 3.4.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-PJ-09: Sistem harus menampilkan status terkini, periode pinjaman, dan informasi jatuh tempo**
pada bagian Pinjaman Saya.
> *Kriteria Penerimaan: Peminjam dapat melihat batas waktu pengembalian dengan jelas untuk*

setiap pinjaman berstatus Aktif Dipinjam.

> **FR-PJ-10: Sistem harus menampilkan transaksi yang telah dikonfirmasi kembali sebagai riwayat**
pinjaman (Selesai).
> *Kriteria Penerimaan: Transaksi beralih ke riwayat segera setelah pemilik menekan tombol*

Konfirmasi Kembali. Mekanisme pemicu transisi dari Disetujui ke Aktif Dipinjam: TBD.

### 3.5 Pendaftaran, Publikasi, dan Pengelolaan Barang Anggota (UC-PM-

01 & UC-PM-02)
#### 3.5.1 Deskripsi

Fitur ini digunakan oleh anggota (sebagai Pemilik) pada Dashboard Anggota untuk mendaftarkan
barang baru yang layak pakai agar tampil di katalog organisasi, serta memperbarui informasi barang
miliknya melalui fitur Edit Barang. Prioritas: Tinggi.
#### 3.5.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat: Pengguna telah login sebagai anggota terverifikasi. Untuk Edit Barang, barang
tersebut harus dimiliki oleh pengguna yang bersangkutan.
- Ketentuan Masukan Form Daftar Barang Baru:
- Nama Barang: Wajib diisi.
- Kategori: Wajib dipilih dari daftar kategori yang tersedia.
- Foto Barang: Wajib diunggah; format JPG atau PNG, ukuran maksimal 5 MB.
- Maksimal Durasi: Wajib dipilih (pilihan durasi standar atau durasi kustom).
- Catatan Kondisi dan Pengambilan: Menjelaskan keadaan fisik barang dan instruksi
pengambilan; maksimal 250 karakter.
- Persetujuan Kelayakan: Kotak centang pernyataan bahwa barang aman dan layak pakai
wajib disetujui.
- Pascakondisi: Barang baru tersimpan dengan status tersedia (01 Tersedia di Gudang) dan
langsung tampil di Katalog Barang tanpa memerlukan persetujuan admin per barang
([INFERENSI]).
#### 3.5.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Dari Dashboard Anggota, pemilik memilih aksi Daftar Barang Baru → sistem menampilkan

formulir pendaftaran barang.

## 2. Pemilik melengkapi nama barang, kategori, mengunggah foto (JPG/PNG maksimal 5 MB),

menentukan maksimal durasi, mengisi catatan kondisi & pengambilan (maksimal 250 karakter),
dan mencentang pernyataan kelayakan alat.

## 3. Pemilik menekan tombol Simpan & Publikasikan → sistem memvalidasi seluruh isian dan

ukuran/format foto, menyimpan data barang, serta mempublikasikannya ke katalog.

## 4. (Opsional — Edit Barang): Pada daftar Barang Saya di Dashboard Anggota, pemilik memilih

aksi Edit Barang → sistem membuka data barang, memvalidasi perubahan yang diizinkan,
dan menyimpannya tanpa menghapus riwayat transaksi sebelumnya.
#### 3.5.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Foto Tidak Sesuai Format atau Ukuran: Jika berkas foto bukan JPG/PNG atau ukurannya

melebihi 5 MB, sistem menolak unggahan dan menampilkan pesan penjelasan batas
ukuran/format.

## 2. Catatan Melebihi 250 Karakter atau Durasi Tidak Valid: Sistem menahan proses publikasi

dan meminta pemilik memperbaiki isian.

## 3. Kegagalan Penyimpanan: Jika terjadi kegagalan sistem saat menyimpan, barang tidak boleh

ditampilkan seolah-olah sudah terpublikasi.
#### 3.5.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-PM-01: Sistem harus menampilkan daftar barang milik pengguna dan permintaan masuk pada**
Dashboard Anggota.
> *Kriteria Penerimaan: Pemilik hanya melihat daftar barang yang terdaftar atas akunnya*

sendiri.

> **FR-PM-02: Sistem harus menyediakan formulir pendaftaran barang baru.**
> *Kriteria Penerimaan: Formulir memuat seluruh field wajib beserta kotak centang pernyataan*

kelayakan barang.

> **FR-PM-03: Sistem harus mendukung unggahan foto barang berformat JPG/PNG dengan batas**
ukuran maksimal 5 MB.
> *Kriteria Penerimaan: File JPG/PNG ≤ 5 MB berhasil diunggah; file > 5 MB atau*

format lain ditolak.

> **FR-PM-04: Sistem harus menyimpan pengaturan maksimal durasi pinjam dan catatan**
kondisi/pengambilan (maksimal 250 karakter).
> *Kriteria Penerimaan: Batas durasi dan catatan tersimpan dan tampil pada halaman Detail*

Barang di katalog.

> **FR-PM-05: Sistem harus langsung mempublikasikan barang ke katalog setelah proses Simpan &**
Publikasikan berhasil.
> *Kriteria Penerimaan: Barang baru dapat langsung ditemukan oleh anggota lain di Katalog*

Barang tanpa antrean moderasi admin.

> **FR-PM-06: Sistem harus menyediakan aksi Edit Barang bagi pemilik yang berwenang (BATAS**
BUKTI).
> *Kriteria Penerimaan: Perubahan tersimpan tanpa merusak keterkaitan riwayat pinjaman*

lama. Rincian field yang boleh diubah saat barang sedang dipinjam: TBD.
### 3.6 Penanggapan Permintaan Masuk dan Konfirmasi Pengembalian

(UC-PM-03 & UC-PM-04)
#### 3.6.1 Deskripsi

Fitur ini memungkinkan pemilik barang meninjau identitas pemohon dan durasi pada setiap
permintaan pinjaman yang masuk, memberikan keputusan Terima atau Tolak, serta menekan
tombol Konfirmasi Kembali setelah barang dikembalikan secara fisik oleh peminjam. Prioritas:
Tinggi.

#### 3.6.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat Terima/Tolak: Pengajuan ditujukan pada barang milik pengguna, berstatus
Menunggu Verifikasi Anda, dan belum dibatalkan oleh peminjam.
- Prasyarat Konfirmasi Kembali: Barang telah dikembalikan dan diperiksa secara fisik bersama
peminjam (MANUAL), serta transaksi berada pada status aktif dipinjam (Sedang Dipinjam).
- Pascakondisi: Keputusan Terima/Tolak memperbarui status di kedua belah pihak. Aksi
Konfirmasi Kembali menyelesaikan transaksi dan mengembalikan status barang menjadi tersedia
(01 Tersedia di Gudang).
#### 3.6.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Pemilik membuka bagian Permintaan Masuk (berlabel Menunggu Verifikasi Anda) pada

Dashboard Anggota → sistem menampilkan identitas pemohon dan periode durasi
pengajuan.

## 2. Pemilik memilih Terima atau Tolak → sistem memeriksa kewenangan pemilik, status

pengajuan terkini, dan potensi konflik jadwal.

## 3. Jika Tolak, sistem mengubah status menjadi Permintaan ditolak ([INFERENSI]). Jika

Terima, status menjadi disetujui dan dilanjutkan dengan koordinasi jadwal serta serah terima
fisik (MANUAL).

## 4. Selama masa pinjam, barang berstatus Sedang Dipinjam.

## 5. Setelah peminjam mengembalikan barang dan dilakukan pemeriksaan fisik bersama (MANUAL),

pemilik menekan tombol Konfirmasi Kembali pada transaksi terkait.

## 6. Sistem mencatat waktu konfirmasi, menandai transaksi Selesai, dan memperbarui status barang

menjadi tersedia kembali di katalog (01 Tersedia di Gudang).
#### 3.6.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Pengajuan Sudah Dibatalkan Peminjam: Jika peminjam telah membatalkan pengajuan

sebelum pemilik menekan Terima/Tolak, sistem menolak keputusan pemilik dan memperbarui
tampilan.

## 2. Keputusan Ganda atau Konfirmasi Berulang: Klik berulang pada tombol Terima, Tolak, atau

Konfirmasi Kembali tidak boleh menghasilkan perubahan status yang bertentangan atau
penyelesaian ganda.

## 3. Barang Rusak atau Tidak Lengkap Saat Kembali: Alur penanganan khusus jika barang

kembali dalam kondisi rusak belum tersedia pada flowchart dan berstatus TBD.
#### 3.6.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-PM-07: Sistem harus menampilkan informasi pemohon dan periode durasi pengajuan pada**
daftar permintaan masuk.

> *Kriteria Penerimaan: Pemilik dapat melihat siapa anggota yang meminjam dan tanggal*

pinjam/kembalinya sebelum mengambil keputusan.

> **FR-PM-08: Sistem harus menyediakan aksi Terima dan Tolak untuk pengajuan yang masih**
menunggu.
> *Kriteria Penerimaan: Keputusan hanya dapat diberikan oleh pemilik sah barang tersebut dan*

langsung menyinkronkan status di sisi peminjam.

> **FR-PM-09: Sistem harus menyediakan aksi Konfirmasi Kembali untuk transaksi pinjaman yang**
sedang berjalan.
> *Kriteria Penerimaan: Hanya pemilik barang (atau admin berwenang sesuai aturan) yang*

dapat menekan Konfirmasi Kembali.

> **FR-PM-10: Sistem harus memperbarui status transaksi menjadi selesai dan mengembalikan**
ketersediaan barang secara konsisten setelah pengembalian dikonfirmasi.
> *Kriteria Penerimaan: Transaksi masuk ke riwayat selesai dan status barang kembali menjadi*

Tersedia di katalog.
### 3.7 Verifikasi Anggota Baru dan Pendaftaran Organisasi Baru (UC-AD-

01 & UC-AD-04)
#### 3.7.1 Deskripsi

Fitur administrasi ini memungkinkan Admin memeriksa keabsahan dokumen identitas dan bukti
keanggotaan calon anggota baru untuk disetujui atau ditolak, serta menyediakan akses untuk
mendaftarkan organisasi baru ke dalam direktori sistem. Prioritas: Tinggi.
#### 3.7.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat: Pengguna login menggunakan akun dengan role Admin dan memiliki kewenangan
atas organisasi terkait.
- Ketentuan Masukan: Keputusan Setujui atau Tolak pada antrean verifikasi anggota baru.
Untuk fitur Daftarkan Organisasi Baru (BATAS BUKTI), rincian input formulir berstatus
TBD.
- Pascakondisi: Anggota yang disetujui berstatus Anggota terverifikasi ([INFERENSI]) dan
memperoleh hak akses penuh untuk meminjam/mempublikasikan barang.
#### 3.7.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Admin login dan masuk ke Dashboard Admin (Ringkasan multi-organisasi).

## 2. Admin memilih menu Verifikasi Anggota Baru → sistem menampilkan daftar pengajuan

akun anggota yang menunggu pemeriksaan.

## 3. Admin memilih salah satu pendaftar untuk melihat dokumen dan bukti keanggotaan.

## 4. Admin memeriksa keabsahan data, lalu memilih Setujui (jika data sah) atau Tolak (jika tidak

sah).

## 5. Sistem mencatat keputusan, waktu pemeriksaan, dan identitas admin pemeriksa, lalu

memperbarui status verifikasi anggota menjadi Anggota terverifikasi atau Pengajuan anggota
ditolak ([INFERENSI]).

## 6. (Jalur Pendaftaran Organisasi): Dari Dashboard Admin, Admin dapat memilih aksi Daftarkan

Organisasi Baru (BATAS BUKTI) untuk menambahkan organisasi baru ke direktori.
#### 3.7.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Pengajuan Sudah Diproses Admin Lain: Jika permohonan verifikasi anggota telah diputuskan

oleh admin lain sebelumnya, sistem menolak keputusan kedua dan menampilkan status terbaru.

## 2. Dokumen Tidak Lengkap atau Tidak Sesuai Organisasi: Admin menolak pengajuan

verifikasi; mekanisme pengajuan ulang dokumen dan kewajiban mengisi alasan penolakan
berstatus TBD.
#### 3.7.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-AD-01: Sistem harus memberikan akses ke Dashboard Admin berdasarkan role akun saat**
login.
> *Kriteria Penerimaan: Pengguna non-admin ditolak (403 Forbidden) jika mencoba*

mengakses halaman administrasi.

> **FR-AD-02: Sistem harus menampilkan ringkasan multi-organisasi dan sirkulasi pada Dashboard**
Admin.
> *Kriteria Penerimaan: Metrik ringkasan tampil sesuai cakupan organisasi yang dikelola*

admin.

> **FR-AD-03: Sistem harus menampilkan daftar anggota yang menunggu verifikasi beserta tampilan**
dokumen dan bukti keanggotaan.
> *Kriteria Penerimaan: Admin dapat melihat bukti dokumen dan alamat pendaftar sebelum*

mengambil keputusan.

> **FR-AD-04: Sistem harus menyediakan aksi Setujui dan Tolak pada verifikasi anggota baru.**
> *Kriteria Penerimaan: Status verifikasi anggota langsung berubah sesuai keputusan admin*

dan tercatat di log audit.

> **FR-AD-13: Sistem harus menyediakan aksi Daftarkan Organisasi Baru pada Dashboard Admin**
(BATAS BUKTI).
> *Kriteria Penerimaan: Tombol aksi tersedia; spesifikasi field formulir pendaftaran organisasi*

baru: TBD.
### 3.8 Pengelolaan Direktori Channel Organisasi, Anggota, dan

Inventaris Alat Organisasi (UC-AD-02 & UC-AD-03)
#### 3.8.1 Deskripsi

Fitur ini memfasilitasi Admin untuk menelusuri Direktori Organisasi, membuka Detail Channel
tiap organisasi, mencari dan melihat detail anggota organisasi, memeriksa Inventaris Alat

Organisasi (aset komunal), menghubungi anggota/pengurus/penanggung jawab alat, serta
menambahkan anggota dan mengirim pengumuman organisasi. Prioritas: Sedang.
#### 3.8.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat: Admin telah masuk ke Dashboard Admin dan memilih salah satu organisasi pada
Direktori Organisasi.
- Ketentuan Masukan:
- Pencarian anggota berdasarkan nama, alamat/unit, atau nomor WhatsApp serta filter status.
- Pencarian inventaris alat organisasi berdasarkan nama alat atau kode inventaris serta filter
kategori dan ketersediaan.
- Formulir untuk aksi Tambah Anggota dan Kirim Pengumuman Organisasi berstatus
BATAS BUKTI (TBD).
- Pascakondisi: Informasi detail anggota, inventaris komunal, atau kontak pengurus tampil
akurat; pengumuman atau penambahan anggota tercatat sesuai aksi yang dipilih.
#### 3.8.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Admin membuka Direktori Organisasi dari Dashboard Admin, lalu memilih Buka Detail

Channel pada organisasi yang dituju.

## 2. Pada halaman Detail Channel, Admin dapat memilih:

- Hubungi Pengurus melalui informasi kontak pengurus di panel kanan.
- Tambah Anggota (BATAS BUKTI – opsional).
- Kirim Pengumuman Organisasi (BATAS BUKTI – opsional).

## 3. Jika Admin memilih tampilan Anggota:

- Sistem menampilkan Daftar Anggota yang mendukung pencarian (nama / unit / WA) dan
filter status.
- Admin memilih salah satu baris untuk membuka Detail Anggota (menampilkan kontak,
alamat/unit, dan pinjaman aktif) serta dapat menekan tombol Hubungi Anggota.

## 4. Jika Admin memilih tampilan Inventaris:

- Sistem menampilkan Inventaris Alat Organisasi yang mendukung pencarian (nama alat /
kode) dan filter kategori serta ketersediaan.
- Admin memilih salah satu alat untuk membuka Detail Barang Inventaris (menampilkan
kondisi, kelengkapan, lokasi penyimpanan, dan penanggung jawab) serta dapat menekan
tombol Hubungi Pemilik / Penanggung Jawab.
#### 3.8.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Akses Di Luar Cakupan Organisasi: Jika Admin mencoba membuka detail anggota atau

channel organisasi di luar batas kewenangannya, sistem membatasi akses sesuai kebijakan
cakupan organisasi.

## 2. Kegagalan Pengiriman Pengumuman: Jika pengiriman pengumuman organisasi gagal, sistem

wajib menampilkan pesan kegagalan dan tidak menandainya sebagai terkirim.
#### 3.8.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-AD-05: Sistem harus menyediakan direktori organisasi dan halaman detail channel organisasi.**
> *Kriteria Penerimaan: Admin dapat berpindah dari daftar direktori organisasi ke halaman*

detail masing-masing organisasi.

> **FR-AD-06: Sistem harus mendukung pencarian (nama, unit, WA) dan filter status pada daftar**
anggota organisasi.
> *Kriteria Penerimaan: Daftar anggota tersaring secara akurat sesuai parameter pencarian dan*

filter.

> **FR-AD-07: Sistem harus menampilkan detail anggota yang memuat kontak, alamat/unit, dan daftar**
pinjaman aktif.
> *Kriteria Penerimaan: Data detail anggota tampil lengkap dan hanya dapat diakses oleh*

pengguna berwenang.

> **FR-AD-08: Sistem harus menyediakan aksi Tambah Anggota pada detail channel organisasi**
(BATAS BUKTI).
> *Kriteria Penerimaan: Aksi tersedia di layar; spesifikasi data wajib dan pencegahan anggota*

ganda: TBD.

> **FR-AD-09: Sistem harus mendukung pencarian (nama alat/kode) serta filter kategori dan**
ketersediaan pada inventaris alat organisasi.
> *Kriteria Penerimaan: Daftar inventaris komunal tersaring sesuai kata kunci, kode, kategori,*

dan statusnya.

> **FR-AD-10: Sistem harus menampilkan kondisi, kelengkapan, lokasi penyimpanan, dan penanggung**
jawab pada detail barang inventaris.
> *Kriteria Penerimaan: Seluruh atribut pemeliharaan dan lokasi penyimpanan alat komunal*

tampil dengan benar.

> **FR-AD-14: Sistem harus menyediakan aksi komunikasi untuk menghubungi anggota, pengurus**
organisasi, dan penanggung jawab barang inventaris.
> *Kriteria Penerimaan: Tombol hubungi mengarah tepat ke kontak pihak yang dipilih, bukan*

ke kontak umum yang tidak terkait.

> **FR-AD-15: Sistem harus menyediakan aksi Kirim Pengumuman Organisasi pada detail channel**
organisasi (BATAS BUKTI).
> *Kriteria Penerimaan: Aksi tersedia; aturan target penerima, kanal pengiriman, dan pratinjau*

pesan: TBD.

### 3.9 Monitoring Sirkulasi Barang Beredar Lintas Organisasi (UC-AD-04)

#### 3.9.1 Deskripsi

Fitur ini memungkinkan Admin memantau seluruh transaksi peminjaman barang yang sedang
beredar (baik antaranggota maupun lintas organisasi dalam cakupan kewenangannya), mencari dan
menyaring berdasarkan status transaksi, melihat detail transaksi, mengirim pengingat jatuh tempo,
serta mengonfirmasi serah kembali barang. Prioritas: Tinggi.
#### 3.9.2 Prasyarat, Ketentuan Masukan, dan Pascakondisi

- Prasyarat: Admin login dan membuka menu Monitoring Barang Beredar.
- Ketentuan Masukan: Kata kunci pencarian transaksi, filter status sirkulasi, serta pemilihan
salah satu dari tiga aksi tabel: Detail, Ingatkan, atau Konfirmasi (BATAS BUKTI).
- Pascakondisi: Sistem menampilkan detail transaksi, mencatat pengiriman pengingat jatuh
tempo, atau memperbarui status penyelesaian transaksi sesuai kewenangan admin.
#### 3.9.3 Urutan Aksi Pengguna dan Respons Sistem

## 1. Dari Dashboard Admin, Admin membuka layar Monitoring Barang Beredar → sistem

menampilkan tabel transaksi peminjaman yang mencakup barang, pemilik, peminjam,
tenggat jatuh tempo, dan status.

## 2. Admin menggunakan kolom pencarian atau filter status untuk menyaring transaksi.

## 3. Pada baris transaksi terkait, Admin memilih salah satu aksi yang sesuai:

- Detail: Sistem menampilkan informasi rincian transaksi (Lihat detail transaksi).
- Ingatkan (untuk transaksi jatuh tempo): Sistem memproses pengiriman pengingat kepada
peminjam (BATAS BUKTI).
- Konfirmasi (untuk serah kembali): Sistem memproses konfirmasi pengembalian barang
ketika Admin berwenang (BATAS BUKTI).

## 4. Sistem mencatat hasil tindakan Admin ke dalam log aktivitas.

#### 3.9.4 Alur Alternatif dan Penanganan Kegagalan

## 1. Pengiriman Pengingat Gagal: Jika pesan pengingat jatuh tempo gagal terkirim, sistem

mencatat kegagalan tersebut dan tidak menampilkan status berhasil palsu kepada Admin.

## 2. Konfirmasi Tanpa Kewenangan: Jika Admin mencoba menekan Konfirmasi pada transaksi di

luar batas kewenangan yang ditetapkan, sistem menolak tindakan tersebut.
#### 3.9.5 Kebutuhan Fungsional dan Kriteria Penerimaan

> **FR-AD-11: Sistem harus mendukung monitoring pinjaman beredar, termasuk transaksi antaranggota**
dan lintas organisasi dalam kewenangan admin, beserta fitur cari dan filter status.

> *Kriteria Penerimaan: Tabel monitoring menampilkan pemilik, peminjam, tenggat, dan*

status secara konsisten dengan dashboard anggota.

> **FR-AD-12: Sistem harus menyediakan aksi Detail, Ingatkan, dan Konfirmasi sesuai keadaan**
transaksi pada tabel monitoring (BATAS BUKTI).
> *Kriteria Penerimaan: Setiap tindakan tercatat di sistem; batas kewenangan apakah*

Konfirmasi oleh admin hanya untuk aset komunal organisasi atau termasuk barang pribadi
anggota: TBD.

## 4. Kebutuhan Data

Sistem Sarga mengolah data masukan berupa profil dan dokumen anggota, data organisasi, katalog barang
anggota, inventaris komunal organisasi, serta transaksi peminjaman, lalu menghasilkan informasi status
sirkulasi dan riwayat peminjaman.
### 4.1 Model Data Logis

Hubungan logis antar-entitas data utama di dalam basis data relasional Sarga adalah sebagai berikut:

## 1. Organisasi memiliki banyak Akun & Profil Anggota (One-to-Many) dan memiliki banyak Inventaris

Alat Organisasi (One-to-Many).

## 2. Satu Akun & Profil Anggota dapat mendaftarkan banyak Barang Anggota sebagai Pemilik (One-to-

Many) dan dapat mengajukan banyak Transaksi Pinjaman sebagai Peminjam (One-to-Many).

## 3. Satu Barang Anggota atau Inventaris Alat Organisasi dapat memiliki banyak catatan Transaksi

Pinjaman dari waktu ke waktu (One-to-Many), namun hanya boleh memiliki satu pinjaman berstatus
aktif pada periode yang sama.

## 4. Satu permohonan Verifikasi Anggota terhubung ke satu Akun & Profil Anggota dan diperiksa oleh

satu Admin.

## 5. Catatan Aktivitas (Audit Log) dan Pengingat/Pengumuman terhubung ke aktor (Akun) serta objek

(Transaksi Pinjaman atau Organisasi).
### 4.2 Kamus Data

A. Entitas Akun dan Profil Anggota (users)
Nama Elemen Arti Tipe & Panjang Format / Nilai yang Diperbolehkan
id_pengguna Identitas unik akun pengguna UUID / Integer Primary Key, dibuat otomatis oleh
sistem
nomor_wa Nomor kontak WhatsApp untuk
login & koordinasi
Varchar(20) Format angka diawali 628..., unik,
wajib diisi
password_hash Kata sandi akun yang telah
dienkripsi
Varchar(255) Hash bcrypt/argon2, wajib diisi
nama_lengkap Nama lengkap anggota atau
admin
Varchar(100) Alfabet dan spasi, wajib diisi
alamat_unit Alamat atau unit anggota di
dalam organisasi
Varchar(50) Contoh: Blok B3 No. 12 (RT/RW) atau
Divisi Keuangan (kantor), wajib diisi

Nama Elemen Arti Tipe & Panjang Format / Nilai yang Diperbolehkan
id_organisasi Referensi organisasi tempat
anggota terdaftar
Integer (FK) Merujuk ke tabel organisasi
role Peran hak akses akun di
sistem
Enum ANGGOTA, ADMIN
status_verifikasi Status verifikasi keanggotaan
oleh Admin
Enum MENUNGGU_VERIFIKASI,
TERVERIFIKASI, DITOLAK
dokumen_url Tautan foto dokumen bukti
keanggotaan/identitas
Varchar(255) URL HTTPS valid, wajib saat
pendaftaran anggota
B. Entitas Barang Anggota (items) & Inventaris Alat Organisasi (communal_items)
Nama Elemen Arti Tipe & Panjang Format / Nilai yang Diperbolehkan
id_barang Identitas unik barang UUID / Integer Primary Key
kode_inventaris Kode penomoran khusus untuk
alat inventaris organisasi
Varchar(30) Contoh: INV-ORG01-001 (khusus
inventaris organisasi)
id_pemilik Identitas anggota pemilik atau
PJ alat inventaris
Integer (FK) Merujuk ke users.id_pengguna
nama_barang Nama barang atau alat yang
dipinjamkan
Varchar(120) Wajib diisi
kategori Kelompok kategori barang Enum / Varchar Pertukangan, Elektronik, Kemping,
Otomotif, Dapur, Lainnya
foto_url Tautan foto barang yang
diunggah
Varchar(255) Format asli JPG/PNG, ukuran
maksimal 5 MB
maks_durasi Batas durasi maksimal
peminjaman
Integer Dalam satuan hari (contoh: 3, 7, atau
kustom > 0)
catatan_kondisi Keterangan kondisi,
kelengkapan & instruksi ambil
Varchar(250) Maksimal 250 karakter, wajib diisi
layak_pakai Pernyataan bahwa barang
aman dan layak pakai
Boolean true (wajib dicentang saat publikasi)
status_barang Status ketersediaan fisik
barang saat ini
Enum TERSEDIA (01 Tersedia di Gudang),
DIPINJAM, PERAWATAN
C. Entitas Transaksi Pengajuan & Pinjaman (loan_transactions)
Nama Elemen Arti Tipe & Panjang Format / Nilai yang Diperbolehkan
id_transaksi Nomor unik transaksi
peminjaman
UUID / Varchar Primary Key
id_barang Barang yang diajukan untuk
dipinjam
Integer (FK) Merujuk ke items.id_barang
id_peminjam Anggota yang mengajukan
pinjaman
Integer (FK) Merujuk ke users.id_pengguna
tgl_pinjam Tanggal rencana mulai
meminjam
Date Format DD-MM-YYYY, wajib diisi
tgl_kembali Tanggal rencana
pengembalian / jatuh tempo
Date Format DD-MM-YYYY, ≥ tgl_pinjam,
wajib diisi

Nama Elemen Arti Tipe & Panjang Format / Nilai yang Diperbolehkan
catatan_pinjam Catatan keperluan peminjaman
kepada pemilik
Text Wajib diisi pada form pengajuan
setuju_menjaga Persetujuan komitmen menjaga
barang
Boolean true (wajib dicentang)
status_transaksi Status siklus hidup transaksi
saat ini
Enum MENUNGGU_PERSETUJUAN, DISETUJUI,
AKTIF_DIPINJAM, SELESAI, DITOLAK,
DIBATALKAN
waktu_konfirmasi Waktu pengembalian
dikonfirmasi selesai
Datetime DD-MM-YYYY hh:mm (WIB), diisi saat
SELESAI
id_pengonfirmasi Pihak berwenang yang
menekan Konfirmasi Kembali
Integer (FK) Merujuk ke id_pengguna (Pemilik atau
Admin berwenang)
### 4.3 Laporan

Sistem Sarga versi 1.0 tidak mewajibkan laporan cetak berformat baku, namun menyediakan dua tampilan
rekapitulasi terstruktur di dalam aplikasi:

## 1. Riwayat Pinjaman Saya (Dashboard Anggota): Menampilkan daftar seluruh transaksi peminjaman

yang telah berstatus Selesai, diurutkan berdasarkan waktu penyelesaian terbaru.

## 2. Tabel Monitoring Barang Beredar (Dashboard Admin): Menampilkan daftar sirkulasi barang aktif

maupun lintas organisasi yang memuat informasi nama barang, pemilik, peminjam, tanggal jatuh tempo,
dan status transaksi, serta mendukung pencarian dan penyaringan status.
### 4.4 Perolehan, Integritas, Penyimpanan, dan Penghapusan Data

## 1. Data profil anggota dan barang diperoleh langsung dari formulir input pengguna yang telah

terautentikasi.

## 2. Basis data SQLite dicadangkan (backup) secara berkala setiap hari pada penyimpanan server untuk

mencegah kehilangan data transaksi organisasi.

## 1. Aturan Integritas Relasional dan Transaksional:

- Setiap transaksi wajib terhubung ke entitas barang dan peminjam yang valid.
- Identitas pemilik pada suatu transaksi tidak boleh berubah tanpa kebijakan administrasi yang jelas.
- Perubahan detail barang melalui fitur Edit Barang tidak boleh menghapus atau merusak riwayat
transaksi peminjaman yang pernah terjadi pada barang tersebut.
- Tindakan pembatalan (oleh peminjam) serta persetujuan/penolakan (oleh pemilik) yang terjadi
secara bersamaan (concurrent requests) harus dikunci oleh basis data agar tidak menghasilkan status
yang saling bertentangan.
- Penyelesaian transaksi (Konfirmasi Kembali) dan pembaruan status ketersediaan barang menjadi
Tersedia harus dijalankan dalam satu kesatuan transaksi (atomic transaction).
- Kebijakan lama waktu penyimpanan (data retention) untuk dokumen verifikasi dan riwayat lama:
TBD.

## 5. Kebutuhan Antarmuka Eksternal

Sistem Sarga berinteraksi dengan pengguna melalui antarmuka peramban web, dengan layanan penyimpanan
media untuk foto barang, serta dengan platform WhatsApp untuk autentikasi OTP dan koordinasi
antaranggota.
### 5.1 Antarmuka Pengguna

## 1. Gaya Visual Minimalis: Tampilan menggunakan palet warna hijau emerald (#10B981), latar putih

bersih (#FFFFFF), dan abu-abu slate netral dengan tata letak berbasis kartu (card-based layout) yang
bersih tanpa tombol atau ikon dekoratif yang berlebihan.

## 2. Desain Responsif: Antarmuka wajib responsif dan nyaman dioperasikan baik pada layar ponsel anggota

(lebar minimal 360 piksel) maupun layar desktop Admin.

## 3. Penyatuan Dashboard Anggota: Layar Dashboard Anggota menggabungkan aktivitas peminjam

(Pinjaman Saya) dan aktivitas pemilik (Barang Saya & Permintaan Masuk) dalam satu antarmuka yang
konsisten.

## 4. Umpan Balik Validasi: Setiap kesalahan pengisian formulir (seperti tanggal kembali lebih awal dari

tanggal pinjam atau ukuran foto melebihi 5 MB) harus ditampilkan secara jelas di dekat kolom isian
terkait tanpa menghapus isian lain yang sudah benar.
### 5.2 Antarmuka Perangkat Lunak

## 1. Backend RESTful API (Node.js & Express): Antarmuka frontend Angular berkomunikasi dengan

backend menggunakan format pertukaran data JSON melalui protokol HTTP/HTTPS.

## 2. Cloudinary Media Storage API: Digunakan untuk menyimpan dan menyajikan berkas foto barang

(JPG/PNG maksimal 5 MB) serta dokumen verifikasi anggota.

## 3. Layanan WhatsApp (OTP & Deep Link wa.me): Digunakan untuk mengirimkan kode OTP saat

masuk akun anggota serta menghubungkan aksi tombol Hubungi Pemilik, Hubungi Anggota, Hubungi
Pengurus, dan Ingatkan langsung ke nomor WhatsApp tujuan.
### 5.3 Antarmuka Perangkat Keras

Sarga tidak terhubung secara langsung dengan perangkat keras khusus. Pengguna hanya membutuhkan
perangkat ponsel pintar atau komputer yang memiliki koneksi internet serta akses kamera atau penyimpanan
galeri untuk memilih foto barang/dokumen yang akan diunggah.
### 5.4 Antarmuka Komunikasi

## 1. Seluruh komunikasi data antara peramban pengguna dan server Sarga wajib dienkripsi menggunakan

protokol HTTPS (TLS 1.2 atau versi lebih baru).

## 2. Otentikasi sesi pengguna setelah login dikelola menggunakan JSON Web Token (JWT) yang

dikirimkan pada header otorisasi atau HTTP-only cookie di setiap permintaan API.

## 3. Kanal pengiriman notifikasi pengingat jatuh tempo dan pengumuman organisasi (apakah melalui

WhatsApp otomatis, Telegram, atau notifikasi di dalam aplikasi): TBD.

## 6. Atribut Kualitas

Bagian ini menetapkan target kualitas non-fungsional agar sistem Sarga aman, konsisten, dan mudah
digunakan oleh seluruh anggota organisasi.
### 6.1 Kemudahan Penggunaan (Usability)

> **NFR-01: Anggota terverifikasi harus dapat menemukan barang di katalog dan menyelesaikan pengisian**
formulir pengajuan pinjaman dalam waktu kurang dari 3 menit.

> **NFR-02: Status transaksi tidak boleh hanya dibedakan menggunakan warna; setiap status wajib memiliki**
label teks yang jelas dan sesuai dengan konteks perannya (contoh: label "Menunggu Persetujuan" pada
layar Peminjam dan "Menunggu Verifikasi Anda" pada layar Pemilik untuk transaksi yang sama).

> **NFR-03: Pesan validasi pada formulir harus menjelaskan letak kesalahan secara spesifik dan**
mempertahankan isian pengguna yang sudah valid.
### 6.2 Kinerja (Performance)

> **NFR-04: Halaman Katalog Barang dan hasil pencarian/filter kategori harus tampil dalam waktu maksimal 2**
detik pada koneksi jaringan seluler 4G normal (target terukur final: TBD).

> **NFR-05: Proses unggah foto barang berukuran maksimal 5 MB dan penyimpanan pengajuan pinjaman harus**
selesai dalam waktu maksimal 5 detik.
### 6.3 Keamanan (Security)

> **NFR-06: Setiap pembacaan data sensitif dan eksekusi tindakan perubahan status wajib memeriksa hak akses**
(role) dan kepemilikan data di sisi server (backend), bukan hanya menyembunyikan tombol di
antarmuka.

> **NFR-07: Nomor kontak lengkap, alamat/unit detail, dan dokumen verifikasi anggota hanya boleh diakses**
oleh pihak yang berwenang (Admin pemeriksa atau pihak yang terlibat langsung dalam transaksi
peminjaman).
### 6.4 Keselamatan (Safety)

> **NFR-08: Untuk mencegah peminjaman alat yang berbahaya atau rusak, sistem mewajibkan pemilik**
mencentang pernyataan bahwa barang dalam kondisi aman dan layak pakai sebelum tombol Simpan &
Publikasikan dapat diproses.

> **NFR-09: Sistem melarang peminjam menyelesaikan status pinjamannya sendiri guna memastikan barang**
benar-benar telah diterima dan diperiksa fisiknya oleh pemilik sebelum transaksi ditutup.

### 6.5 Konsistensi, Keterlacakan (Auditability), dan Ketersediaan

(Availability)
NFR-10 (Konsistensi & Idempotensi): Pengiriman formulir atau penekanan tombol keputusan (Kirim
Pengajuan, Terima, Tolak, Batalkan, Konfirmasi Kembali) secara berulang tidak boleh menghasilkan
transaksi ganda atau status yang bertentangan.
NFR-11 (Keandalan Umpan Balik): Setiap kegagalan penyimpanan data atau kegagalan pengiriman pesan
pengingat harus ditampilkan secara jujur sebagai kegagalan, tanpa menampilkan pesan keberhasilan
palsu.
NFR-12 (Keterlacakan / Audit Trail): Seluruh tindakan kritis—meliputi verifikasi anggota,
persetujuan/penolakan pinjaman, pembatalan, dan konfirmasi pengembalian—wajib mencatat identitas
aktor pelaksana dan waktu kejadiannya (timestamp).

## 7. Kebutuhan Internasionalisasi dan Lokalisasi

## 1. Bahasa Antarmuka: Seluruh teks antarmuka, label status, dan pesan validasi menggunakan Bahasa

Indonesia yang jelas dan akrab bagi anggota organisasi.

## 2. Format Tanggal dan Waktu: Tanggal ditampilkan dalam format DD-MM-YYYY (atau format tanggal

kalender Indonesia seperti 15 Oktober 2026) dengan acuan zona waktu lokal WIB (UTC+7)
(penentuan jam jatuh tempo spesifik: TBD).

## 3. Format Nomor Kontak dan Alamat: Kolom nomor WhatsApp mendukung format kode negara

Indonesia (+62 atau 08...), sedangkan format alamat/unit menyesuaikan organisasi (contoh:
Blok/Nomor Rumah serta Nomor RT/RW untuk komunitas perumahan, atau divisi/ruangan untuk kantor
dan sekolah).

## 8. Kebutuhan Lainnya

### 8.1 Kepatuhan Pelindungan Data Pribadi dan Pencatatan Sistem

## 1. Sistem wajib membatasi penggunaan dokumen identitas/bukti keanggotaan anggota semata-mata untuk

keperluan verifikasi keanggotaan organisasi sesuai prinsip UU No. 27 Tahun 2022 tentang Pelindungan
Data Pribadi.

## 2. Sistem harus mencatat log aktivitas pada server untuk membantu Admin menelusuri riwayat perubahan

status transaksi apabila terjadi kendala serah terima antaranggota.
### 8.2 Aturan Bisnis (Business Rules)

ID Aturan Deskripsi Aturan Bisnis
BR-01 Anggota yang sama dapat bertindak sebagai Peminjam maupun Pemilik barang dalam satu akun
anggota.

ID Aturan Deskripsi Aturan Bisnis
BR-02 Setiap pengajuan pinjaman membutuhkan keputusan eksplisit dari pemilik (Terima atau Tolak); sistem
tidak melakukan persetujuan otomatis.
BR-03 Pembatalan pengajuan oleh peminjam pada alur yang tersedia hanya diizinkan saat pengajuan masih
berstatus Menunggu Persetujuan.
BR-04 Pemilik barang hanya berwenang menanggapi permintaan pinjaman yang ditujukan terhadap barang
miliknya sendiri.
BR-05 Tanggal kembali pada pengajuan pinjaman tidak boleh lebih awal dari tanggal pinjam.
BR-06 Durasi pengajuan pinjaman harus mematuhi batas maksimal durasi yang ditetapkan pada barang
tersebut.
BR-07 Koordinasi jadwal, serah terima barang, dan pemeriksaan fisik dilakukan secara mandiri di luar aplikasi
(MANUAL).
BR-08 Peminjam tidak dapat menyelesaikan transaksi pinjaman atas namanya sendiri di dalam aplikasi.
BR-09 Konfirmasi pengembalian barang hanya dapat dilakukan oleh pihak yang berwenang (Pemilik barang
atau Admin sesuai kewenangannya).
BR-10 Admin memperoleh hak akses administrasi berdasarkan role akun saat login dan dibatasi sesuai
cakupan organisasinya.
BR-11 Publikasi barang baru oleh anggota tidak memerlukan proses persetujuan Admin per barang untuk tampil
di katalog.
BR-12 Status transaksi yang sama harus ditampilkan secara konsisten pada dashboard peminjam, dashboard
pemilik, dan tabel monitoring admin.
BR-13 (Usulan aturan tambahan — perlu persetujuan): Larangan anggota meminjam barang miliknya sendiri,
pencegahan pengajuan ganda oleh anggota yang sama pada barang/periode yang sama, serta aturan
pencegahan bentrok jadwal reservasi.
### 8.3 Daftar Keputusan Terbuka / To Be Determined (Open Decisions)

Tabel berikut merangkum seluruh item berstatus Perlu Keputusan (TBD) dan BATAS BUKTI yang harus
diselesaikan sebelum dokumen SRS dikunci untuk tahap akhir implementasi:
Prioritas Hal yang Belum Pasti (TBD / Batas Bukti) Dampak terhadap Sistem
Kritis Kapan status Disetujui berubah menjadi Aktif Dipinjam,
dan siapa yang memicu perubahannya di sistem.
Menentukan titik awal tanggung jawab
peminjam dan perhitungan masa pinjam
aktif.
Kritis Apakah persetujuan pinjaman langsung mencadangkan
(reserve) barang dan bagaimana konflik jadwal dicegah.
Menghindari dua peminjam disetujui untuk
barang yang sama pada periode tanggal
yang bentrok.
Kritis Batas kewenangan tombol Konfirmasi oleh Admin pada
tabel Monitoring Barang Beredar.
Memastikan apakah Admin hanya
berwenang mengonfirmasi aset komunal
organisasi atau juga barang pribadi anggota.
Tinggi Cara perhitungan durasi pinjaman (hari kalender, hari
kerja, atau selisih jam) serta jam jatuh tempo dan
toleransi keterlambatan.
Menentukan akurasi validasi batas durasi
barang, pengiriman pengingat, dan penanda
terlambat.
Tinggi Kebijakan dan alur sistem jika barang dikembalikan dalam
keadaan rusak atau tidak lengkap.
Flowchart saat ini belum memiliki cabang
penanganan sengketa atau transisi otomatis
ke status Perawatan.

Prioritas Hal yang Belum Pasti (TBD / Batas Bukti) Dampak terhadap Sistem
Tinggi Cakupan organisasi Admin serta aturan apakah Admin
dapat merangkap sebagai anggota peminjam/pemilik.
Menentukan batasan filter data (data
scoping) pada seluruh kueri di Dashboard
Admin.
Tinggi Kanal resmi pengiriman notifikasi dan pengingat
(WhatsApp, Telegram, atau notifikasi dalam aplikasi).
Menentukan kebutuhan integrasi pihak
ketiga pada backend.
Sedang Spesifikasi rincian formulir untuk 4 aksi BATAS BUKTI:
Edit Barang, Tambah Anggota, Daftarkan Organisasi
Baru, dan Kirim Pengumuman Organisasi.
Diperlukan agar struktur input, validasi
frontend, dan endpoint backend dapat
dibangun secara lengkap.
Sedang Aturan pembatalan setelah pengajuan disetujui pemilik,
atau pembatalan sepihak oleh pemilik barang.
Belum dicakup pada flowchart saat ini.
Sedang Aturan perhitungan skor amanah/reputasi anggota serta
target angka terukur untuk kapasitas, retensi data, dan
pemulihan (recovery).
Dibutuhkan agar fitur reputasi dapat dihitung
konsisten dan kebutuhan non-fungsional
dapat diuji secara kuantitatif.

## Lampiran A: Glosarium

- Admin (Administrator Organisasi): Pihak yang memiliki otoritas atas organisasi (misalnya ketua
RT/RW, koordinator komunitas, atau pengelola kantor, sekolah, dan kampus) dengan hak akses untuk
memverifikasi anggota, mengelola direktori/inventaris organisasi, dan memonitor sirkulasi barang.
- Anggota: Pengguna yang telah terdaftar dan diverifikasi pada sebuah organisasi, yang dapat berperan
sebagai Peminjam maupun Pemilik Barang menggunakan satu akun yang sama.
- Channel Organisasi: Ruang lingkup direktori digital untuk satu organisasi yang memuat daftar anggota,
pengurus, dan inventaris alat komunal milik organisasi tersebut.
- Dashboard Anggota: Halaman terpadu bagi anggota terverifikasi yang menggabungkan pemantauan
Pinjaman Saya (sebagai Peminjam) dan pengelolaan Barang Saya & Permintaan Masuk (sebagai
Pemilik).
- Inventaris Komunal (Inventaris Alat Organisasi): Barang atau peralatan milik bersama di tingkat
organisasi yang dikelola oleh penanggung jawab inventaris dan diawasi oleh Admin.
- Organisasi: Kelompok orang yang menggunakan Sarga bersama-sama dan dikelola oleh pihak
berotoritas (misalnya RT/RW, kluster perumahan, komunitas hobi, kantor, sekolah, atau kampus). Di
dalam Sarga, organisasi hanya terdiri dari Anggota dan Admin.
- OTP (One-Time Password): Kode sandi sekali pakai yang dikirimkan melalui WhatsApp untuk
memvalidasi proses masuk akun anggota.
- Sarga (Share Antar Tetangga): Nama sistem aplikasi web berbagi dan peminjaman barang untuk
komunitas dan organisasi. Istilah "tetangga" dimaknai sebagai sesama anggota organisasi.
- TBD (To Be Determined): Spesifikasi atau aturan yang belum ditentukan pada desain saat ini dan
memerlukan keputusan lebih lanjut.
- [INFERENSI]: Status atau kebutuhan turunan yang disimpulkan secara logis agar alur pada flowchart
dapat berjalan konsisten dari awal hingga akhir.
- BATAS BUKTI: Tombol atau aksi yang terlihat pada desain layar/tabel, namun formulir, dialog, atau
tampilan lanjutannya belum disertakan dalam dokumen desain rujukan.

- MANUAL: Aktivitas fisik seperti koordinasi tatap muka, serah terima barang, dan pemeriksaan kondisi
fisik yang dilakukan pengguna di luar aplikasi.

## Lampiran B: Model Analisis

Model analisis sistem Sarga mengacu pada tiga dokumen diagram alur (Flowchart) dan diagram kasus
penggunaan (UML Use Case Diagram) berikut:
- B.1 Flowchart & UML Use Case Peminjam: Merujuk pada dokumen 01 Peminjam —
Dokumentasi Sarga.pdf (Jalur Penemuan Barang, Pengajuan Pinjaman, serta Peminjaman &
Pengembalian).
- B.2 Flowchart & UML Use Case Pemilik: Merujuk pada dokumen 02 Pemilik — Dokumentasi
Sarga.pdf (Jalur A: Pengelolaan/Publikasi Barang, dan Jalur B: Siklus Peminjaman/Penanggapan
Permintaan).
- B.3 Flowchart & UML Use Case Admin: Merujuk pada dokumen 03 Admin — Dokumentasi
Sarga.pdf (Empat jalur kerja: Verifikasi Anggota Baru, Direktori/Channel Organisasi, Monitoring
Barang Beredar, dan Pendaftaran Organisasi Baru).
B.4 Model Transisi Status Transaksi dan Barang (State Machine)

## 1. Tabel Status Transaksi Peminjaman

Menunggu Persetujuan —[Terima (Pemilik)]→ Disetujui —[Mekanisme TBD]→ Aktif Dipinjam —[Konfirmasi
Kembali]→ Selesai
Status Sistem Label Sisi
Peminjam (01)
Label Sisi
Pemilik (02)
Makna Status Perubahan Status yang
Diizinkan
MENUNGGU_PERSETUJUAN Menunggu
Persetujuan
Menunggu
Verifikasi Anda
Pengajuan telah tersimpan
di sistem dan menunggu
keputusan pemilik barang.
Disetujui, Ditolak (oleh
Pemilik), atau Dibatalkan
(oleh Peminjam)
DISETUJUI Disetujui
(Koordinasi)
Terima
(Koordinasi
jadwal)
Pemilik menerima
pengajuan; serah terima
fisik belum tentu telah
terjadi.
Aktif Dipinjam (melalui
mekanisme yang perlu
ditentukan / TBD)
AKTIF_DIPINJAM Aktif Dipinjam Sedang
Dipinjam
Barang secara fisik sudah
berada pada peminjam dan
sedang dalam masa pinjam.
Selesai (melalui
Konfirmasi Kembali oleh
pihak berwenang)
SELESAI Selesai
(Riwayat
Pinjaman)
Barang
tersedia
kembali
Pengembalian fisik barang
telah dikonfirmasi oleh
pemilik/admin berwenang.
Status akhir (masuk ke
riwayat pinjaman)
DITOLAK Pengajuan
ditolak
([INFERENSI])
Permintaan
ditolak
([INFERENSI])
Pemilik menolak permintaan
pinjaman yang diajukan.
Status akhir (tidak
diproses sebagai
pinjaman aktif)
DIBATALKAN Pengajuan
dibatalkan
([INFERENSI])
(Tidak lagi
aktif)
Peminjam membatalkan
pengajuan saat status
masih menunggu
persetujuan.
Status akhir (tidak
diproses sebagai
pinjaman aktif)

- Catatan Keterlambatan: Keterlambatan pengembalian tidak mengubah status utama dari Aktif
Dipinjam, melainkan memunculkan penanda Terlambat / Jatuh Tempo apabila tanggal saat ini
melewati tanggal jatuh tempo dan transaksi belum dikonfirmasi selesai.

## 2. Status Ketersediaan Barang

- Tersedia (01 Tersedia di Gudang): Barang siap diajukan untuk dipinjam di katalog. Satu
pengajuan berstatus Menunggu Persetujuan belum otomatis mengubah status barang menjadi Dipinjam.
- Dipinjam (Sedang Dipinjam): Barang sedang digunakan dalam transaksi pinjaman aktif.
- Perawatan: Barang sedang dalam pemeliharaan dan tidak dapat diajukan untuk dipinjam sementara
waktu.

## Lampiran C: Skenario Pengujian Utama (Acceptance Test

Cases)
Daftar skenario pengujian ini digunakan oleh tim penguji (QA/Tester) untuk memverifikasi pemenuhan
kebutuhan fungsional dan aturan bisnis Sarga:
ID Uji Skenario Pengujian Hasil yang Diharapkan
AC-01 Anggota terverifikasi mengirim pengajuan pinjaman
dengan data lengkap dan valid.
Satu pengajuan baru tersimpan dengan status
Menunggu Persetujuan (tampil sebagai
Menunggu Verifikasi Anda di sisi pemilik).
AC-02 Peminjam mengisi tanggal kembali lebih awal dari tanggal
pinjam.
Pengajuan ditolak oleh sistem disertai pesan
validasi kesalahan tanggal.
AC-03 Peminjam mengisi durasi pinjaman melebihi batas
maksimal durasi barang.
Sistem menahan pengiriman dan meminta
pengguna memperbaiki rentang tanggal
pinjam.
AC-04 Tombol Kirim Pengajuan diklik berulang kali secara
cepat oleh peminjam.
Sistem hanya memproses satu pengajuan dan
tidak menciptakan transaksi duplikat.
AC-05 Peminjam menekan tombol Batalkan pada pengajuan
yang masih berstatus Menunggu Persetujuan.
Status pengajuan berubah menjadi Dibatalkan
dan tidak lagi dapat diterima/ditolak oleh
pemilik.
AC-06 Pemilik mencoba menekan Terima pada pengajuan yang
baru saja dibatalkan oleh peminjam.
Tindakan ditolak oleh sistem; status transaksi
tetap konsisten sebagai Dibatalkan.
AC-07 Pengguna mencoba menekan Terima/Tolak atau Edit
pada barang milik anggota lain.
Akses ditolak oleh server (403 Forbidden).
AC-08 Pemilik menekan tombol Tolak pada permintaan
pinjaman yang masuk.
Status berubah menjadi Ditolak secara
konsisten baik pada layar pemilik maupun layar
peminjam.
AC-09 Peminjam mencoba menyelesaikan status transaksi
pinjaman sendiri tanpa melalui pemilik.
Tindakan tidak diizinkan oleh sistem karena
hanya pemilik/pihak berwenang yang memiliki
akses Konfirmasi Kembali.
AC-10 Pemilik menekan tombol Konfirmasi Kembali pada
transaksi pinjaman yang sedang berjalan.
Transaksi ditandai Selesai (masuk ke riwayat)
dan status ketersediaan barang kembali
menjadi Tersedia.
AC-11 Pemilik mengunggah foto barang berukuran lebih dari 5
MB atau berformat selain JPG/PNG.
Foto ditolak oleh validasi sistem disertai pesan
penjelasan batas ukuran dan format file.

ID Uji Skenario Pengujian Hasil yang Diharapkan
AC-12 Admin memeriksa dokumen anggota baru yang sah lalu
menekan tombol Setujui.
Status akun anggota diperbarui menjadi
Terverifikasi dan jejak keputusan admin
tercatat di sistem.
AC-13 Pengguna dengan role Anggota biasa mencoba
mengakses halaman Dashboard Admin.
Akses ditolak oleh sistem dan pengguna
dikembalikan ke halaman anggota.
AC-14 Admin mencoba membuka detail anggota yang berada di
luar cakupan organisasi yang menjadi kewenangannya.
Sistem membatasi akses sesuai aturan
cakupan organisasi admin yang disepakati.
AC-15 Pengiriman pesan pengingat jatuh tempo (Ingatkan) oleh
Admin mengalami kegagalan jaringan/layanan.
Kegagalan tercatat pada log sistem dan
antarmuka tidak menampilkan pesan
keberhasilan palsu.