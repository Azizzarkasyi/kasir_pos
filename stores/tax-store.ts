import { settingsApi } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TaxStore {
  taxRate: number;
  isLoading: boolean;
  fetchTaxRate: () => Promise<void>;
  setTaxRate: (rate: number) => void;
}

const TAX_RATE_KEY = 'taxRate';

export const useTaxStore = create<TaxStore>()(
  persist(
    (set, get) => ({
      taxRate: 0,
      isLoading: false,

      fetchTaxRate: async () => {
        try {
          set({ isLoading: true });
          const response = await settingsApi.getStoreInfo();
          if (response.data?.tax !== undefined) {
            const taxRate = response.data.tax;
            set({ taxRate });
            console.log('[TaxStore] Tax rate loaded:', taxRate);
          }
        } catch (error) {
          console.error('[TaxStore] Failed to fetch tax rate:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setTaxRate: (rate: number) => {
        set({ taxRate: rate });
      },
    }),
    {
      name: 'tax-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ taxRate: state.taxRate }),
    }
  )
);

// Note: Tax rate should be fetched after user logs in, 
// not on app start to avoid 401 errors when not authenticated
