import CategoryItem from "@/components/atoms/category-item";
import CategoryModal from "@/components/drawers/category-modal";
import FilterProductModal from "@/components/drawers/filter-product-modal";
import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import categoryApi from "@/services/endpoints/categories";
import productApi from "@/services/endpoints/products";
import {useProductFormStore} from "@/stores/product-form-store";
import {Category, Product} from "@/types/api";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect, useRouter} from "expo-router";
import React, {useCallback, useEffect, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function ProductsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {reset} = useProductFormStore();

  const [activeTab, setActiveTab] = useState<"produk" | "kategori">("produk");
  const [search, setSearch] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // Reload products when screen gains focus (after add/edit)
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [search, selectedCategoryIds])
  );

  useEffect(() => {
    // Re-fetch products when search or filter changes
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategoryIds]);

  const loadProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedCategoryIds.length > 0) {
        params.category_id = selectedCategoryIds[0]; // API mungkin hanya terima 1 kategori
      }

      const response = await productApi.getProducts(params);
      if (response.data) {
        console.log(`📦 Loaded ${response.data.length} products`);
        setProducts(response.data);
      }
    } catch (error: any) {
      console.error("Failed to load products:", error);
      Alert.alert("Error", error.message || "Gagal memuat produk");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await categoryApi.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error: any) {
      console.error("Failed to load categories:", error);
      // Tidak perlu alert, karena kategori bukan fitur kritis
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const filteredProducts = products;

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

  const handleSubmitCategory = async (name: string) => {
    try {
      if (editingCategoryId) {
        // Update existing category
        await categoryApi.updateCategory(editingCategoryId, {name});
        Alert.alert("Sukses", "Kategori berhasil diperbarui");
      } else {
        // Create new category
        await categoryApi.createCategory({name});
        Alert.alert("Sukses", "Kategori berhasil ditambahkan");
      }
      await loadCategories();
      setIsCategoryModalVisible(false);
    } catch (error: any) {
      console.error("Failed to save category:", error);
      Alert.alert("Error", error.message || "Gagal menyimpan kategori");
    }
  };

  const handlePressProduct = (product: Product) => {
    router.push({
      pathname: "/dashboard/product/edit-product",
      params: {
        id: product.id,
      },
    } as never);
  };

  const goAdd = () => {
    if (activeTab === "kategori") {
      handleOpenAddCategory();
      return;
    }

    reset();
    router.push("/dashboard/product/add-product" as never);
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Kelola Produk" showHelp={false} />
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
        <View style={styles.contentWrapper}>
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
                      size={isTablet ? 26 : 20}
                      color={Colors[colorScheme].text}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{marginTop: 16}}>
                  {isLoadingProducts ? (
                    <View style={{paddingVertical: 40, alignItems: "center"}}>
                      <ActivityIndicator
                        size="large"
                        color={Colors[colorScheme].primary}
                      />
                    </View>
                  ) : filteredProducts.length === 0 ? (
                    <View style={{paddingVertical: 40, alignItems: "center"}}>
                      <ThemedText style={styles.emptyText}>
                        {search
                          ? "Tidak ada produk ditemukan"
                          : "Belum ada produk"}
                      </ThemedText>
                    </View>
                  ) : (
                    filteredProducts.map(product => {
                      // Ambil stock dari variant default
                      const defaultVariant = product.variants?.find(
                        (v: any) => v.is_default === true
                      );
                      const stockCount = defaultVariant?.stock ?? 0;

                      return (
                        <ProductCard
                          key={product.id}
                          initials={(product.name || "PR")
                            .slice(0, 2)
                            .toUpperCase()}
                          name={product.name}
                          variantCount={product.variants?.length ?? 0}
                          stockCount={stockCount}
                          photoUrl={product.photo_url}
                          onPress={() => handlePressProduct(product)}
                        />
                      );
                    })
                  )}
                </View>
              </View>
            ) : (
              <View style={{marginTop: 20}}>
                {isLoadingCategories ? (
                  <View style={{paddingVertical: 40, alignItems: "center"}}>
                    <ActivityIndicator
                      size="large"
                      color={Colors[colorScheme].primary}
                    />
                  </View>
                ) : categories.length === 0 ? (
                  <View style={{paddingVertical: 40, alignItems: "center"}}>
                    <ThemedText style={styles.emptyText}>
                      Belum ada kategori
                    </ThemedText>
                  </View>
                ) : (
                  categories.map(category => (
                    <CategoryItem
                      key={category.id}
                      title={category.name}
                      onEdit={() => handleEditCategory(category.id)}
                    />
                  ))
                )}
              </View>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      <TouchableOpacity
        style={[styles.fab, {bottom: insets.bottom + (isTablet ? 32 : 24)}]}
        onPress={goAdd}
      >
        <Ionicons
          name="add"
          size={isTablet ? 36 : 28}
          color={Colors[colorScheme].background}
        />
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
    tabsRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E0E0E0",
      backgroundColor: Colors[colorScheme].background,
      marginTop: isTablet ? 14 : 10,
    },
    tabItem: {
      flex: 1,
      paddingVertical: isTablet ? 18 : 14,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    activeTabLine: {
      position: "absolute",
      bottom: -1, // Supaya menutupi garis border abu-abu
      left: 0,
      right: 0,
      height: isTablet ? 4 : 3,
      backgroundColor: Colors[colorScheme].primary,
    },
    tabText: {
      fontSize: isTablet ? 20 : 14,
      fontWeight: "600",
    },

    // Container baru untuk isi halaman agar punya jarak kiri-kanan
    contentContainer: {
      paddingHorizontal: isTablet ? 28 : 20,
    },

    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 16 : 12,
      marginTop: isTablet ? 20 : 16,
    },
    emptyText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
      textAlign: "center",
    },
    filterButton: {
      width: isTablet ? 60 : 50,
      height: isTablet ? 60 : 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 10 : 8,
      alignItems: "center",
      justifyContent: "center",
    },

    fab: {
      position: "absolute",
      right: isTablet ? 32 : 24,
      width: isTablet ? 68 : 56,
      height: isTablet ? 68 : 56,
      borderRadius: isTablet ? 34 : 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].primary,
      elevation: 6,
    },
  });
