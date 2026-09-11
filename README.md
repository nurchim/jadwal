# Plotting Jadwal Perkuliahan Jumat & Sabtu — Versi SKS

Aplikasi web statis untuk menyusun plotting jadwal perkuliahan **khusus hari Jumat dan Sabtu**. Aplikasi tidak memakai database; seluruh data disimpan di browser menggunakan `localStorage`.

## Pembaruan versi ini

Pada menu **Tambah Jadwal Perkuliahan**, durasi kuliah sekarang dapat ditentukan dengan:

- **Sesi Mulai**;
- **Sesi Selesai**; atau
- **Jumlah SKS**.

Ketentuan yang digunakan adalah **1 SKS = 50 menit = 1 sesi** sesuai template jadwal. Setelah Sesi Mulai dipilih:

- jika pengguna memilih **Jumlah SKS**, aplikasi otomatis menentukan Sesi Selesai;
- jika pengguna memilih **Sesi Selesai**, aplikasi otomatis menghitung Jumlah SKS.

Contoh: Jumat mulai Sesi 1 (16.00–16.50) dan memilih 3 SKS akan menggunakan Sesi 1, 2, dan 3, sehingga jadwal berakhir pukul 18.30.

Pada hari Sabtu, jeda **ISTIRAHAT 18.10–18.30** tidak dihitung sebagai SKS. Misalnya jadwal 3 SKS yang melintasi waktu istirahat tetap terdiri dari tiga sesi kuliah masing-masing 50 menit.

## Sesi waktu sesuai template

### Jumat

1. 16.00–16.50
2. 16.50–17.40
3. 17.40–18.30
4. 18.30–19.20
5. 19.20–20.10
6. 20.10–21.00

### Sabtu

1. 14.00–14.50
2. 14.50–15.40
3. 15.40–16.30
4. 16.30–17.20
5. 17.20–18.10
6. **ISTIRAHAT 18.10–18.30**
7. 18.30–19.20
8. 19.20–20.10
9. 20.10–21.00

> Catatan: pada aplikasi, sesi perkuliahan Sabtu tetap bernomor 1–8 karena baris istirahat bukan sesi/SKS.

## Validasi bentrok

Aplikasi memeriksa **semua sesi yang dipakai** oleh sebuah mata kuliah. Jadwal ditolak apabila pada salah satu sesi tersebut:

- ruang yang sama sudah digunakan oleh mata kuliah lain; atau
- salah satu dosen yang dipilih sudah mengajar pada jadwal lain.

Karena satu jadwal dapat berisi lebih dari satu dosen, validasi bentrok dilakukan terhadap **seluruh dosen pengampu**.

## Fitur utama

- Perkuliahan hanya Jumat dan Sabtu.
- Tambah/hapus data dosen.
- Tambah/hapus data ruang.
- Tersedia awal Ruang 1 sampai Ruang 6.
- Satu jadwal dapat memiliki beberapa dosen.
- Input mata kuliah, program studi, angkatan, hari, sesi mulai, sesi selesai/jumlah SKS, ruang, dosen, dan catatan.
- Detail dosen menampilkan mata kuliah, program studi, angkatan, hari, rentang jam, jumlah SKS, dan ruang.
- Plot jadwal tabel waktu × ruang.
- Mata kuliah dengan lebih dari 1 SKS ditampilkan pada seluruh baris sesi yang dipakai.
- Edit/hapus jadwal.
- Cetak plot jadwal.
- Backup dan restore JSON.
- Migrasi otomatis dari versi aplikasi sebelumnya (`plottingJadwalJumatSabtu_v2`). Jadwal lama dianggap 1 SKS karena versi lama hanya menyimpan satu sesi per jadwal.
- Responsif untuk desktop, laptop, dan ponsel.

## Struktur proyek

```text
plotting-jadwal-jumat-sabtu-v3/
├── index.html
├── styles.css
├── app.js
└── README.md
```

Tidak ada framework, package manager, backend, database, atau environment variable yang diperlukan.

## Menjalankan di komputer

Cukup buka `index.html` menggunakan browser modern.

## Update GitHub dan Vercel

Jika aplikasi sebelumnya sudah berada di repository GitHub dan telah terhubung ke Vercel:

1. backup data dari aplikasi lama terlebih dahulu;
2. ganti `index.html`, `styles.css`, `app.js`, dan `README.md` dengan file versi ini;
3. commit dan push ke GitHub;
4. Vercel akan membuat deployment baru secara otomatis.

## Penyimpanan data

Data disimpan dengan `localStorage` pada browser/perangkat yang digunakan. Data tidak otomatis sinkron antar komputer. Gunakan fitur **Backup Data** dan **Impor Backup** untuk memindahkan atau mengamankan data.
