import RecipeItem from "@/components/atoms/recipe-item";
import CategoryModal from "@/components/drawers/category-modal";
import Header from "@/components/header";
import ProductCard from "@/components/product-card";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import recipeApi, { Recipe } from "@/services/endpoints/recipes";
import { Product } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity, useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProductsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"bahan" | "resep">("bahan");
  const [search, setSearch] = useState("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [ingredients, setIngredients] = useState<Product[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load ingredients (products with is_ingredient=true)
  const loadIngredients = async () => {
    try {
      const response = await productApi.getProducts();
      if (response.data) {
        // Filter hanya produk yang is_ingredient = true
        const ingredientProducts = response.data.filter(
          (p: Product) => p.is_ingredient === true
        );
        setIngredients(ingredientProducts);
        console.log("✅ Loaded", ingredientProducts.length, "ingredients");
      }
    } catch (error: any) {
      console.error("❌ Failed to load ingredients:", error);
      Alert.alert("Error", "Gagal memuat data bahan");
    }
  };

  // Load recipes
  const loadRecipes = async () => {
    try {
      const response = await recipeApi.getRecipes();
      if (response.data) {
        setRecipes(response.data);
        console.log("✅ Loaded", response.data.length, "recipes");
      }
    } catch (error: any) {
      console.error("❌ Failed to load recipes:", error);
      Alert.alert("Error", "Gagal memuat data resep");
    }
  };

  // Load data on mount and on focus
  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([loadIngredients(), loadRecipes()]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const categories = [
    {id: "umum", name: "Umum"},
    {id: "makanan", name: "Makanan"},
    {id: "minuman", name: "Minuman"},
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
    console.log("Simpan kategori", {id: editingCategoryId, name});
    setIsCategoryModalVisible(false);
  };

  const goAdd = () => {
    if (activeTab === "resep") {
      router.push("/dashboard/recipe-and-materials/add-recipe" as never);
      return;
    }

    router.push("/dashboard/recipe-and-materials/add-material" as never);
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
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
        <View style={[styles.tabsRow, isTablet && {marginHorizontal: 60}]}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab("bahan")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "bahan"
                  ? {color: Colors[colorScheme].primary}
                  : {color: Colors[colorScheme].icon},
                isTablet && {fontSize: 18},
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
                  ? {color: Colors[colorScheme].primary}
                  : {color: Colors[colorScheme].icon},
                isTablet && {fontSize: 18},
              ]}
            >
              Resep
            </ThemedText>
            {activeTab === "resep" && <View style={styles.activeTabLine} />}
          </TouchableOpacity>
        </View>

        {/* --- 2. CONTENT SECTION (Dengan Padding) --- */}
        <View style={styles.contentContainer}>
          <View style={styles.contentWrapper}>
          {activeTab === "bahan" ? (
            <View>
              <View style={styles.searchRow}>
                {/* PENTING: Gunakan View Wrapper dengan flex: 1 untuk Input 
                   Ini akan memaksa input mengisi sisa ruang kosong secara otomatis
                */}
                <View style={{flex: 1}}>
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
                    size={isTablet ? 28 : 20}
                    color={Colors[colorScheme].text}
                  />
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={Colors[colorScheme].primary}
                  />
                  <ThemedText style={styles.loadingText}>
                    Memuat data bahan...
                  </ThemedText>
                </View>
              ) : (
                <View style={{marginTop: 16}}>
                  {ingredients.filter(p =>
                    p.name.toLowerCase().includes(search.toLowerCase())
                  ).length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <ThemedText style={styles.emptyText}>
                        {search ? "Bahan tidak ditemukan" : "Belum ada bahan"}
                      </ThemedText>
                    </View>
                  ) : (
                    ingredients
                      .filter(p =>
                        p.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map(product => {
                        const totalStock =
                          product.variants?.reduce(
                            (sum, v) => sum + (v.stock || 0),
                            0
                          ) || 0;
                        return (
                          <ProductCard
                            key={product.id}
                            initials={(product.name || "PR")
                              .slice(0, 2)
                              .toUpperCase()}
                            name={product.name}
                            stockCount={totalStock}
                            variantCount={product.variants?.length ?? 0}
                            onPress={() => {
                              router.push({
                                pathname:
                                  "/dashboard/recipe-and-materials/edit-material",
                                params: {id: product.id},
                              } as never);
                            }}
                          />
                        );
                      })
                  )}
                </View>
              )}
            </View>
          ) : (
            <View>
              <View>
                <View style={styles.searchRow}>
                  {/* PENTING: Gunakan View Wrapper dengan flex: 1 untuk Input 
                   Ini akan memaksa input mengisi sisa ruang kosong secara otomatis
                */}
                  <View style={{flex: 1}}>
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
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={Colors[colorScheme].primary}
                  />
                  <ThemedText style={styles.loadingText}>
                    Memuat data resep...
                  </ThemedText>
                </View>
              ) : (
                <View style={{marginTop: 16}}>
                  {recipes.filter(r =>
                    r.name.toLowerCase().includes(search.toLowerCase())
                  ).length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <ThemedText style={styles.emptyText}>
                        {search ? "Resep tidak ditemukan" : "Belum ada resep"}
                      </ThemedText>
                    </View>
                  ) : (
                    recipes
                      .filter(r =>
                        r.name.toLowerCase().includes(search.toLowerCase())
                      )
                      .map(recipe => (
                        <RecipeItem
                          key={recipe.id}
                          initials={(recipe.name || "RC")
                            .slice(0, 2)
                            .toUpperCase()}
                          name={recipe.name}
                          subtitle={`${recipe.items?.length || 0} bahan`}
                          onPress={() =>
                            router.push({
                              pathname:
                                "/dashboard/recipe-and-materials/edit-recipe",
                              params: {id: recipe.id},
                            } as never)
                          }
                        />
                      ))
                  )}
                </View>
              )}
            </View>
          )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      <TouchableOpacity
        style={[styles.fab, {bottom: insets.bottom + 24}]}
        onPress={goAdd}
      >
        <Ionicons name="add" size={isTablet ? 36 : 28} color={Colors[colorScheme].background} />
      </TouchableOpacity>

      <CategoryModal
        visible={isCategoryModalVisible}
        initialName={editingCategoryName}
        onClose={() => setIsCategoryModalVisible(false)}
        onSubmit={handleSubmitCategory}
      />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    tabsRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#E0E0E0",
      backgroundColor: Colors[colorScheme].background,
      marginTop: isTablet ? 16 : 10,
    },
    tabItem: {
      flex: 1,
      paddingVertical: isTablet ? 16 : 12,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    activeTabLine: {
      position: "absolute",
      bottom: -1,
      left: 0,
      right: 0,
      height: isTablet ? 4 : 3,
      backgroundColor: Colors[colorScheme].primary,
    },
    tabText: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "600",
    },

    contentContainer: {
      paddingHorizontal: isTablet ? 80 : 20,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },

    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 16 : 12,
      marginTop: isTablet ? 24 : 16,
    },
    filterButton: {
      width: isTablet ? 60 : 50,
      height: isTablet ? 60 : 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 12 : 8,
      alignItems: "center",
      justifyContent: "center",
    },

    fab: {
      position: "absolute",
      right: isTablet ? 40 : 24,
      width: isTablet ? 72 : 56,
      height: isTablet ? 72 : 56,
      borderRadius: isTablet ? 36 : 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].primary,
      elevation: 6,
    },
    loadingContainer: {
      paddingTop: 60,
      alignItems: "center",
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
