import { create } from "zustand";

interface StockInfo {
  offlineStock: number;
  unit: string;
  minStock: number;
  notifyMin: boolean;
}

interface VariantItem {
  name: string;
  price: number;
  stock?: {
    count: number;
    unit: string;
    minStock?: number;
    notifyMin?: boolean;
  };
}

interface ProductFormState {
  name: string;
  price: string;
  brand: string;
  category: string;
  favorite: boolean;
  enableCostBarcode: boolean;
  imageUri: string | null;
  capitalPrice: number;
  barcode: string;
  variants: VariantItem[];
  stock: StockInfo | null;

  setName: (value: string) => void;
  setPrice: (value: string) => void;
  setBrand: (value: string) => void;
  setCategory: (value: string) => void;
  setFavorite: (value: boolean) => void;
  setEnableCostBarcode: (value: boolean) => void;
  setImageUri: (value: string | null) => void;
  setCapitalPrice: (value: number) => void;
  setBarcode: (value: string) => void;
  setVariants: (updater: (prev: VariantItem[]) => VariantItem[]) => void;
  setStock: (value: StockInfo | null) => void;
  reset: () => void;
}

const initialState: Omit<ProductFormState,
  | "setName"
  | "setPrice"
  | "setBrand"
  | "setCategory"
  | "setFavorite"
  | "setEnableCostBarcode"
  | "setImageUri"
  | "setCapitalPrice"
  | "setBarcode"
  | "setVariants"
  | "setStock"
  | "reset"
> = {
  name: "",
  price: "",
  brand: "",
  category: "",
  favorite: false,
  enableCostBarcode: false,
  imageUri: null,
  capitalPrice: 0,
  barcode: "",
  variants: [],
  stock: null,
};

export const useProductFormStore = create<ProductFormState>(set => ({
  ...initialState,
  setName: value => set({ name: value }),
  setPrice: value => set({ price: value }),
  setBrand: value => set({ brand: value }),
  setCategory: value => set({ category: value }),
  setFavorite: value => set({ favorite: value }),
  setEnableCostBarcode: value => set({ enableCostBarcode: value }),
  setImageUri: value => set({ imageUri: value }),
  setCapitalPrice: value => set({ capitalPrice: value }),
  setBarcode: value => set({ barcode: value }),
  setVariants: updater => set(state => ({ variants: updater(state.variants) })),
  setStock: value => set({ stock: value }),
  reset: () => set(initialState),
}));
