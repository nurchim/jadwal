# Plotting Jadwal Perkuliahan

Aplikasi web sederhana untuk membuat dan memeriksa plotting jadwal perkuliahan tanpa database.

## Fitur

- Tambah dan hapus data dosen.
- Tambah dan hapus data ruang.
- Menentukan mata kuliah, kelas, dosen, ruang, hari, jam mulai, dan jam selesai.
- Validasi bentrok otomatis pada hari dan rentang jam yang sama/tumpang tindih:
  - dosen yang sama tidak boleh mengajar dua jadwal bersamaan;
  - ruang yang sama tidak boleh digunakan dua jadwal bersamaan.
- Edit dan hapus jadwal.
- Filter jadwal berdasarkan hari.
- Plot jadwal mingguan.
- Cetak jadwal.
- Backup dan restore data melalui file JSON.
- Data disimpan di `localStorage` browser, tanpa database dan tanpa server backend.
- Responsive untuk desktop dan HP.

## Cara menjalankan di komputer

Tidak perlu instal apa pun. Cukup buka file `index.html` menggunakan browser modern.

Untuk pengalaman terbaik, Anda juga dapat menjalankan folder ini dengan server statis lokal apa pun.

## Struktur file

```text
plotting-jadwal-kuliah/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## Upload ke GitHub

1. Buat repository baru di GitHub, misalnya `plotting-jadwal-kuliah`.
2. Upload semua file pada folder proyek ini ke repository tersebut.
3. Commit perubahan.

## Deploy ke Vercel dari GitHub

1. Login ke Vercel.
2. Pilih **Add New → Project**.
3. Import repository GitHub `plotting-jadwal-kuliah`.
4. Karena proyek ini merupakan static HTML/CSS/JS, tidak diperlukan database atau environment variable.
5. Deploy proyek.

Setelah repository terhubung, perubahan berikutnya yang di-push ke GitHub dapat memicu deployment baru di Vercel.

## Catatan penting penyimpanan

Aplikasi tidak memiliki database. Data berada pada browser/perangkat yang digunakan. Karena itu:

- data tidak otomatis berpindah ke komputer lain;
- membersihkan site data/cache browser dapat menghapus data aplikasi;
- gunakan tombol **Backup Data** secara berkala;
- gunakan menu **Impor Backup** saat ingin memindahkan atau mengembalikan data.

## Aturan validasi bentrok

Dua jadwal dianggap bentrok jika berada pada **hari yang sama**, rentang waktunya **tumpang tindih**, dan salah satu kondisi berikut terjadi:

- memakai dosen yang sama; atau
- memakai ruang yang sama.

Contoh: jadwal 08:00–10:00 akan bentrok dengan jadwal 09:30–11:00 jika dosen atau ruangnya sama.
