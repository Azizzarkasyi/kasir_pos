/**
 * Fixed units from units.json
 * These are predefined units that don't need CRUD
 */

export interface Unit {
    id: string;
    name: string;
    symbol: string;
    type: UnitType;
}

export type UnitType =
    | 'count'
    | 'weight'
    | 'volume'
    | 'length'
    | 'area'
    | 'packaging'
    | 'fnb'
    | 'medical'
    | 'service';

export const UNITS: Unit[] = [
    // Count
    { id: 'pcs', name: 'Piece', symbol: 'pcs', type: 'count' },
    { id: 'unit', name: 'Unit', symbol: 'unit', type: 'count' },
    { id: 'item', name: 'Item', symbol: 'item', type: 'count' },
    { id: 'set', name: 'Set', symbol: 'set', type: 'count' },
    { id: 'pair', name: 'Pair', symbol: 'pair', type: 'count' },
    { id: 'pack', name: 'Pack', symbol: 'pack', type: 'count' },
    { id: 'bundle', name: 'Bundle', symbol: 'bndl', type: 'count' },
    { id: 'box', name: 'Box', symbol: 'box', type: 'count' },
    { id: 'crate', name: 'Crate', symbol: 'crt', type: 'count' },
    { id: 'lusin', name: 'Lusin', symbol: 'lsn', type: 'count' },
    { id: 'gross', name: 'Gross', symbol: 'grs', type: 'count' },
    { id: 'pallet', name: 'Pallet', symbol: 'plt', type: 'count' },

    // Weight
    { id: 'mcg', name: 'Microgram', symbol: 'mcg', type: 'weight' },
    { id: 'mg', name: 'Milligram', symbol: 'mg', type: 'weight' },
    { id: 'g', name: 'Gram', symbol: 'g', type: 'weight' },
    { id: 'ons', name: 'Ons', symbol: 'ons', type: 'weight' },
    { id: 'kg', name: 'Kilogram', symbol: 'kg', type: 'weight' },
    { id: 'kwintal', name: 'Kwintal', symbol: 'kw', type: 'weight' },
    { id: 'ton', name: 'Ton', symbol: 'ton', type: 'weight' },
    { id: 'lb', name: 'Pound', symbol: 'lb', type: 'weight' },

    // Volume
    { id: 'ml', name: 'Milliliter', symbol: 'ml', type: 'volume' },
    { id: 'cc', name: 'Cubic Centimeter', symbol: 'cc', type: 'volume' },
    { id: 'cl', name: 'Centiliter', symbol: 'cl', type: 'volume' },
    { id: 'dl', name: 'Deciliter', symbol: 'dl', type: 'volume' },
    { id: 'l', name: 'Liter', symbol: 'l', type: 'volume' },
    { id: 'galon', name: 'Galon', symbol: 'gal', type: 'volume' },
    { id: 'drum', name: 'Drum', symbol: 'drm', type: 'volume' },
    { id: 'barrel', name: 'Barrel', symbol: 'bbl', type: 'volume' },

    // Length
    { id: 'mm', name: 'Millimeter', symbol: 'mm', type: 'length' },
    { id: 'cm', name: 'Centimeter', symbol: 'cm', type: 'length' },
    { id: 'm', name: 'Meter', symbol: 'm', type: 'length' },
    { id: 'km', name: 'Kilometer', symbol: 'km', type: 'length' },
    { id: 'inch', name: 'Inch', symbol: 'in', type: 'length' },
    { id: 'feet', name: 'Feet', symbol: 'ft', type: 'length' },
    { id: 'yard', name: 'Yard', symbol: 'yd', type: 'length' },
    { id: 'roll', name: 'Roll', symbol: 'roll', type: 'length' },

    // Area
    { id: 'cm2', name: 'Centimeter Persegi', symbol: 'cm²', type: 'area' },
    { id: 'm2', name: 'Meter Persegi', symbol: 'm²', type: 'area' },
    { id: 'are', name: 'Are', symbol: 'are', type: 'area' },
    { id: 'hectare', name: 'Hectare', symbol: 'ha', type: 'area' },

    // Packaging
    { id: 'sachet', name: 'Sachet', symbol: 'sct', type: 'packaging' },
    { id: 'pouch', name: 'Pouch', symbol: 'pch', type: 'packaging' },
    { id: 'bag', name: 'Bag', symbol: 'bag', type: 'packaging' },
    { id: 'bottle', name: 'Bottle', symbol: 'btl', type: 'packaging' },
    { id: 'jar', name: 'Jar', symbol: 'jar', type: 'packaging' },
    { id: 'can', name: 'Can', symbol: 'can', type: 'packaging' },
    { id: 'cup', name: 'Cup', symbol: 'cup', type: 'packaging' },
    { id: 'carton', name: 'Carton', symbol: 'ctn', type: 'packaging' },
    { id: 'tray', name: 'Tray', symbol: 'tray', type: 'packaging' },
    { id: 'tube', name: 'Tube', symbol: 'tube', type: 'packaging' },

    // F&B
    { id: 'porsi', name: 'Porsi', symbol: 'prs', type: 'fnb' },
    { id: 'butir', name: 'Butir', symbol: 'btr', type: 'fnb' },
    { id: 'ekor', name: 'Ekor', symbol: 'ekr', type: 'fnb' },
    { id: 'potong', name: 'Potong', symbol: 'ptg', type: 'fnb' },
    { id: 'slice', name: 'Slice', symbol: 'slc', type: 'fnb' },
    { id: 'bungkus', name: 'Bungkus', symbol: 'bks', type: 'fnb' },
    { id: 'sendok', name: 'Sendok', symbol: 'sdk', type: 'fnb' },
    { id: 'takar', name: 'Takar', symbol: 'tkr', type: 'fnb' },

    // Medical
    { id: 'tablet', name: 'Tablet', symbol: 'tab', type: 'medical' },
    { id: 'kapsul', name: 'Kapsul', symbol: 'cap', type: 'medical' },
    { id: 'vial', name: 'Vial', symbol: 'vial', type: 'medical' },
    { id: 'ampul', name: 'Ampul', symbol: 'amp', type: 'medical' },
    { id: 'strip', name: 'Strip', symbol: 'strp', type: 'medical' },

    // Service
    { id: 'menit', name: 'Menit', symbol: 'min', type: 'service' },
    { id: 'jam', name: 'Jam', symbol: 'hr', type: 'service' },
    { id: 'hari', name: 'Hari', symbol: 'day', type: 'service' },
    { id: 'minggu', name: 'Minggu', symbol: 'week', type: 'service' },
    { id: 'bulan', name: 'Bulan', symbol: 'month', type: 'service' },
    { id: 'sesi', name: 'Sesi', symbol: 'sesi', type: 'service' },
    { id: 'paket', name: 'Paket Jasa', symbol: 'pkg', type: 'service' },
];

// Helper functions
export const getUnitById = (id: string): Unit | undefined =>
    UNITS.find(u => u.id === id);

export const getUnitsByType = (type: UnitType): Unit[] =>
    UNITS.filter(u => u.type === type);

export const getUnitDisplayName = (id: string): string => {
    const unit = getUnitById(id);
    return unit ? `${unit.name} (${unit.symbol})` : id;
};

export const getUnitSymbol = (id: string): string => {
    const unit = getUnitById(id);
    return unit?.symbol || id;
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
    count: 'Hitungan',
    weight: 'Berat',
    volume: 'Volume',
    length: 'Panjang',
    area: 'Luas',
    packaging: 'Kemasan',
    fnb: 'Makanan & Minuman',
    medical: 'Medis',
    service: 'Layanan',
};
