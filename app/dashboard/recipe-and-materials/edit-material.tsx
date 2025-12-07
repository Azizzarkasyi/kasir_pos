import VariantItem from "@/components/atoms/variant-item";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import ConfirmPopup from "@/components/atoms/confirm-popup";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import CategoryPicker from "@/components/mollecules/category-picker";
import MerkPicker from "@/components/mollecules/merk-picker";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {recipeApi} from "@/services";
import merkApi from "@/services/endpoints/merks";
import productApi from "@/services/endpoints/products";
import assetApi, {prepareFileFromUri} from "@/services/endpoints/assets";
import {useProductFormStore} from "@/stores/product-form-store";
import {Merk, Product} from "@/types/api";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function EditProductScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const {
    name,
    price,
    brand,
    category,
    recipe,
    favorite,
    enableCostBarcode,
    imageUri,
    capitalPrice,
    barcode,
    variants,
    stock,
    setName,
    setPrice,
    setBrand,
    setCategory,
    setRecipe,
    setFavorite,
    setEnableCostBarcode,
    setImageUri,
    setCapitalPrice,
    setBarcode,
    setVariants,
    setStock,
    reset,
  } = useProductFormStore(state => state);

  const params = useLocalSearchParams<{
    id?: string;
  }>();

  const [merks, setMerks] = useState<Merk[]>([]);
  const [recipes, setRecipes] = useState<{id: string; name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [productData, setProductData] = useState<Product | null>(null);
  const [defaultVariantId, setDefaultVariantId] = useState<string | null>(null);

  React.useEffect(() => {
    // Only load product data once on mount
    if (!productData) {
      loadProduct();
    }
    loadMerks();
    loadRecipes();

    return () => {
      // Reset form saat keluar dari halaman edit produk
      reset();
    };
  }, []);

  const loadProduct = async () => {
    if (!params.id) {
      Alert.alert("Error", "ID produk tidak ditemukan");
      router.back();
      return;
    }

    try {
      setIsLoading(true);
      const response = await productApi.getProduct(params.id);

      if (response.data) {
        const product = response.data;
        setProductData(product);

        // Populate form dari product
        setName(product.name);
        setBrand(product.merk_id || "");
        setCategory(product.category_id || "");
        setFavorite(product.is_favorite || false);
        setImageUri(product.photo_url || null);

        console.log("Product data:", product.variants);

        // Load variants (kecuali yang default) - simpan ID untuk update
        if (product.variants && product.variants.length > 0) {
          const mappedVariants = product.variants.map((v: any) => ({
            id: v.id,
            name: v.name,
            price: v.price,
            stock: v.stock,
            unit_id: v.unit_id || undefined,
            notify_on_stock_ronouts: v.notify_on_stock_ronouts || false,
            is_stock_active: v.is_stock_active || false,
            min_stock: v.min_stock || undefined,
            barcode: v.barcode || undefined,
            capital_price: v.capital_price || undefined,
          }));
          setVariants(() => mappedVariants);
        }
      }
    } catch (error: any) {
      console.error("Failed to load product:", error);
      Alert.alert("Error", error.message || "Gagal memuat data produk");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const loadMerks = async () => {
    try {
      const response = await merkApi.getMerks();
      if (response.data) {
        setMerks(response.data);
      }
    } catch (error) {
      console.error("Failed to load merks:", error);
    }
  };

  const loadRecipes = async () => {
    try {
      const response = await recipeApi.getRecipes();
      if (response.data) {
        setRecipes(response.data.map(r => ({id: r.id, name: r.name})));
      }
    } catch (error) {
      console.error("Failed to load recipes:", error);
    }
  };

  const isDirty =
    name.trim() !== "" ||
    price.trim() !== "" ||
    brand.trim() !== "" ||
    category.trim() !== "" ||
    recipe.trim() !== "" ||
    favorite ||
    enableCostBarcode ||
    imageUri !== null ||
    capitalPrice > 0 ||
    barcode.trim() !== "" ||
    (stock !== null &&
      (stock.offlineStock !== 0 ||
        stock.unit !== "pcs" ||
        stock.minStock !== 0 ||
        stock.notifyMin)) ||
    variants.length > 0;

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", e => {
      if (!isDirty) {
        return;
      }

      const action = e.data.action;
      e.preventDefault();

      confirmationRef.current?.showConfirmationDialog({
        title: "Konfirmasi",
        message: "Data belum disimpan. Yakin ingin keluar dari halaman ini?",
        onCancel: () => {
          // Tetap di sini
        },
        onConfirm: () => {
          reset();
          navigation.dispatch(action);
        },
      });
    });

    return sub;
  }, [navigation, isDirty]);

  const formatIDR = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  const handleSave = async () => {
    if (!params.id) {
      Alert.alert("Error", "ID produk tidak ditemukan");
      return;
    }

    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Nama produk harus diisi");
      return;
    }

    // Clean and parse price (optional for materials)
    const cleanPrice = String(price).replace(/[^0-9]/g, "");
    const numericPrice = Number(cleanPrice) || 0;

    try {
      setIsSaving(true);

      // Upload image first if selected and it's a local file
      let uploadedImageUrl: string | undefined;
      if (imageUri && !imageUri.startsWith("http")) {
        console.log("📤 Uploading material image...");
        try {
          const file = prepareFileFromUri(imageUri);
          const uploadResponse = await assetApi.uploadImage(file);
          if (uploadResponse.data?.url) {
            uploadedImageUrl = uploadResponse.data.url;
            console.log("✅ Material image uploaded:", uploadedImageUrl);
          }
        } catch (uploadError: any) {
          console.error("❌ Image upload failed:", uploadError);
          Alert.alert(
            "Peringatan",
            "Gagal upload gambar. Lanjutkan tanpa mengubah gambar?",
            [
              {
                text: "Batal",
                style: "cancel",
                onPress: () => setIsSaving(false),
              },
              {text: "Lanjutkan", onPress: () => {}},
            ]
          );
          return;
        }
      }

      // Build payload sesuai UpdateProductDto
      // Level product HANYA boleh ada: name, merk_id, category_id, is_favorite, photo_url
      const payload: any = {
        name: name.trim(),
        is_favorite: favorite,
        is_ingredient: true, // Mark as ingredient
      };

      // merk_id optional
      if (brand && brand.length > 10 && brand.startsWith("cm")) {
        payload.merk_id = brand;
      }

      // category_id optional
      if (category && category.length > 10) {
        payload.category_id = category;
      }

      // Add uploaded image URL
      if (uploadedImageUrl) {
        payload.photo_url = uploadedImageUrl;
      } else if (imageUri && imageUri.startsWith("http")) {
        payload.photo_url = imageUri;
      }

      // Build variants array
      const allVariants: any[] = [];

      // 1. Update variant default dengan data dari form
      if (defaultVariantId) {
        const defaultVariantData: any = {
          id: defaultVariantId, // ID variant default yang sudah ada
          name: "Regular",
          price: numericPrice,
          capital_price: capitalPrice || 0,
          is_stock_active: !!stock,
        };

        if (barcode) defaultVariantData.barcode = barcode;

        if (recipe && recipe.length > 10 && recipe.startsWith("cm")) {
          defaultVariantData.recipe_id = recipe;
        }

        if (stock) {
          defaultVariantData.stock = stock.offlineStock;
          defaultVariantData.min_stock = stock.minStock;
          defaultVariantData.notify_on_stock_ronouts = stock.notifyMin;
          if (
            stock.unit &&
            stock.unit.length > 10 &&
            stock.unit.startsWith("cm")
          ) {
            defaultVariantData.unit_id = stock.unit;
          }
        }

        allVariants.push(defaultVariantData);
      }

      // 2. Tambahkan variant non-default yang sudah ada
      if (variants.length > 0) {
        console.log("📦 Variants from store before mapping:", variants);
        const nonDefaultVariants = variants.map(v => ({
          ...v,
        }));
        console.log("📦 Mapped nonDefaultVariants:", nonDefaultVariants);
        allVariants.push(...nonDefaultVariants);
      }

      payload.variants = allVariants;

      console.log(
        "📦 Final payload.variants:",
        JSON.stringify(payload.variants, null, 2)
      );
      console.log("Updating product:", payload);
      const response = await productApi.updateProduct(params.id, payload);

      if (response.data) {
        setShowSuccessPopup(true);
      }
    } catch (error: any) {
      console.error("Failed to update product:", error);
      Alert.alert("Error", error.message || "Gagal memperbarui produk");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
        <Header title="Edit Bahan" showHelp={false} />
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          <ThemedText style={{marginTop: 16, color: Colors[colorScheme].icon}}>
            Memuat data produk...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Edit Bahan" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: 18,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <ImageUpload
            uri={imageUri || undefined}
            initials={(name || "NP").slice(0, 2).toUpperCase()}
            onImageSelected={uri => {
              console.log("📸 Material image selected:", uri);
              setImageUri(uri);
            }}
            disabled={isSaving}
          />

          <View style={styles.contentSection}>
            <ThemedInput
              label="Nama Produk"
              size="md"
              value={name}
              onChangeText={setName}
            />
            {/* <ThemedInput
              label="Harga Jual"
              value={price}
              size="md"
              onChangeText={setPrice}
              numericOnly
            /> */}

            <MerkPicker
              label="Pilih Merk"
              value={brand}
              size="md"
              onChange={setBrand}
            />
            <CategoryPicker
              label="Pilih Kategori"
              value={category}
              size="md"
              onChange={(category: any) => {
                setCategory(category);
              }}
              onUpdate={(category: any) => {
                // Handle category update if needed
              }}
            />
            {/* <ComboInput
              label="Resep Produk"
              value={recipe}
              size="md"
              onChangeText={setRecipe}
              items={recipes.map(r => ({label: r.name, value: r.id}))}
            /> */}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.contentWrapper}>
          <View style={styles.variantsSection}>
            {variants.length > 0 ? (
              <>
                <ThemedText type="subtitle-2">Varian</ThemedText>
                {variants.map((v, idx) => {
                  console.log(`📦 Variant ${idx} data:`, {
                    name: v.name,
                    stock: v.stock,
                    is_stock_active: v.is_stock_active,
                    stockType: typeof v.stock,
                  });
                  return (
                    <VariantItem
                      key={idx}
                      initials={(v.name || "VR").slice(0, 2).toUpperCase()}
                      name={v.name}
                      price={v.price}
                      stock={
                        v.is_stock_active && typeof v.stock === "number"
                          ? {count: v.stock, unit: v.unit_id || "pcs"}
                          : undefined
                      }
                      onPress={() =>
                        router.push({
                          pathname: "/dashboard/recipe-and-materials/variant",
                          params: {
                            from: "edit",
                            ...(v.id ? {variantId: v.id} : {}),
                            name: v.name,
                            price: String(v.price),
                            capitalPrice: String(v.capital_price),
                            ...(typeof v.stock === "number"
                              ? {
                                  offlineStock: String(v.stock),
                                  unit: v.unit_id || "pcs",
                                  minStock: String(v.min_stock || 0),
                                  notifyMin: v.notify_on_stock_ronouts
                                    ? "1"
                                    : "0",
                                }
                              : {}),
                          },
                        } as never)
                      }
                    />
                  );
                })}
              </>
            ) : null}

            <ThemedButton
              title="Tambah Varian"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/dashboard/recipe-and-materials/variant",
                  params: {
                    from: "edit",
                  },
                } as never)
              }
            />

            <ThemedButton
              title="Hapus Bahan"
              variant="secondary"
              onPress={() => {
                if (!params.id) {
                  Alert.alert("Error", "ID produk tidak ditemukan");
                  return;
                }

                Alert.alert(
                  "Konfirmasi",
                  "Yakin ingin menghapus bahan ini? Tindakan ini tidak dapat dibatalkan.",
                  [
                    {text: "Batal", style: "cancel"},
                    {
                      text: "Hapus",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await productApi.deleteProduct(params.id as string);
                          reset();
                          router.back();
                        } catch (error: any) {
                          console.error("Failed to delete product:", error);
                          Alert.alert(
                            "Error",
                            error.message || "Gagal menghapus produk"
                          );
                        }
                      },
                    },
                  ]
                );
              }}
            />

            <View style={styles.bottomBar}>
              <ThemedButton
                title={isSaving ? "Menyimpan..." : "Simpan"}
                variant="primary"
                onPress={handleSave}
                disabled={isSaving}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <ConfirmationDialog ref={confirmationRef} />
      <ConfirmPopup
        visible={showSuccessPopup}
        title="Berhasil"
        message="Produk berhasil diperbarui"
        onConfirm={() => {
          setShowSuccessPopup(false);
          reset();
          router.back();
        }}
        onCancel={() => {
          setShowSuccessPopup(false);
          reset();
          router.back();
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
    inlineCard: {
      marginTop: 8,
    },
    sectionDivider: {
      backgroundColor: Colors[colorScheme].border2,
      height: isTablet ? 14 : 12,
    },
    contentSection: {
      paddingHorizontal: isTablet ? 28 : 20,
      paddingVertical: isTablet ? 28 : 24,
    },
    rowSection: {
      paddingHorizontal: isTablet ? 28 : 20,
      paddingVertical: isTablet ? 10 : 6,
    },
    variantsSection: {
      marginTop: isTablet ? 12 : 6,
      paddingHorizontal: isTablet ? 28 : 20,
      paddingVertical: isTablet ? 10 : 6,
      gap: isTablet ? 16 : 12,
      flexDirection: "column",
    },
    bottomBar: {
      left: 0,
      right: 0,
      bottom: 0,
      paddingBottom: isTablet ? 22 : 16,
      paddingTop: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
