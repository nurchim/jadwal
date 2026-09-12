# Plotting Jadwal Perkuliahan Jumat & Sabtu — V8

Aplikasi web statis untuk menyusun plotting jadwal perkuliahan program magister khusus **Jumat dan Sabtu**. Tidak memakai database; seluruh data disimpan pada browser menggunakan `localStorage`.

## Pembaruan V8 — Ruang Online + Validasi Tim Teaching

Validasi bentrok dosen sekarang memahami pembagian periode mengajar berdasarkan **urutan dosen** pada setiap mata kuliah.

Aturan utama:

- **Dosen 1** mengajar **sampai dengan UTS**.
- **Dosen 2** mengajar **setelah UTS sampai dengan UAS**.
- Jika suatu mata kuliah hanya memiliki **1 dosen**, dosen tersebut dianggap mengajar **sepanjang semester**.
- Jika ada **Dosen ke-3 atau seterusnya**, karena periodenya belum didefinisikan dalam aturan, aplikasi secara konservatif menganggap dosen tersebut mengajar **sepanjang semester** untuk pemeriksaan bentrok.

### Contoh yang TIDAK dianggap bentrok

Pada waktu yang sama:

- Mata Kuliah A: Dr. Budi sebagai **Dosen 1** (sampai UTS).
- Mata Kuliah B: Dr. Budi sebagai **Dosen 2** (setelah UTS–UAS).

Keduanya tidak bentrok karena Dr. Budi mengajar pada dua periode semester yang berbeda.

### Contoh yang tetap dianggap bentrok

Pada waktu yang sama:

- Mata Kuliah A: Dr. Budi sebagai **Dosen 1**.
- Mata Kuliah B: Dr. Budi sebagai **Dosen 1**.

atau:

- Mata Kuliah A: Dr. Budi sebagai **Dosen 2**.
- Mata Kuliah B: Dr. Budi sebagai **Dosen 2**.

atau salah satu jadwal hanya memiliki Dr. Budi sebagai **dosen tunggal**.

## Urutan Tim Teaching

Pada form **Tambah Jadwal Perkuliahan**, setelah dosen dicentang akan muncul panel **Urutan Tim Teaching**.

Operator dapat:

- melihat siapa yang menjadi Dosen 1, Dosen 2, dan seterusnya;
- menaikkan urutan dosen dengan tombol **↑**;
- menurunkan urutan dosen dengan tombol **↓**;
- menghapus dosen dari pilihan tanpa menghapus master data dosen.

Urutan ini disimpan bersama jadwal dan digunakan oleh validasi bentrok, Detail Dosen, Plot Jumat–Sabtu, serta urutan nama dosen pada PDF.

## Validasi ruang fisik dan ruang online

Aturan bentrok ruang dibedakan berdasarkan jenis ruang:

- **Ruang Fisik** tetap tidak boleh digunakan oleh dua mata kuliah pada hari dan rentang jam yang tumpang tindih.
- **Ruang Online** boleh digunakan oleh beberapa mata kuliah pada waktu yang sama karena tidak memakai kelas fisik.
- Untuk jadwal online, setiap jadwal wajib memiliki **link Google Meet/Zoom**.
- Jika dua jadwal online pada waktu yang sama memakai **link yang sama**, aplikasi menyatakan bentrok.
- Jika link Google Meet/Zoom **berbeda**, jadwal online tidak dianggap bentrok.

## Jam dan SKS dinamis

Jam mulai dapat diisi bebas. Pengguna dapat mengisi **Jumlah SKS** atau **Jam Selesai**.

Ketentuan:

**1 SKS = 50 menit = 1 sesi.**

Contoh:

- Mulai 16.15 + 1 SKS → selesai 17.05.
- Mulai 16.15 + 2 SKS → selesai 17.55.
- Mulai 16.15 + 3 SKS → selesai 18.45.

Jika durasi bukan kelipatan 50 menit, jadwal tidak dapat disimpan.

## Program Studi

Program Studi berupa dropdown tetap:

1. **Magister Teknologi Informasi**
2. **Magister Manajemen**
3. **Magister Hukum**

## Angkatan

Angkatan berupa dropdown mulai **2025** dan otomatis diperpanjang sampai 10 tahun setelah tahun berjalan.

## Fitur yang tersedia

- Tambah/hapus dosen.
- Tambah/hapus ruang.
- Tim teaching dengan beberapa dosen dan urutan pengajar.
- Validasi bentrok dosen berdasarkan periode sebelum/sesudah UTS.
- Validasi bentrok ruang berdasarkan rentang jam aktual.
- Jam mulai dinamis.
- Perhitungan SKS otomatis, 1 SKS = 50 menit.
- Detail jadwal setiap dosen beserta periode mengajarnya.
- Edit/hapus jadwal.
- Plot Jumat–Sabtu.
- Cetak plot.
- Unduh PDF per Program Studi.
- Backup/restore JSON.
- Penyimpanan `localStorage` tanpa database.
- Migrasi otomatis data versi V6, V5, V4, V3, dan V2.
- Responsif untuk komputer dan ponsel.

## Struktur proyek

```text
plotting-jadwal-jumat-sabtu-v7/
├── index.html
├── styles.css
├── app.js
├── pdf-generator.js
└── README.md
```

## Update GitHub + Vercel

1. Lakukan **Backup Data** pada aplikasi lama.
2. Ekstrak paket V8.
3. Ganti file lama pada repository GitHub dengan file V8.
4. Commit dan push ke GitHub.
5. Vercel yang sudah terhubung akan melakukan deployment ulang otomatis.

Tidak diperlukan Node.js, build command, backend, database, atau environment variable.

## Penyimpanan data

Data hanya berada pada browser/perangkat melalui `localStorage`. Data tidak otomatis sinkron antar komputer. Gunakan fitur **Backup Data** dan **Impor Backup** untuk memindahkan atau mengamankan data.


## V8 — Ruang Online dan Validasi Link Meeting

Pada versi V8, data ruang memiliki jenis **Ruang Fisik** atau **Ruang Online**. Aturan bentrok diperbarui sebagai berikut:

- Ruang fisik yang sama tetap tidak boleh dipakai oleh dua jadwal dengan waktu yang tumpang tindih.
- Ruang online tidak dianggap bentrok hanya karena nama/mode ruangnya sama.
- Setiap jadwal online wajib mengisi URL Google Meet atau Zoom.
- Dua jadwal online pada waktu yang sama **boleh** berjalan jika URL meeting berbeda.
- Dua jadwal online pada waktu yang sama dengan URL meeting yang sama akan ditolak sebagai **bentrok link online**.
- Validasi dosen tim teaching tetap mengikuti aturan V7: dosen urutan 1 sampai UTS, dosen urutan 2 setelah UTS sampai UAS.
- Data V7 dan versi sebelumnya dimigrasikan otomatis. Ruang lama dianggap ruang fisik, kecuali namanya mengandung penanda seperti Online/Zoom/Google Meet. Saat migrasi dari versi lama, aplikasi menambahkan satu pilihan ruang **Online** jika belum tersedia.
