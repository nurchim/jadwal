# Plotting Jadwal Perkuliahan Jumat & Sabtu — V5

Aplikasi web statis untuk menyusun plotting jadwal perkuliahan khusus **Jumat dan Sabtu**. Tidak memakai database; seluruh data disimpan di browser menggunakan `localStorage`.

## Pembaruan V5

Versi ini menyederhanakan input jadwal agar lebih aman dan mudah digunakan oleh operator:

### Program Studi menjadi dropdown tetap

Pengguna tidak perlu lagi mengetik nama program studi. Pilihan yang tersedia adalah:

1. **Magister Teknologi Informasi**
2. **Magister Manajemen**
3. **Magister Hukum**

Dengan cara ini penulisan nama program studi selalu konsisten dan hasil PDF tidak terpecah karena perbedaan ejaan.

### Angkatan menjadi dropdown tahun

Kolom Angkatan tidak perlu diketik. Pilihan dimulai dari **2025** dan dibuat otomatis sampai **10 tahun setelah tahun berjalan**. Daftar ini akan bertambah otomatis seiring pergantian tahun, sehingga source code tidak perlu diedit setiap tahun.

Jika data lama memiliki angkatan yang lebih jauh di masa depan, tahun tersebut tetap ikut dimunculkan agar data lama tetap dapat diedit.

## Fitur PDF per Program Studi

Aplikasi dapat mengunduh PDF jadwal berdasarkan Program Studi dengan format:

- judul `Jadwal Perkuliahan`;
- nama Program Studi;
- nama institusi;
- Semester dan Tahun Akademik;
- tabel kolom **Hari, Jam, Kode, Mata Kuliah, SKS, Dosen Pengampu, Ruang**;
- header tabel biru dan baris data selang-seling;
- nama mata kuliah bahasa Inggris opsional;
- jadwal diurutkan otomatis Jumat lalu Sabtu berdasarkan jam mulai;
- satu file PDF hanya berisi satu Program Studi.

PDF dibuat langsung di browser tanpa backend dan tanpa mengirim data ke layanan pihak ketiga.

## Input jadwal

Form **Tambah Jadwal Perkuliahan** berisi:

- Kode Mata Kuliah;
- Nama Mata Kuliah;
- Nama Mata Kuliah Bahasa Inggris (opsional);
- Program Studi — dropdown;
- Angkatan — dropdown mulai 2025;
- Hari — Jumat atau Sabtu;
- Sesi Mulai;
- Sesi Selesai / Jumlah SKS;
- Ruang;
- satu atau lebih Dosen Pengampu;
- Catatan.

## Aturan sesi dan SKS

**1 SKS = 50 menit = 1 sesi.**

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
6. ISTIRAHAT 18.10–18.30 (bukan SKS)
7. 18.30–19.20
8. 19.20–20.10
9. 20.10–21.00

Di dalam aplikasi sesi kuliah Sabtu tetap bernomor 1–8 karena waktu istirahat bukan sesi perkuliahan.

## Validasi bentrok

Jadwal tidak dapat disimpan jika pada salah satu sesi yang sama:

- ruang sudah digunakan jadwal lain; atau
- salah satu dosen yang dipilih sudah mengajar pada jadwal lain.

Jika satu jadwal memiliki beberapa dosen, **semua dosen diperiksa** terhadap kemungkinan bentrok.

## Fitur utama

- Dropdown Program Studi yang konsisten.
- Dropdown Angkatan otomatis mulai tahun 2025.
- Tambah/hapus dosen.
- Tambah/hapus ruang.
- Multi-dosen dalam satu jadwal.
- Durasi otomatis berdasarkan sesi/SKS.
- Detail beban mengajar dosen.
- Plot waktu × ruang untuk Jumat dan Sabtu.
- Edit/hapus jadwal.
- Cetak plot.
- Unduh PDF per Program Studi.
- PDF multi-halaman otomatis jika jadwal banyak.
- Backup/restore JSON.
- Migrasi otomatis data `localStorage` dari V4, V3, dan V2.
- Responsif untuk komputer dan ponsel.

## Struktur proyek

```text
plotting-jadwal-jumat-sabtu-v5/
├── index.html
├── styles.css
├── app.js
├── pdf-generator.js
└── README.md
```

`pdf-generator.js` adalah generator PDF ringan yang disertakan langsung di proyek, sehingga tidak memakai CDN atau library eksternal.

## Update GitHub + Vercel

1. Backup data aplikasi lama melalui menu **Backup**.
2. Ekstrak paket V5.
3. Ganti lima file proyek lama dengan file V5.
4. Commit dan push ke repository GitHub.
5. Vercel yang sudah terhubung akan melakukan deployment ulang otomatis.

Tidak diperlukan Node.js, build command, backend, database, atau environment variable.

## Penyimpanan data

Data hanya berada di browser/perangkat melalui `localStorage`. Data tidak otomatis sinkron antar komputer. Gunakan **Backup Data** dan **Impor Backup** bila perlu memindahkan atau mengamankan data.
