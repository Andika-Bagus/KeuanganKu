# Catatan Keuangan - Finance Tracker

Aplikasi catatan keuangan pribadi untuk mengelola uang dengan bijak.

## Fitur Utama

### 💰 Manajemen Saldo
- **Total Tabungan**: Gabungan saldo dari Rekening Bank dan Cash
- **Rekening Bank**: Track saldo di rekening bank
- **Cash**: Track uang tunai

### 📝 Transaksi
- **Pemasukan**: Catat pendapatan (gaji, bonus, dll)
- **Pengeluaran**: Catat pengeluaran dengan kategori
- **Transfer**: Pindahkan uang antar rekening dan cash

### 🏷️ Kategori Pengeluaran
- 🍽️ Makan
- 🧺 Laundry
- 🛒 Kebutuhan Sehari-hari
- 🏠 Rumah
- 💰 Arisan
- 👨‍👩‍👧 Orang Tua
- ⚡ Kebutuhan Mendadak
- 🍭 Jajan
- 🎁 Self Reward
- 📝 Lainnya

### 🎯 Target Tabungan
- Buat target tabungan (contoh: Beli Motor)
- Set jumlah target dan deadline
- Lihat progress otomatis berdasarkan total tabungan
- Notifikasi saat target tercapai

### 💳 Budget Harian
- Set limit pengeluaran cash harian (default: Rp 30.000)
- Peringatan otomatis saat pengeluaran mencapai 80% limit
- Alert saat melebihi budget harian
- Bisa diatur di menu Settings (⚙️)

### 📊 Statistik & Chart
- **Ringkasan**: Hari ini, Minggu ini, Bulan ini
- **Chart 7 Hari**: Grafik pengeluaran & pemasukan 7 hari terakhir
- **Pengeluaran per Akun**: Pie chart distribusi Bank vs Cash
- **Pengeluaran per Kategori**: Pie chart detail kategori pengeluaran bulan ini

### 🌓 Dark Mode
- Toggle dark/light mode
- Otomatis mengikuti sistem (default)
- Tersimpan di preferensi browser

### 💾 Penyimpanan Data
- Data tersimpan otomatis di browser (localStorage)
- Tidak perlu koneksi internet
- Data tetap ada meskipun refresh halaman
- Reset data tersedia jika diperlukan

## Cara Pakai

1. **Tambah Transaksi**: Klik tombol + di kanan bawah
2. **Lihat Statistik**: Klik icon chart di header
3. **Atur Budget**: Klik icon ⚙️ di header
4. **Tambah Target**: Klik tombol "Tambah Target Tabungan"
5. **Ganti Theme**: Klik icon 🌙/☀️ di header

## Teknologi

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- localStorage

## Development

```sh
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
