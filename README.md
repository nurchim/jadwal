# Plotting Jadwal Perkuliahan Jumat & Sabtu — V6

Aplikasi web statis untuk menyusun plotting jadwal perkuliahan khusus **Jumat dan Sabtu**. Tidak memakai database; seluruh data disimpan pada browser menggunakan `localStorage`.

## Pembaruan V6 — Jam Mulai Dinamis

Bagian **Tambah Jadwal Perkuliahan** sekarang tidak lagi membatasi jam mulai pada plotting/template sesi tertentu.

Operator dapat memasukkan **jam mulai berapa pun** melalui input waktu, misalnya:

- 08.00
- 13.25
- 16.15
- 18.40

Setelah Jam Mulai diisi, pengguna dapat memilih salah satu cara berikut:

1. mengisi **Jumlah SKS**, lalu Jam Selesai dihitung otomatis; atau
2. mengisi **Jam Selesai**, lalu Jumlah SKS dihitung otomatis.

Aturannya tetap:

**1 SKS = 50 menit = 1 sesi.**

Contoh:

- Mulai 16.15 + 1 SKS → selesai 17.05.
- Mulai 16.15 + 2 SKS → selesai 17.55.
- Mulai 16.15 + 3 SKS → selesai 18.45.
- Mulai 09.10, selesai 10.50 → otomatis 2 SKS.

Jika rentang Jam Mulai–Jam Selesai bukan kelipatan 50 menit, aplikasi menolak penyimpanan dan menampilkan pesan koreksi.

## Validasi bentrok waktu

Validasi tidak lagi bergantung pada nomor sesi tetap. Aplikasi membandingkan **rentang waktu sebenarnya**.

Contoh:

- Jadwal A: 16.15–18.45
- Jadwal B: 18.00–18.50

Keduanya dianggap bertumpang tindih. Jadwal baru tidak dapat disimpan jika:

- menggunakan ruang yang sama pada waktu yang tumpang tindih; atau
- salah satu dosen pengampu sudah mengajar pada waktu yang tumpang tindih.

Waktu yang hanya bersentuhan pada batas tidak dianggap bentrok. Contoh 16.00–16.50 dan 16.50–17.40 diperbolehkan.

## Plotting dinamis

Menu **Plot Jumat–Sabtu** sekarang membentuk baris waktu otomatis dari jadwal yang tersimpan. Jadi plotting mengikuti jam yang benar-benar dimasukkan operator dan tidak lagi dipaksa mengikuti daftar sesi lama.

## Program Studi

Program Studi tetap berupa dropdown:

1. **Magister Teknologi Informasi**
2. **Magister Manajemen**
3. **Magister Hukum**

## Angkatan

Angkatan tetap berupa dropdown mulai **2025** dan otomatis diperpanjang sampai 10 tahun setelah tahun berjalan.

## Fitur lain yang tetap tersedia

- Tambah/hapus dosen.
- Tambah/hapus ruang.
- Satu jadwal dapat memiliki beberapa dosen.
- Detail jadwal setiap dosen.
- Edit/hapus jadwal.
- Plot Jumat–Sabtu.
- Cetak plot.
- Unduh PDF per Program Studi.
- Backup/restore JSON.
- Penyimpanan `localStorage` tanpa database.
- Migrasi otomatis data versi V5, V4, V3, dan V2.
- Jadwal lama tetap dipertahankan; jadwal V5 yang dahulu melintasi jeda istirahat Sabtu dapat perlu ditinjau saat diedit agar sesuai aturan durasi dinamis baru.
- Responsif untuk komputer dan ponsel.

## PDF per Program Studi

PDF tetap memuat:

- Judul Jadwal Perkuliahan.
- Nama Program Studi.
- Institusi.
- Semester dan Tahun Akademik.
- Hari.
- Jam dinamis sesuai input.
- Kode Mata Kuliah.
- Mata Kuliah.
- SKS.
- Dosen Pengampu.
- Ruang.

## Struktur proyek

```text
plotting-jadwal-jumat-sabtu-v6/
├── index.html
├── styles.css
├── app.js
├── pdf-generator.js
└── README.md
```

## Update GitHub + Vercel

1. Lakukan **Backup Data** pada aplikasi lama.
2. Ekstrak paket V6.
3. Ganti file lama di repository GitHub dengan file V6.
4. Commit dan push ke GitHub.
5. Vercel yang sudah terhubung akan melakukan deployment ulang otomatis.

Tidak diperlukan Node.js, build command, backend, database, atau environment variable.

## Penyimpanan data

Data hanya berada pada browser/perangkat melalui `localStorage`. Data tidak otomatis sinkron antar komputer. Gunakan fitur **Backup Data** dan **Impor Backup** untuk memindahkan atau mengamankan data.
