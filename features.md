# Fitur Utama Aplikasi Kasir POS

Dokumen ini menjelaskan fitur dari sudut pandang pemilik toko dan kasir, dengan bahasa non-teknis.

ANDROID

---

## 1. Pengelolaan Akun & Akses Pengguna

- **Login kasir , manageer, pemilik toko**  
  Kasir atau pemilik toko bisa masuk ke aplikasi menggunakan nomor HP atau email dan PIN. Setelah login, mereka bisa langsung menggunakan semua fitur sesuai hak aksesnya.

- **Pendaftaran bisnis (register)**  
  Pemilik usaha bisa mendaftarkan bisnisnya: mengisi nama toko, jenis usaha, alamat, dan data diri pemilik. Setelah proses ini, toko sudah punya akun sendiri di sistem.

- **Keluar dari aplikasi (logout)**  
  Saat selesai bekerja atau ganti shift, pengguna bisa logout agar akun tidak disalahgunakan orang lain.

- **Verifikasi nomor HP dengan kode OTP**  
  Untuk keamanan, nomor HP bisa diverifikasi menggunakan kode sekali pakai (OTP) yang dikirim ke ponsel.

- **Profil pengguna**  
  Setiap pengguna bisa melihat dan mengubah data profilnya, misalnya nama, email, negara, dan foto profil.

- **Keamanan akun**  
  Pemilik akun dapat mengganti PIN dan, jika diperlukan, menutup/menghapus akun secara permanen.

---

## 2. Pengaturan Toko & Cabang

- **Profil dan pengaturan toko**  
  Menyimpan informasi lengkap tentang toko: nama bisnis, jenis usaha, pemilik, nomor telepon, pajak, mata uang, bahasa, dan alamat lengkap. Data ini dipakai di berbagai bagian aplikasi, termasuk struk penjualan.

- **Multi cabang toko**  
  Aplikasi mendukung banyak cabang. Pemilik bisa memiliki lebih dari satu outlet, dan pengguna dapat memilih cabang mana yang sedang dikelola atau dipakai untuk bertransaksi.

---

## 3. Manajemen Produk & Stok

- **Daftar dan pencarian produk**  
  Menampilkan semua produk yang dijual di toko. Produk bisa difilter berdasarkan kategori, dicari dengan kata kunci, atau ditandai sebagai favorit untuk akses lebih cepat di kasir.

- **Detail produk yang lengkap**  
  Untuk setiap produk, aplikasi menyimpan informasi seperti nama, foto, harga jual, stok, satuan (misalnya pcs, cup), merk, dan varian (contoh: ukuran kecil/sedang/besar). Pemilik bisa melihat stok dan detail lain sebelum mengambil keputusan.

- **Tambah produk baru**  
  Pemilik bisa menambah produk baru dengan:
  - Mengunggah foto produk.  
  - Menentukan harga jual dan harga modal.  
  - Mengatur kategori, merk, dan satuan.  
  - Menambahkan beberapa varian (misalnya rasa atau ukuran berbeda).  
  - Menandai produk sebagai favorit agar cepat muncul di halaman kasir.  
  - Mengaktifkan pengelolaan stok (agar stok otomatis berkurang saat ada transaksi).  
  - Mengisi atau memindai barcode dengan **scanner** sehingga produk mudah dicari saat transaksi.

- **Edit dan hapus produk**  
  Jika ada perubahan harga, foto, nama, atau varian, pemilik bisa mengedit produk kapan saja. Produk juga bisa dihapus jika sudah tidak dijual.

- **Pengelolaan stok**  
  Stok produk bisa disesuaikan dengan mudah, misalnya saat stok baru datang atau saat melakukan stock opname. Aplikasi mendukung penambahan, pengurangan, dan penyesuaian stok sehingga jumlah di sistem selalu mendekati kondisi nyata.

- **Produk antar cabang**  
  Untuk toko yang punya cabang utama dan cabang lain, produk dari toko utama bisa ditarik ke cabang dengan pengaturan harga dan stok yang bisa disesuaikan per cabang.

- **Pencarian dengan barcode**  
  Kasir bisa mencari produk dengan memindai barcode menggunakan scanner, atau mengetik barcode secara manual. Ini mempercepat proses di kasir dan mengurangi kesalahan.

---

## 4. Kategori, Merk, Satuan, dan Resep

- **Kategori produk**  
  Pemilik bisa mengelompokkan produk berdasarkan kategori (misalnya Minuman, Makanan, Snack). Kategori membantu pencarian dan laporan menjadi lebih teratur.

- **Merk produk**  
  Produk dapat dikelompokkan berdasarkan merk tertentu (contoh: merek kopi, minuman kemasan, dll.) sehingga memudahkan saat pemilik ingin melihat performa per merk.

- **Satuan / unit produk**  
  Menentukan satuan penjualan seperti pcs, botol, cup, box, dll. Satuan ini akan tampil di detail produk dan laporan sehingga lebih jelas bagi kasir dan pemilik.

- **Resep & bahan baku**  
  Untuk produk olahan (misalnya minuman racikan atau makanan jadi), aplikasi menyediakan fitur untuk mencatat komposisi resep dan bahan bakunya. Ini membantu pemilik memantau penggunaan bahan dan menghitung biaya modal lebih akurat.

---

## 5. Manajemen Karyawan

- **Daftar karyawan**  
  Menampilkan semua karyawan yang terdaftar, beserta informasi dasar seperti nama, nomor HP, email, jabatan, dan status aktif/non-aktif.

- **Tambah karyawan baru**  
  Pemilik dapat menambahkan karyawan baru (misalnya kasir, supervisor, dll.), termasuk gaji dan tanggal mulai bekerja, sehingga data SDM tercatat rapi.

- **Ubah data & status karyawan**  
  Jika ada perubahan peran (misalnya kasir menjadi supervisor) atau perubahan gaji, data dapat diperbarui. Karyawan yang sudah tidak bekerja bisa di-nonaktifkan tanpa harus menghapus riwayatnya.

---

## 6. Kasir & Transaksi Penjualan

- **Pencatatan penjualan di kasir**  
  Kasir dapat membuat transaksi dengan memilih produk yang dibeli pelanggan, mengatur jumlah, dan memilih varian jika ada. Produk dapat dipilih dari daftar maupun dengan memindai barcode menggunakan **scanner**, sehingga proses di kasir menjadi lebih cepat dan akurat. Semua dilakukan dari satu tampilan kasir yang ringkas.

- **Biaya tambahan & catatan transaksi**  
  Jika ada biaya tambahan (misalnya ongkir, jasa packing, atau biaya lain), kasir bisa menambahkannya ke transaksi. Kasir juga bisa menulis catatan khusus, misalnya "pelanggan langganan" atau instruksi tertentu.

- **Perhitungan otomatis**  
  Aplikasi menghitung subtotal, total, pajak (jika diaktifkan di pengaturan toko), jumlah yang dibayar pelanggan, dan kembalian secara otomatis. Ini mengurangi risiko salah hitung di kasir.

- **Metode pembayaran**  
  Transaksi dapat dicatat dengan metode pembayaran tunai. Di masa depan bisa dikembangkan ke metode lain (non-tunai) jika dibutuhkan.

- **Riwayat transaksi**  
  Pemilik dan kasir bisa melihat daftar transaksi yang pernah terjadi, dengan filter tanggal dan metode pembayaran, sehingga memudahkan pengecekan jika ada komplain atau audit.

- **Detail transaksi lengkap**  
  Setiap transaksi menyimpan informasi lengkap: produk apa saja yang dibeli, berapa jumlahnya, harga, biaya tambahan, total, kasir yang melayani, waktu transaksi, dan tautan ke struk. Dari detail ini, kasir dapat melakukan **cetak struk** ke printer yang sudah diatur.

- **Pembatalan transaksi**  
  Jika terjadi kesalahan input atau pelanggan membatalkan, transaksi tertentu bisa dibatalkan dengan rapi sehingga laporan tetap bersih dan transparan.

- **Ringkasan & statistik penjualan**  
  Aplikasi menyediakan ringkasan penjualan harian dan bulanan, termasuk perbandingan dengan hari/bulan sebelumnya. Ini membantu pemilik melihat tren penjualan dan membuat keputusan bisnis.

---

## 7. Perangkat POS & Struk

- **Pengelolaan perangkat kasir (printer & scanner)**  
  Toko dapat menyambungkan perangkat seperti printer struk dan barcode scanner. Perangkat yang pernah terhubung akan tercatat sehingga mudah dipilih lagi.

- **Pilih perangkat utama**  
  Pemilik bisa menentukan perangkat mana yang menjadi printer utama atau scanner utama agar kasir tidak perlu memilih setiap kali transaksi.

- **Desain struk yang bisa diatur**  
  Toko bisa mengatur tampilan struk: menambahkan logo, menulis catatan di bagian bawah (footer), menampilkan atau menyembunyikan catatan transaksi dan informasi pajak. Ini membuat struk terlihat lebih profesional dan sesuai kebutuhan brand.

---

## 8. Dashboard & Notifikasi

- **Dashboard penjualan**  
  Halaman ringkasan yang menampilkan performa penjualan, misalnya total penjualan hari ini dan bulan ini, serta perbandingan dengan periode sebelumnya. Pemilik bisa dengan cepat melihat kondisi bisnis tanpa harus membuka laporan detail.

- **Notifikasi penting**  
  Aplikasi menampilkan notifikasi untuk hal-hal penting, seperti stok menipis atau masalah pada perangkat kasir, sehingga pemilik bisa bertindak sebelum mengganggu operasional.

---

## 9. Pengalaman Pengguna & Keandalan Sistem

- **Penanganan kesalahan yang rapi**  
  Jika terjadi masalah saat menyimpan atau mengambil data (misalnya koneksi internet putus atau data tidak valid), aplikasi menampilkan pesan kesalahan yang jelas sehingga pengguna tahu apa yang harus dilakukan.

- **Keamanan akses**  
  Jika sesi login sudah tidak valid, aplikasi akan mengarahkan pengguna untuk login ulang agar data toko tetap aman.

- **Dukungan multi-platform**  
  Aplikasi dibangun dengan teknologi yang memungkinkan berjalan di Android, iOS, dan web, sehingga pemilik dan kasir bisa memakai perangkat yang paling nyaman bagi mereka.


---

## 10. Laporan & Ringkasan Keuangan

- **Laporan penjualan**  
  Menyajikan data penjualan harian, mingguan, dan bulanan. Pemilik dapat melihat produk terlaris, jam ramai, serta performa cabang (jika memiliki lebih dari satu outlet).

- **Ringkasan pemasukan**  
  Menampilkan total uang yang masuk dari transaksi penjualan dalam periode tertentu. Ini membantu pemilik memahami berapa omzet yang dihasilkan toko.

- **Ringkasan pengeluaran**  
  Dapat digunakan untuk mencatat atau mengaitkan biaya-biaya yang berhubungan dengan operasional (misalnya pembelian stok, biaya tambahan, dan biaya lain) sehingga pemilik mendapatkan gambaran lebih seimbang antara pemasukan dan pengeluaran.

- **Ringkasan singkat untuk pemilik**  
  Menyediakan tampilan ringkas yang bisa dibaca cepat oleh pemilik, misalnya: total penjualan, jumlah transaksi, rata-rata nilai transaksi, dan ringkasan keuntungan kotor.

---

## 11. Bantuan & FAQ

- **Pusat bantuan di dalam aplikasi**  
  Menyediakan halaman bantuan yang berisi daftar pertanyaan yang sering ditanyakan (FAQ), seperti cara menambah produk, cara mengelola stok, cara mencetak struk, dan cara menambah karyawan.

- **Panduan langkah demi langkah**  
  Untuk fitur-fitur penting (misalnya membuka cabang baru, menyiapkan perangkat kasir, atau menutup hari penjualan), tersedia penjelasan singkat dalam bentuk langkah-langkah yang mudah diikuti.

- **Tips penggunaan**  
  Berisi saran penggunaan terbaik (best practice), misalnya: sebaiknya melakukan pengecekan stok secara berkala, membuat kategori yang rapi, dan membatasi akses kasir sesuai peran.

---

## 12. Mode Offline & Sinkronisasi Data

- **Dukungan mode offline**  
  Aplikasi dirancang agar tetap dapat digunakan ketika koneksi internet sedang tidak stabil atau terputus. Kasir tetap bisa mencatat transaksi dan melihat data dasar produk yang sudah tersimpan di perangkat.

- **Sinkronisasi manual ke server**  
  Ketika koneksi sudah kembali normal, data yang tersimpan di perangkat dapat disinkronkan ke server secara manual. Pengguna akan disarankan untuk:
  - Mengecek kembali riwayat transaksi saat offline sebelum melakukan sync.  
  - Melakukan sync secara berkala agar laporan di server selalu terbaru.  
  - **Catatan penting:** jangan lupa menekan tombol *sinkronisasi* setelah koneksi internet stabil, agar tidak ada transaksi yang tertinggal dan perbedaan data antara perangkat dan server bisa dihindari.




WEB: 
Aplikasi juga dapat diakses melalui browser (web) dengan dua jenis akun utama:
- Pemilik / owner merchant
- Admin aplikasi (pengelola platform)

### 1. Dashboard untuk Pemilik Toko (Owner Merchant)

- **Ringkasan penjualan & keuntungan**  
  Menampilkan angka-angka penting seperti jumlah transaksi, total penjualan, dan perkiraan keuntungan dalam periode tertentu.

- **Jumlah pelanggan baru**  
  Pemilik bisa melihat berapa banyak pelanggan baru yang datang dalam rentang waktu yang dipilih.

- **Produk terlaris & produk hampir habis**  
  Menampilkan daftar produk yang paling sering terjual, sekaligus memberikan peringatan produk mana yang stoknya hampir habis.

- **Performa cabang**  
  Menunjukkan cabang mana yang paling ramai atau paling besar penjualannya.

- **Grafik penjualan & keuntungan**  
  Grafik sederhana untuk melihat naik turunnya penjualan dan keuntungan per hari atau per bulan.

- **Ringkasan cepat di halaman utama**  
  Beberapa blok ringkas yang menampilkan informasi penting seperti produk terlaris, produk hampir habis, dan performa cabang.

- **Tabel transaksi terbaru**  
  Daftar sekitar 20 transaksi terakhir lengkap dengan waktu, cabang, kasir, dan total belanja.

- **Pengelolaan produk & stok**  
  Mengelola produk, kategori, bahan, resep, dan stok langsung dari tampilan web.

- **Riwayat transaksi & riwayat stok**  
  Pemilik bisa melihat kembali riwayat transaksi dan perubahan stok untuk pengecekan.

- **Manajemen pegawai**  
  Menambah, mengubah, atau menonaktifkan akun pegawai yang terhubung ke toko.

- **Manajemen cabang**  
  Melihat daftar cabang yang dimiliki. Fitur tambah cabang bisa dibatasi untuk pengguna paket gratis sesuai kebutuhan bisnis.

- **Pengaturan & profil toko**  
  Mengatur profil toko (nama, kontak, logo) dan pengaturan dasar lainnya dari web.

### 2. Dashboard untuk Admin Aplikasi

- **Ringkasan platform**  
  Menampilkan gambaran umum penggunaan aplikasi, seperti total pengguna terdaftar, jumlah pemilik toko, jumlah cabang, dan pengguna yang aktif.

- **Statistik pengguna**  
  Menyediakan informasi seperti total pengguna, berapa banyak pengguna baru dalam rentang waktu tertentu, dan berapa yang sudah berlangganan paket berbayar.

- **Daftar pengguna (user list)**  
  Tabel berisi data pengguna seperti nama, email, foto profil, peran, dan jumlah toko/cabang yang dimiliki.

- **Pengelolaan pengguna**  
  Admin aplikasi dapat melakukan tindakan seperti menghapus pengguna tertentu atau menandai pengguna sebagai pelanggan paket berbayar.

- **Pengelolaan langganan**  
  Mendukung model langganan sekali bayar (bukan tagihan bulanan berulang), sehingga admin bisa menandai mana saja pengguna yang sudah membeli paket berbayar.