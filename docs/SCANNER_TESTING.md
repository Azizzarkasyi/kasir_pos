# Scanner Testing Guide

Panduan lengkap untuk testing USB dan Bluetooth scanner pada aplikasi POS.

## Overview

Aplikasi mendukung dua jenis scanner:
- **USB Scanner** - Bekerja sebagai HID (Human Interface Device) keyboard emulator
- **Bluetooth Scanner** - Menggunakan Bluetooth Classic untuk komunikasi

## USB Scanner

### Cara Kerja

USB scanner bekerja dengan mengemulasi keyboard:
1. Scanner membaca barcode
2. Scanner mengirim karakter sebagai keyboard input
3. Input biasanya diakhiri dengan karakter Enter/Return
4. Aplikasi menangkap input melalui `TextInput` yang hidden

### Setup Hardware

1. **Hubungkan Scanner ke Device Android:**
   - Gunakan kabel USB OTG adapter
   - Colokkan USB scanner ke OTG adapter
   - Colokkan OTG adapter ke port USB device Android

2. **Verifikasi Koneksi:**
   - Scanner biasanya akan menyala/berkedip saat terhubung
   - Tidak perlu pairing atau konfigurasi tambahan
   - Scanner langsung berfungsi sebagai keyboard

### Testing USB Scanner

1. **Buka Aplikasi:**
   - Jalankan aplikasi: `npx expo run:android`
   - Navigate ke: Dashboard → Setting → Scanner

2. **Tambah Scanner:**
   - Tap "Tambah Scanner"
   - Pilih "USB" dari modal
   - Scanner akan otomatis tersimpan

3. **Test Scanning:**
   - Halaman Scanner Test akan terbuka otomatis
   - Lihat banner info: "Scan barcode dengan USB scanner. Input akan tertangkap otomatis."
   - Scan barcode dengan scanner
   - Barcode akan muncul di section "Barcode Terakhir"
   - History akan terupdate dengan barcode yang baru di-scan

4. **Verifikasi:**
   - ✅ Barcode muncul dengan benar
   - ✅ History terupdate
   - ✅ Bisa scan multiple barcode berturut-turut
   - ✅ Barcode ditampilkan dalam format monospace

### Troubleshooting USB Scanner

**Problem: Barcode tidak tertangkap**
- Pastikan USB scanner terhubung dengan benar
- Cek apakah scanner dalam mode keyboard emulation (bukan mode lain)
- Pastikan scanner mengirim Enter/Return setelah barcode
- Coba scan di aplikasi text editor untuk verifikasi scanner bekerja

**Problem: Barcode terpotong atau tidak lengkap**
- Scanner mungkin terlalu cepat mengirim data
- Coba adjust scan speed di konfigurasi scanner (jika ada)
- Pastikan tidak ada karakter tambahan yang dikirim scanner

**Problem: Barcode ganda**
- Scanner mungkin mengirim data dua kali
- Cek konfigurasi scanner untuk disable duplicate scan
- Implementasi sudah handle dengan reset buffer setelah Enter

## Bluetooth Scanner

### Cara Kerja

Bluetooth scanner menggunakan Bluetooth Classic:
1. Scanner di-pair dengan device Android
2. Aplikasi melakukan scan untuk menemukan device
3. Aplikasi connect ke scanner via MAC address
4. Data barcode diterima melalui `onDataReceived` callback

### Setup Hardware

1. **Aktifkan Bluetooth Scanner:**
   - Nyalakan scanner
   - Masuk ke pairing mode (biasanya dengan scan barcode khusus)
   - Scanner akan terlihat di daftar Bluetooth device

2. **Permissions:**
   - Aplikasi akan meminta permission Bluetooth
   - Aplikasi akan meminta permission Location (untuk Android 10 ke bawah)
   - Grant semua permissions yang diminta

### Testing Bluetooth Scanner

1. **Buka Aplikasi:**
   - Jalankan aplikasi: `npx expo run:android`
   - Navigate ke: Dashboard → Setting → Scanner

2. **Tambah Scanner:**
   - Tap "Tambah Scanner"
   - Pilih "Bluetooth" dari modal
   - Aplikasi akan mulai scan device Bluetooth

3. **Connect Scanner:**
   - Tunggu scanner muncul di list "Perangkat Tersedia"
   - Tap pada scanner yang ingin diconnect
   - Aplikasi akan connect dan navigate ke Scanner Test

4. **Test Scanning:**
   - Halaman Scanner Test akan terbuka
   - Status akan menunjukkan "Terhubung"
   - Scan barcode dengan scanner
   - Barcode akan muncul di section "Barcode Terakhir"
   - History akan terupdate

5. **Verifikasi:**
   - ✅ Scanner terconnect
   - ✅ Barcode muncul dengan benar
   - ✅ History terupdate
   - ✅ Icon Bluetooth ditampilkan
   - ✅ MAC address ditampilkan

### Troubleshooting Bluetooth Scanner

**Problem: Scanner tidak muncul di list**
- Pastikan scanner dalam pairing mode
- Pastikan Bluetooth device Android aktif
- Pastikan Location permission granted (Android 10 ke bawah)
- Coba refresh dengan tap icon refresh di header

**Problem: Gagal connect**
- Pastikan scanner belum terconnect ke device lain
- Coba restart scanner
- Coba unpair dan pair ulang dari Android Settings
- Cek error message untuk detail

**Problem: Barcode tidak tertangkap**
- Pastikan scanner masih terconnect (cek status)
- Coba disconnect dan reconnect
- Pastikan scanner dalam mode yang benar (SPP mode untuk Bluetooth Classic)

**Problem: Connection terputus**
- Bluetooth scanner mungkin auto-sleep setelah idle
- Coba scan barcode untuk "wake up" scanner
- Aplikasi akan auto-reconnect saat kembali ke Scanner Test page

## Scanner Test Page Features

### UI Elements

1. **Device Info Card:**
   - Menampilkan nama scanner
   - Menampilkan connection type (USB/Bluetooth)
   - Menampilkan address/MAC (untuk Bluetooth)
   - Button edit untuk kembali ke scanner settings

2. **USB Info Banner:**
   - Hanya muncul untuk USB scanner
   - Memberikan instruksi cara menggunakan

3. **Barcode Terakhir:**
   - Menampilkan barcode yang baru saja di-scan
   - Highlighted dengan border primary color
   - Icon barcode untuk visual feedback

4. **History:**
   - List semua barcode yang sudah di-scan
   - Numbered list dengan index
   - Button "Hapus" untuk clear history
   - Empty state saat belum ada history

5. **Action Buttons:**
   - "Lupakan Scanner" - Disconnect dan hapus saved device

### Keyboard Shortcuts

Untuk USB scanner, hidden `TextInput` akan:
- Auto-focus saat page load
- Capture semua keyboard input
- Parse barcode saat menerima Enter/Return
- Re-focus setelah barcode tertangkap

## Technical Implementation

### USB Scanner Input Handling

```typescript
const handleUsbTextChange = (text: string) => {
  // USB scanners typically send barcode followed by Enter/Return
  if (text.includes("\n")) {
    const barcode = text.replace(/\n/g, "").trim();
    if (barcode) {
      addBarcodeToHistory(barcode);
    }
    setUsbInputBuffer(""); // Reset buffer
    // Re-focus to continue capturing
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 100);
  } else {
    setUsbInputBuffer(text);
  }
};
```

### Bluetooth Scanner Input Handling

```typescript
useEffect(() => {
  if (!connectedDeviceInstance || !isConnected) return;

  const subscription = connectedDeviceInstance.onDataReceived((data) => {
    const barcode = data.data.trim();
    if (barcode) {
      setLastScannedBarcode(barcode);
    }
  });

  return () => {
    subscription.remove();
  };
}, [connectedDeviceInstance, isConnected]);
```

## Expected Behavior

### Normal Flow

1. User selects scanner type (USB/Bluetooth)
2. Scanner connects successfully
3. User scans barcode
4. Barcode appears in "Barcode Terakhir"
5. Barcode added to history
6. User can continue scanning
7. User can clear history
8. User can forget device

### Edge Cases

- **Rapid scanning:** App should handle multiple scans in quick succession
- **Empty barcode:** App should ignore empty/whitespace-only input
- **Connection loss:** App should show appropriate error and allow reconnect
- **Background/foreground:** Bluetooth should auto-reconnect when returning to page

## Performance Considerations

- Hidden TextInput has minimal performance impact
- FlatList for history is efficient even with many items
- Bluetooth listener is properly cleaned up on unmount
- Auto-reconnect only happens for Bluetooth (not USB)

## Security Notes

- USB scanner tidak memerlukan permission khusus
- Bluetooth scanner memerlukan Bluetooth dan Location permissions
- Barcode data tidak di-encrypt (plain text)
- Saved device info disimpan di AsyncStorage (unencrypted)
