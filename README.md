# Plotting Jadwal Perkuliahan Jumat & Sabtu

Aplikasi web statis untuk menyusun plotting jadwal perkuliahan **khusus hari Jumat dan Sabtu**. Aplikasi tidak memakai database; seluruh data disimpan di browser menggunakan `localStorage`.

## Fitur utama

- Perkuliahan hanya dapat dijadwalkan pada **Jumat** dan **Sabtu**.
- Pilihan sesi waktu sudah dikunci sesuai template:
  - Jumat: 16.00–16.50, 16.50–17.40, 17.40–18.30, 18.30–19.20, 19.20–20.10, 20.10–21.00.
  - Sabtu: 14.00–14.50, 14.50–15.40, 15.40–16.30, 16.30–17.20, 17.20–18.10, **istirahat 18.10–18.30**, 18.30–19.20, 19.20–20.10, 20.10–21.00.
- Satu jadwal/sesi dapat memiliki **lebih dari satu dosen pengampu**.
- Semua dosen dalam satu jadwal diperiksa terhadap bentrok.
- Validasi otomatis menolak jadwal jika:
  - ruang yang sama sudah dipakai pada waktu yang sama/tumpang tindih;
  - salah satu dosen yang dipilih sudah mengajar pada waktu yang sama/tumpang tindih.
- Tambah dan hapus master data dosen.
- Tambah dan hapus master data ruang.
- Secara awal tersedia **Ruang 1 sampai Ruang 6**.
- Input jadwal mencakup:
  - nama mata kuliah;
  - program studi;
  - angkatan;
  - hari;
  - sesi/jam;
  - ruang;
  - satu atau beberapa dosen;
  - catatan opsional.
- Menu **Detail Dosen** menampilkan mata kuliah, program studi, angkatan, hari, jam, dan ruang untuk dosen yang dipilih.
- Plot jadwal berbentuk tabel waktu × ruang seperti template dasar.
- Baris **ISTIRAHAT** Sabtu ditampilkan khusus pada plot.
- Edit dan hapus jadwal.
- Cetak plot jadwal.
- Backup dan restore data melalui file JSON.
- Migrasi sederhana dari data aplikasi versi sebelumnya jika tersedia pada browser yang sama.
- Responsif untuk desktop, laptop, dan ponsel.

## Struktur proyek

```text
plotting-jadwal-jumat-sabtu/
├── index.html
├── styles.css
├── app.js
└── README.md
```

Tidak ada framework, package manager, backend, database, atau environment variable yang diperlukan.

## Cara menjalankan di komputer

Cukup buka `index.html` dengan browser modern. Untuk pengembangan lokal, Anda juga dapat menjalankan folder menggunakan static web server apa pun.

## Upload ke GitHub

1. Buat repository baru di GitHub.
2. Upload `index.html`, `styles.css`, `app.js`, dan `README.md` ke root repository.
3. Commit perubahan.

Jika repository aplikasi lama sudah ada, Anda cukup **mengganti file lama** dengan file dari paket ini lalu commit/push.

## Deploy ke Vercel

1. Buka Vercel dan pilih **Add New → Project**.
2. Import repository GitHub aplikasi.
3. Framework preset dapat dibiarkan sebagai static/other karena aplikasi ini HTML, CSS, dan JavaScript murni.
4. Tidak perlu environment variable dan tidak perlu database.
5. Klik **Deploy**.

Jika project Vercel lama sudah terhubung ke repository GitHub, cukup push perubahan ini. Vercel akan membuat deployment baru dari commit tersebut.

## Penyimpanan data

Data disimpan dengan `localStorage` pada browser/perangkat yang digunakan. Artinya:

- data tidak otomatis sinkron antar komputer;
- membersihkan site data browser dapat menghapus data;
- gunakan menu **Backup** untuk mengunduh file JSON;
- gunakan **Impor Backup** untuk memindahkan data ke perangkat/browser lain.

## Aturan bentrok

Saat menyimpan sebuah jadwal, aplikasi membandingkan hari dan interval waktu terhadap semua jadwal lain. Jadwal ditolak apabila:

1. menggunakan ruang yang sama pada waktu yang bertabrakan; atau
2. terdapat minimal satu dosen yang sama pada dua jadwal yang waktunya bertabrakan.

Karena satu jadwal dapat berisi banyak dosen, pemeriksaan dilakukan pada **setiap dosen yang dipilih**.

## Catatan migrasi versi lama

Jika browser yang sama masih memiliki data dari aplikasi sebelumnya dengan key `plottingJadwalKuliah_v1`, aplikasi akan mencoba memigrasikan jadwal Jumat/Sabtu yang waktunya tepat sama dengan sesi baru. Jadwal hari lain atau jam yang tidak sesuai sesi tidak dimigrasikan karena tidak cocok dengan aturan baru.
