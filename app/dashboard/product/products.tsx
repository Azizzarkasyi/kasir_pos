import CategoryItem from "@/components/atoms/category-item";
import CategoryModal from "@/components/drawers/category-modal";
import FilterProductModal from "@/components/drawers/filter-product-modal";
import ProductCard from "@/components/product-card";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProductsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"produk" | "kategori">("produk");
  const [search, setSearch] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [products] = useState(
    [
      {
        id: "1",
        name: "Aqua gelas",
        price: "2000",
        brand: "Qasir",
        category: "minuman",
        stock: 10,
        variants: [],
        favorite: true,
        enableCostBarcode: true,
        imageUri: null as string | null,
        capitalPrice: 1000,
        barcode: "1234567890",
      },
      {
        id: "2",
        name: "Nasi Goreng asdfasdsdfads asdfdasf",
        price: "15000",
        brand: "",
        category: "makanan",
        stock: 10,
        variants: [
          {
            id: "1",
            name: "Large",
            price: "15000",
            brand: "",
            category: "makanan",
            favorite: false,
            enableCostBarcode: false,
            imageUri: null as string | null,
            capitalPrice: 0,
            barcode: "",
          },
        ],
        favorite: false,
        enableCostBarcode: false,
        imageUri: null as string | null,
        capitalPrice: 0,
        barcode: "",
      },
    ],
  );

  const categories = [
    {id: "umum", name: "Umum"},
    {id: "makanan", name: "Makanan"},
    {id: "minuman", name: "Minuman"},
  ];

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchCategory =
      selectedCategoryIds.length === 0 ||
      selectedCategoryIds.includes(product.category);
    return matchSearch && matchCategory;
  });

  const handleEditCategory = (categoryId: string) => {
    const found = categories.find(c => c.id === categoryId);
    setEditingCategoryId(categoryId);
    setEditingCategoryName(found?.name ?? "");
    setIsCategoryModalVisible(true);
  };

  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setIsCategoryModalVisible(true);
  };

  const handleSubmitCategory = (name: string) => {
    // TODO: Integrasikan dengan API / state nyata
    console.log("Simpan kategori", {id: editingCategoryId, name});
    setIsCategoryModalVisible(false);
  };

  const handlePressProduct = (product: {
    id: string;
    name: string;
    price: string;
    brand: string;
    category: string;
    favorite: boolean;
    enableCostBarcode: boolean;
    imageUri: string | null;
    capitalPrice: number;
    barcode: string;
    variants?: {
      id: string;
      name: string;
      price: string;
      brand: string;
      category: string;
      favorite: boolean;
      enableCostBarcode: boolean;
      imageUri: string | null;
      capitalPrice: number;
      barcode: string;
    }[];
  }) => {
    router.push({
      pathname: "/dashboard/product/edit-product",
      params: {
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        category: product.category,
        favorite: String(product.favorite),
        enableCostBarcode: String(product.enableCostBarcode),
        imageUri: product.imageUri ?? "",
        capitalPrice: String(product.capitalPrice),
        barcode: product.barcode,
      },
    } as never);
  };

  const goAdd = () => {
    if (activeTab === "kategori") {
      handleOpenAddCategory();
      return;
    }

    router.push("/dashboard/product/add-product" as never);
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          // PENTING: Jangan ada paddingHorizontal di sini agar Tab bisa full width
          paddingTop: 0,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- 1. TAB SECTION (Full Width) --- */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("produk")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "produk"
                  ? {color: Colors[colorScheme].primary}
                  : {color: Colors[colorScheme].icon},
              ]}
            >
              Produk
            </ThemedText>
            {activeTab === "produk" && <View style={styles.activeTabLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("kategori")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "kategori"
                  ? {color: Colors[colorScheme].primary}
                  : {color: Colors[colorScheme].icon},
              ]}
            >
              Kategori
            </ThemedText>
            {activeTab === "kategori" && <View style={styles.activeTabLine} />}
          </TouchableOpacity>
        </View>

        {/* --- 2. CONTENT SECTION (Dengan Padding) --- */}
        <View style={styles.contentContainer}>
          {activeTab === "produk" ? (
            <View>
              <View style={styles.searchRow}>
                {/* PENTING: Gunakan View Wrapper dengan flex: 1 untuk Input 
                   Ini akan memaksa input mengisi sisa ruang kosong secara otomatis
                */}
                <View style={{flex: 1}}>
                  <ThemedInput
                    label="Cari Produk"
                    value={search}
                    onChangeText={setSearch}
                    size="sm"
                    leftIconName="search"
                    width="100%" // Input mengisi wrapper flex:1 tadi
                    showLabel={false}
                    placeholder="Cari Produk"
                  />
                </View>

                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setIsFilterModalVisible(true)}
                >
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={Colors[colorScheme].text}
                  />
                </TouchableOpacity>
              </View>

              <View style={{marginTop: 16}}>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    initials={(product.name || "PR").slice(0, 2).toUpperCase()}
                    name={product.name}
                    variantCount={product.variants?.length ?? 0}
                    stockCount={product.stock ?? 0}
                    onPress={() => handlePressProduct(product)}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={{marginTop: 20}}>
              {categories.map(category => (
                <CategoryItem
                  key={category.id}
                  title={category.name}
                  onEdit={() => handleEditCategory(category.id)}
                />
              ))}
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      <TouchableOpacity
        style={[styles.fab, {bottom: insets.bottom + 24}]}
        onPress={goAdd}
      >
        <Ionicons name="add" size={28} color={Colors[colorScheme].background} />
      </TouchableOpacity>

      <CategoryModal
        visible={isCategoryModalVisible}
        initialName={editingCategoryName}
        onClose={() => setIsCategoryModalVisible(false)}
        onSubmit={handleSubmitCategory}
      />

      <FilterProductModal
        visible={isFilterModalVisible}
        categories={categories}
        initialSelectedIds={selectedCategoryIds}
        onClose={() => setIsFilterModalVisible(false)}
        onApply={(ids: string[]) => {
          setSelectedCategoryIds(ids);
          setIsFilterModalVisible(false);
        }}
        onReset={() => {
          setSelectedCategoryIds([]);
        }}
      />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    tabsRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E0E0E0",
      backgroundColor: Colors[colorScheme].background,
      marginTop: 10,
    },
    tabItem: {
      flex: 1,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    activeTabLine: {
      position: "absolute",
      bottom: -1, // Supaya menutupi garis border abu-abu
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: Colors[colorScheme].primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
    },

    // Container baru untuk isi halaman agar punya jarak kiri-kanan
    contentContainer: {
      paddingHorizontal: 20,
    },

    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 16,
    },
    filterButton: {
      width: 50,
      height: 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },

    fab: {
      position: "absolute",
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].primary,
      elevation: 6,
    },
  });
