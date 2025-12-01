import StockProductItem from "@/components/atoms/stock-product-item";
import EditStockModal from "@/components/drawers/edit-stock-modal";
import Header from "@/components/header";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import {Product, ProductVariant} from "@/types/api";
import {AntDesign} from "@expo/vector-icons";
import {useFocusEffect} from "expo-router";
import React, {useCallback, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

type StockItem = {
  id: string;
  variantId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unit?: string;
};

export default function ManageStockScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Load products and build stock items
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.getProducts();

      if (response.data) {
        setProducts(response.data);

        // Build stock items from products and variants
        const items: StockItem[] = [];
        response.data.forEach((product: Product) => {
          if (product.variants && product.variants.length > 0) {
            product.variants.forEach((variant: ProductVariant) => {
              items.push({
                id: `${product.id}-${variant.id}`,
                variantId: variant.id,
                productName: product.name,
                variantName:
                  variant.name !== "Regular" ? variant.name : undefined,
                quantity: variant.stock || 0,
                unit: undefined, // Unit will be loaded from unit_id if needed
              });
            });
          }
        });
        setStockItems(items);
        console.log(
          "✅ Loaded",
          items.length,
          "stock items from",
          response.data.length,
          "products"
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
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Kelola Stok" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 40,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchRow}>
          <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
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

          <TouchableOpacity style={styles.scanButton} onPress={() => {}}>
            <AntDesign name="scan" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
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
                  onPress={() => {
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
        onClose={() => {
          if (!isUpdatingStock) {
            setEditingItem(null);
          }
        }}
        onSubmit={async ({quantity, mode}) => {
          if (!editingItem) return;

          try {
            setIsUpdatingStock(true);

            // Map modal mode to backend action_type
            const actionTypeMap: Record<
              string,
              "adjust_stock" | "add_stock" | "remove_stock"
            > = {
              adjust: "adjust_stock",
              increase: "add_stock",
              decrease: "remove_stock",
            };

            const action_type = actionTypeMap[mode] || "adjust_stock";

            console.log("📦 Updating stock:", {
              variantId: editingItem.variantId,
              action_type,
              amount: quantity,
              product: editingItem.productName,
              variant: editingItem.variantName,
            });

            await productApi.updateStock(editingItem.variantId, {
              action_type,
              amount: quantity,
            });

            console.log("✅ Stock updated successfully");
            Alert.alert("Sukses", "Stok berhasil diperbarui");
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
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      marginTop: 8,
      gap: 12,
    },
    scanButton: {
      borderRadius: 8,
      borderWidth: 1,
      width: 50,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      borderColor: Colors[colorScheme].border,
    },
    listContainer: {
      marginTop: 12,
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
    },
    emptyContainer: {
      paddingTop: 60,
      paddingHorizontal: 40,
      alignItems: "center",
    },
    emptyText: {
      color: Colors[colorScheme].icon,
      textAlign: "center",
    },
  });
