import { create } from "zustand";

interface StockInfo {
  offlineStock: number;
  unit: string;
  minStock: number;
  notifyMin: boolean;
}

interface VariantItem {
  id?: string;
  name: string;
  price: number;
  stock?: number;
  unit_id?: string;
  notify_on_stock_ronouts?: boolean;
  is_stock_active?: boolean;
  min_stock?: number;
  recipe_id?: string;
  barcode?: string;
  capital_price?: number;
}

interface ProductFormState {
  name: string;
  price: string;
  brand: string;
  category: string;
  recipe: string;
  favorite: boolean;
  enableCostBarcode: boolean;
  imageUri: string | null;
  capitalPrice: number;
  barcode: string;
  variants: VariantItem[];
  stock: StockInfo | null;
  pendingVariant: VariantItem | null;

  setName: (value: string) => void;
  setPrice: (value: string) => void;
  setBrand: (value: string) => void;
  setCategory: (value: string) => void;
  setRecipe: (value: string) => void;
  setFavorite: (value: boolean) => void;
  setEnableCostBarcode: (value: boolean) => void;
  setImageUri: (value: string | null) => void;
  setCapitalPrice: (value: number) => void;
  setBarcode: (value: string) => void;
  setVariants: (
    variants: VariantItem[] | ((prev: VariantItem[]) => VariantItem[])
  ) => void;
  setStock: (value: StockInfo | null) => void;
  setPendingVariant: (value: VariantItem | null) => void;
  reset: () => void;
}

const initialState: Omit<
  ProductFormState,
  | "setName"
  | "setPrice"
  | "setBrand"
  | "setCategory"
  | "setRecipe"
  | "setFavorite"
  | "setEnableCostBarcode"
  | "setImageUri"
  | "setCapitalPrice"
  | "setBarcode"
  | "setVariants"
  | "setStock"
  | "setPendingVariant"
  | "reset"
> = {
  name: "",
  price: "",
  brand: "",
  category: "",
  recipe: "",
  favorite: false,
  enableCostBarcode: false,
  imageUri: null,
  capitalPrice: 0,
  barcode: "",
  variants: [],
  stock: null,
  pendingVariant: null,
};

export const useProductFormStore = create<ProductFormState>(set => ({
  ...initialState,
  setName: value => set({name: value}),
  setPrice: value => set({price: value}),
  setBrand: value => set({brand: value}),
  setCategory: value => set({category: value}),
  setRecipe: value => set({recipe: value}),
  setFavorite: value => set({favorite: value}),
  setEnableCostBarcode: value => set({enableCostBarcode: value}),
  setImageUri: value => set({imageUri: value}),
  setCapitalPrice: value => set({capitalPrice: value}),
  setBarcode: value => set({barcode: value}),
  setVariants: variants =>
    set(state => ({
      variants:
        typeof variants === "function" ? variants(state.variants) : variants,
    })),
  setStock: value => set({stock: value}),
  setPendingVariant: value => set({pendingVariant: value}),
  reset: () => set(initialState),
}));
