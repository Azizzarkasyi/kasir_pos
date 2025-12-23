import { create } from "zustand";
import { useTaxStore } from './tax-store';

export type CartItem = {
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  note?: string;
};

export type AdditionalFee = {
  id: string;
  name: string;
  amount: number;
};

type CartStore = {
  items: CartItem[];
  additionalFees: AdditionalFee[];
  discount: number;
  customerName: string;
  note: string;

  // Actions
  addItem: (item: CartItem) => void;
  updateItemQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number
  ) => void;
  updateItemNote: (
    productId: string,
    variantId: string | null,
    note: string
  ) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clearCart: () => void;

  addFee: (fee: AdditionalFee) => void;
  removeFee: (id: string) => void;

  setDiscount: (discount: number) => void;
  setCustomerName: (name: string) => void;
  setNote: (note: string) => void;

  // Computed
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalFees: () => number;
  getTotalAmount: () => number;
  getTotalWithTax: () => number;
  getTaxAmount: () => number;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  additionalFees: [],
  discount: 0,
  customerName: "",
  note: "",

  addItem: item => {
    set(state => {
      const existingIndex = state.items.findIndex(
        i => i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + item.quantity,
          note: item.note || updated[existingIndex].note,
        };
        return {items: updated};
      }

      return {items: [...state.items, item]};
    });
  },

  updateItemQuantity: (productId, variantId, quantity) => {
    set(state => {
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            i => !(i.productId === productId && i.variantId === variantId)
          ),
        };
      }

      return {
        items: state.items.map(i =>
          i.productId === productId && i.variantId === variantId
            ? {...i, quantity}
            : i
        ),
      };
    });
  },

  updateItemNote: (productId, variantId, note) => {
    set(state => ({
      items: state.items.map(i =>
        i.productId === productId && i.variantId === variantId
          ? {...i, note}
          : i
      ),
    }));
  },

  removeItem: (productId, variantId) => {
    set(state => ({
      items: state.items.filter(
        i => !(i.productId === productId && i.variantId === variantId)
      ),
    }));
  },

  clearCart: () => {
    set({
      items: [],
      additionalFees: [],
      discount: 0,
      customerName: "",
      note: "",
    });
  },

  addFee: fee => {
    set(state => ({
      additionalFees: [...state.additionalFees, fee],
    }));
  },

  removeFee: id => {
    set(state => ({
      additionalFees: state.additionalFees.filter(f => f.id !== id),
    }));
  },

  setDiscount: discount => set({discount}),
  setCustomerName: customerName => set({customerName}),
  setNote: note => set({note}),

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  },

  getTotalFees: () => {
    return get().additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal();
    const fees = get().getTotalFees();
    const discount = get().discount;
    return subtotal + fees - discount;
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    const taxRate = useTaxStore.getState().taxRate;
    // Tax is calculated on subtotal after discount (matching backend logic)
    return Math.round(((subtotal - discount) * taxRate) / 100);
  },

  getTotalWithTax: () => {
    const totalAmount = get().getTotalAmount();
    const taxAmount = get().getTaxAmount();
    console.log("total ammount", totalAmount)
    console.log("total tax", taxAmount)
    return totalAmount + taxAmount;
  },
}));
