import ConfirmPopup from "@/components/atoms/confirm-popup";
import StockProductItem from "@/components/atoms/stock-product-item";
import EditStockModal from "@/components/drawers/edit-stock-modal";
import Header from "@/components/header";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { UNITS } from "@/constants/units";
import { useColorScheme } from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import { Product } from "@/types/api";
import { AntDesign } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type StockItem = {
  id: string;
  variantId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unit?: string;
  isDisabled?: boolean;
};

export default function ManageStockScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Load products and build stock items
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.getProductStock({
        search,
      });
      console.log(JSON.stringify(response.data))

      if (response.data) {
        setProducts(response.data);

        // Build stock items from variants (response is already an array of variants)
        const items: StockItem[] = [];
        response.data.forEach((variant: any) => {
          items.push({
            id: `${variant.product_id}-${variant.id}`,
            variantId: variant.id,
            productName: variant.product?.name || 'Unknown Product',
            variantName: variant.name,
            quantity: variant.stock || 0,
            unit: variant.unit_id || undefined,
            isDisabled: variant.product?.is_disabled || variant.is_disabled || false,
          });
        });
        setStockItems(items);
        console.log(
          "✅ Loaded",
          items.length,
          "stock items from",
          response.data.length,
          "variants"
        );
      }
    } catch (error: any) {
      console.error("❌ Failed to load products:", error);
      Alert.alert("Error", "Gagal memuat data stok");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const filteredItems = stockItems.filter(
    item =>
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      (item.variantName &&
        item.variantName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header title="Kelola Stok" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: isTablet ? 16 : 8,
          paddingBottom: insets.bottom + (isTablet ? 60 : 40),
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.searchRow}>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <ThemedInput
                label="Cari Produk"
                value={search}
                onChangeText={setSearch}
                leftIconName="search"
                showLabel={false}
                size="md"
                placeholder="Cari Produk"
                width="100%"
              />
            </View>

            <TouchableOpacity style={styles.scanButton} onPress={() => { }}>
              <AntDesign
                name="scan"
                size={isTablet ? 32 : 24}
                color={Colors[colorScheme].text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme].primary}
            />
            <ThemedText style={styles.loadingText}>
              Memuat data stok...
            </ThemedText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {search ? "Produk tidak ditemukan" : "Belum ada produk"}
                </ThemedText>
              </View>
            ) : (
              filteredItems.map(item => (
                <StockProductItem
                  key={item.id}
                  name={item.productName}
                  variant={item.variantName}
                  quantity={item.quantity}
                  unit={item.unit ? UNITS.find(u => u.id === item.unit)?.symbol : undefined}
                  isDisabled={item.isDisabled}
                  isTablet={isTablet}
                  onPress={() => {
                    if (item.isDisabled) return;
                    setEditingItem(item);
                  }}
                />
              ))
            )}
          </View>
        )}
      </KeyboardAwareScrollView>

      <EditStockModal
        visible={!!editingItem}
        productLabel={
          editingItem
            ? editingItem.variantName
              ? `${editingItem.productName} - ${editingItem.variantName}`
              : editingItem.productName
            : ""
        }
        initialQuantity={editingItem?.quantity ?? 0}
        variantUnitId={editingItem?.unit || undefined}
        onClose={() => {
          if (!isUpdatingStock) {
            setEditingItem(null);
          }
        }}
        onSubmit={async ({ quantity, mode, note, unitId }) => {
          if (!editingItem) return;

          try {
            setIsUpdatingStock(true);

            console.log("📦 Updating stock:", {
              mode,
              variantId: editingItem.variantId,
              amount: quantity,
              unitId,
              product: editingItem.productName,
              variant: editingItem.variantName,
            });

            await productApi.updateStock(editingItem.variantId, {
              action_type: mode,
              amount: quantity,
              note,
              unit_id: unitId,
            });

            console.log("✅ Stock updated successfully");
            setShowSuccessPopup(true);
            setEditingItem(null);

            // Reload products to get updated stock
            loadProducts();
          } catch (error: any) {
            console.error("❌ Failed to update stock:", error);
            Alert.alert("Error", error.message || "Gagal memperbarui stok");
          } finally {
            setIsUpdatingStock(false);
          }
        }}
      />

      <ConfirmPopup
        visible={showSuccessPopup}
        successOnly
        title="Berhasil"
        message="Stok berhasil diperbarui"
        onConfirm={() => setShowSuccessPopup(false)}
        onCancel={() => setShowSuccessPopup(false)}
      />
    </View>
  );
}

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean
) =>
  StyleSheet.create({
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isTablet ? 60 : 20,
      marginTop: isTablet ? 16 : 8,
      gap: isTablet ? 16 : 12,
    },
    scanButton: {
      borderRadius: isTablet ? 12 : 8,
      borderWidth: 1,
      width: isTablet ? 60 : 50,
      height: isTablet ? 60 : 50,
      alignItems: "center",
      justifyContent: "center",
      borderColor: Colors[colorScheme].border,
    },
    listContainer: {
      marginTop: 12,
      paddingHorizontal: isTablet ? 60 : 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
    },
    loadingText: {
      marginTop: 16,
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
    },
    emptyContainer: {
      paddingTop: 60,
      paddingHorizontal: 40,
      alignItems: "center",
    },
    emptyText: {
      color: Colors[colorScheme].icon,
      textAlign: "center",
      fontSize: isTablet ? 18 : 14,
    },
  });
