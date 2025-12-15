import { create } from "zustand";

interface VariantBarcodeState {
  barcode: string;
  setBarcode: (value: string) => void;
  reset: () => void;
}

const initialState: Omit<VariantBarcodeState, "setBarcode" | "reset"> = {
  barcode: "",
};

export const useVariantBarcodeStore = create<VariantBarcodeState>(set => ({
  ...initialState,
  setBarcode: value => set({ barcode: value }),
  reset: () => set(initialState),
}));
