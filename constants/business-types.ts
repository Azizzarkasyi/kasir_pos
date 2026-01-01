/**
 * Daftar tipe bisnis yang tersedia di aplikasi.
 * Digunakan di halaman registrasi dan pengaturan profil bisnis.
 */
export const businessTypes = [
    { label: "Pilih Tipe Bisnis", value: "" },
    { label: "Restoran / Rumah Makan", value: "restoran" },
    { label: "Café / Coffee Shop", value: "cafe" },
    { label: "Toko Kelontong", value: "toko-kelontong" },
    { label: "Minimarket", value: "minimarket" },
    { label: "Fashion / Pakaian", value: "fashion" },
    { label: "Laundry", value: "laundry" },
    { label: "Salon / Barbershop", value: "salon" },
    { label: "Bengkel / Otomotif", value: "bengkel" },
    { label: "Elektronik / Gadget", value: "elektronik" },
    { label: "Farmasi / Apotek", value: "apotek" },
    { label: "Jasa / Service", value: "jasa" },
    { label: "Kaki Lima / Street Food", value: "kaki-lima" },
    { label: "Lainnya", value: "lainnya" },
];

export type BusinessType = typeof businessTypes[number];
