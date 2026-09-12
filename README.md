# Plotting Jadwal Perkuliahan Jumat & Sabtu — V7

Aplikasi web statis untuk menyusun plotting jadwal perkuliahan program magister khusus **Jumat dan Sabtu**. Tidak memakai database; seluruh data disimpan pada browser menggunakan `localStorage`.

## Pembaruan V7 — Validasi Bentrok Tim Teaching

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

## Validasi ruang tetap berlaku

Aturan tim teaching hanya mengubah validasi **dosen**. Ruang tetap tidak boleh digunakan oleh dua mata kuliah pada hari dan rentang jam yang tumpang tindih.

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
2. Ekstrak paket V7.
3. Ganti file lama pada repository GitHub dengan file V7.
4. Commit dan push ke GitHub.
5. Vercel yang sudah terhubung akan melakukan deployment ulang otomatis.

Tidak diperlukan Node.js, build command, backend, database, atau environment variable.

## Penyimpanan data

Data hanya berada pada browser/perangkat melalui `localStorage`. Data tidak otomatis sinkron antar komputer. Gunakan fitur **Backup Data** dan **Impor Backup** untuk memindahkan atau mengamankan data.
