
import StockProductItem from "@/components/atoms/stock-product-item";
import EditStockModal from "@/components/drawers/edit-stock-modal";
import Header from "@/components/header";
import { ThemedInput } from "@/components/themed-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DUMMY_STOCK_ITEMS = [
  { id: "1", name: "Aqua gelas", variant: "sedang", quantity: 16 },
];

export default function ManageStockScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<
    | null
    | { id: string; name: string; variant?: string; quantity: number }
  >(null);

  const filteredItems = DUMMY_STOCK_ITEMS.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
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

          <TouchableOpacity style={styles.scanButton} onPress={() => {
            
          }}>
            <AntDesign
              name="scan"
              size={24}
              color={Colors[colorScheme].text}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {filteredItems.map(item => (
            <StockProductItem
              key={item.id}
              name={item.name}
              variant={item.variant}
              quantity={item.quantity}
              onPress={() => {
                setEditingItem({
                  id: item.id,
                  name: item.name,
                  variant: item.variant,
                  quantity: item.quantity,
                });
              }}
            />
          ))}
        </View>
      </KeyboardAwareScrollView>

      <EditStockModal
        visible={!!editingItem}
        productLabel={
          editingItem
            ? editingItem.variant
              ? `${editingItem.name} - ${editingItem.variant}`
              : editingItem.name
            : ""
        }
        initialQuantity={editingItem?.quantity ?? 0}
        onClose={() => setEditingItem(null)}
        onSubmit={({ quantity, mode }) => {
          console.log("Update stok", { item: editingItem, quantity, mode });
          setEditingItem(null);
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
  });

