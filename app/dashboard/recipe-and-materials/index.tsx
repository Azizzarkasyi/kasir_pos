import RecipeItem from "@/components/atoms/recipe-item";
import CategoryModal from "@/components/drawers/category-modal";
import Header from "@/components/header";
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

  const [activeTab, setActiveTab] = useState<"bahan" | "resep">("bahan");
  const [search, setSearch] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [ingredients] = useState(
    [
      {
        id: "1",
        name: "Daging Sapi",
        price: "80000",           // harga per kg misalnya
        brand: "",
        category: "Bahan Protein",
        favorite: true,
        enableCostBarcode: false,
        imageUri: null as string | null,
        stock: 10,
        capitalPrice: 0,
        variants: [],
        barcode: "",
      },
      {
        id: "2",
        name: "Tepung Terigu",
        price: "12000",           // harga per kg
        brand: "",  
        category: "Bahan Kering",
        favorite: false,
        enableCostBarcode: false,
        imageUri: null as string | null,
        stock: 10,
        capitalPrice: 0,
        variants: [],
        barcode: "",
      },
      {
        id: "3",
        name: "Gula Pasir",
        price: "15000",           // harga per kg
        brand: "",
        category: "Bahan Manis",
        favorite: false,
        enableCostBarcode: false,
        imageUri: null as string | null,
        stock: 10,
        capitalPrice: 0,
        variants: [],
        barcode: "",
      },
    ],
  );

  const [recipes] = useState(
    [
      {
        id: "r1",
        name: "Nasi Goreng Spesial",
        ingredientCount: 3,
        cost: 10000,
      },
      {
        id: "r2",
        name: "Es Teh Manis",
        ingredientCount: 2,
        cost: 3000,
      },
    ],
  );

  const categories = [
    { id: "umum", name: "Umum" },
    { id: "makanan", name: "Makanan" },
    { id: "minuman", name: "Minuman" },
  ];

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
    console.log("Simpan kategori", { id: editingCategoryId, name });
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
  }) => {
    router.push({
      pathname: "/dashboard/recipe-and-materials/edit-material",
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
    if (activeTab === "resep") {
      router.push("/dashboard/recipe-and-materials/add-recipe" as never);
      return;
    }

    router.push("/dashboard/recipe-and-materials/add-material" as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header
        showHelp={false}
        title="Resep & Bahan"
        withNotificationButton={false}
      />
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
            onPress={() => setActiveTab("bahan")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "bahan"
                  ? { color: Colors[colorScheme].primary }
                  : { color: Colors[colorScheme].icon },
              ]}
            >
              Bahan
            </ThemedText>
            {activeTab === "bahan" && <View style={styles.activeTabLine} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("resep")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "resep"
                  ? { color: Colors[colorScheme].primary }
                  : { color: Colors[colorScheme].icon },
              ]}
            >
              Resep
            </ThemedText>
            {activeTab === "resep" && <View style={styles.activeTabLine} />}
          </TouchableOpacity>
        </View>

        {/* --- 2. CONTENT SECTION (Dengan Padding) --- */}
        <View style={styles.contentContainer}>
          {activeTab === "bahan" ? (
            <View>
              <View style={styles.searchRow}>
                {/* PENTING: Gunakan View Wrapper dengan flex: 1 untuk Input 
                   Ini akan memaksa input mengisi sisa ruang kosong secara otomatis
                */}
                <View style={{ flex: 1 }}>
                  <ThemedInput
                    label="Cari Bahan"
                    value={search}
                    onChangeText={setSearch}
                    leftIconName="search"
                    size="md"
                    width="100%" // Input mengisi wrapper flex:1 tadi
                    showLabel={false}
                    placeholder="Cari Bahan"
                  />
                </View>

                <TouchableOpacity style={styles.filterButton}>
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={Colors[colorScheme].text}
                  />
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 16 }}>
                {ingredients.map(product => (
                  <ProductCard
                    key={product.id}
                    initials={(product.name || "PR").slice(0, 2).toUpperCase()}
                    name={product.name}
                    stockCount={product.stock}
                    variantCount={product.variants?.length ?? 0}
                    onPress={() => handlePressProduct(product)}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View>
              <View>
                <View style={styles.searchRow}>
                  {/* PENTING: Gunakan View Wrapper dengan flex: 1 untuk Input 
                   Ini akan memaksa input mengisi sisa ruang kosong secara otomatis
                */}
                  <View style={{ flex: 1 }}>
                    <ThemedInput
                      label="Cari Resep"
                      value={search}
                      onChangeText={setSearch}
                      leftIconName="search"
                      size="md"
                      width="100%" // Input mengisi wrapper flex:1 tadi
                      showLabel={false}
                      placeholder="Cari Resep"
                    />
                  </View>

                </View>
              </View>
              <View style={{ marginTop: 16 }}>
                {recipes.map(recipe => (
                  <RecipeItem
                    key={recipe.id}
                    initials={(recipe.name || "RC").slice(0, 2).toUpperCase()}
                    name={recipe.name}
                    subtitle={`${recipe.ingredientCount} bahan `}
                    onPress={() =>
                      router.push(
                        "/dashboard/recipe-and-materials/edit-recipe" as never,
                      )
                    }
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView >

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
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
    </View >
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
      flex: 1, // Membagi lebar 50:50
      paddingVertical: 12,
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
      alignItems: "center", // Memastikan Input dan Tombol sejajar vertikal
      gap: 12,
      marginTop: 16,
    },
    filterButton: {
      width: 50, // Sesuaikan lebar tombol
      height: 50, // Sesuaikan tinggi agar sama dengan Input Anda (biasanya input sekitar 48-50)
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
