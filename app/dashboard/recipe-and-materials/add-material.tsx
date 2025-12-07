import VariantItem from "@/components/atoms/variant-item";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import ConfirmPopup from "@/components/atoms/confirm-popup";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import MenuRow from "@/components/menu-row";
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
import {Merk} from "@/types/api";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {Alert, StyleSheet, useWindowDimensions, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function AddProductScreen() {
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

  const [merks, setMerks] = useState<Merk[]>([]);
  const [recipes, setRecipes] = useState<{id: string; name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    loadMerks();
    loadRecipes();
  }, []);

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
  } = useProductFormStore(state => state);

  const isDirty = Object.values({
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
  }).some(value => {
    if (typeof value === "string") {
      return value.trim() !== "";
    }

    if (typeof value === "number") {
      return value > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return false;
  });

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
          navigation.dispatch(action);
        },
      });
    });

    return sub;
  }, [navigation, isDirty]);

  const formatIDR = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Nama bahan harus diisi");
      return;
    }

    // Clean and parse price
    const cleanPrice = String(price).replace(/[^0-9]/g, "");
    const numericPrice = Number(cleanPrice);

    try {
      setIsSaving(true);

      // Upload image first if selected
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
            "Gagal upload gambar. Lanjutkan tanpa gambar?",
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

      // Build payload sesuai CreateProductDto
      const payload: any = {
        name: name.trim(),
        price: numericPrice,
        is_ingredient: true,
      };

      // Optional fields - tambahkan hanya jika ada nilai
      if (brand && brand.length > 10 && brand.startsWith("cm")) {
        payload.merk_id = brand;
      }

      if (category && category.length > 10 && category.startsWith("cm")) {
        payload.category_id = category;
      }

      if (recipe && recipe.length > 10 && recipe.startsWith("cm")) {
        payload.recipe_id = recipe;
      }

      // Add uploaded image URL
      if (uploadedImageUrl) {
        payload.photo_url = uploadedImageUrl;
      } else if (imageUri && imageUri.startsWith("http")) {
        payload.photo_url = imageUri;
      }

      if (favorite !== undefined) {
        payload.is_favorite = favorite;
      }

      // Cost & Barcode fields
      if (enableCostBarcode) {
        if (barcode) {
          payload.barcode = barcode;
        }
        if (capitalPrice !== undefined && capitalPrice > 0) {
          payload.capital_price = capitalPrice;
        }
      }

      // Stock fields
      if (stock) {
        payload.is_stock_active = true;
        payload.stock = stock.offlineStock;
        payload.min_stock = stock.minStock;
        payload.notify_on_stock_ronouts = stock.notifyMin;

        if (
          stock.unit &&
          stock.unit.length > 10 &&
          stock.unit.startsWith("cm")
        ) {
          payload.unit_id = stock.unit;
        }
      }

      // Variants - structure sudah sama dengan CreateProductVariantPayload,
      // jadi bisa langsung dilempar ke payload tanpa mapping tambahan
      console.log("📦 Variants from store before mapping:", variants);
      payload.variants = variants.map(v => {
        const {id, ...rest} = v;
        return rest;
      });
      console.log(
        "📦 Final payload.variants:",
        JSON.stringify(payload.variants, null, 2)
      );

      const response = await productApi.createProduct(payload);

      if (response.data) {
        setShowSuccessPopup(true);
      }
    } catch (error: any) {
      console.error("Failed to create product:", error);
      Alert.alert("Error", error.message || "Gagal menambahkan bahan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Tambah Bahan" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: 18,
          // paddingBottom: insets.bottom + 80,
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
              onChange={setCategory}
            />
            <ThemedInput
              label="Harga Modal"
              value={capitalPrice ? String(capitalPrice) : ""}
              size="md"
              onChangeText={v => setCapitalPrice(v ? Number(v) : 0)}
              numericOnly
            />
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.sectionDivider} />

        <View style={styles.sectionDivider} />

        <View style={styles.contentWrapper}>
          <View style={styles.rowSection}>
            <MenuRow
              title="Kelola Stok"
              showBottomBorder={false}
              rightText={
                stock
                  ? `Stok Aktif (${stock.offlineStock})`
                  : "Stok Tidak Aktif"
              }
              variant="link"
              onPress={() =>
                router.push({
                  pathname: "/dashboard/product/stock",
                  params: {
                    from: "add",
                    ...(name ? {name} : {}),
                    ...(price ? {price} : {}),
                    ...(brand ? {brand} : {}),
                    ...(category ? {category} : {}),
                    ...(favorite ? {favorite: String(favorite)} : {}),
                    ...(enableCostBarcode
                      ? {enableCostBarcode: String(enableCostBarcode)}
                      : {}),
                    ...(imageUri ? {imageUri} : {}),
                    ...(capitalPrice
                      ? {capitalPrice: String(capitalPrice)}
                      : {}),
                    ...(barcode ? {barcode} : {}),
                    ...(variants.length
                      ? {variants: JSON.stringify(variants)}
                      : {}),
                    ...(stock
                      ? {
                          offlineStock: String(stock.offlineStock),
                          unit: stock.unit,
                          minStock: String(stock.minStock),
                          notifyMin: stock.notifyMin ? "1" : "0",
                        }
                      : {}),
                  },
                } as never)
              }
            />
          </View>
        </View>

        <View style={styles.sectionDivider} />
        <View style={styles.contentWrapper}>
          <View style={styles.variantsSection}>
            {variants.length > 0 ? (
              <>
                <ThemedText type="subtitle-2">Varian</ThemedText>
                {variants.map((v, idx) => (
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
                          name: v.name,
                          price: String(v.price),
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
                          ...(v.id ? {variantId: v.id} : {}),
                        },
                      } as never)
                    }
                  />
                ))}
              </>
            ) : null}

            <ThemedButton
              title="Tambah Varian"
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: "/dashboard/recipe-and-materials/variant",
                  params: {
                    from: "add",
                  },
                } as never)
              }
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
        message="Bahan berhasil ditambahkan"
        onConfirm={() => {
          setShowSuccessPopup(false);
          useProductFormStore.getState().reset();
          router.back();
        }}
        onCancel={() => {
          setShowSuccessPopup(false);
          useProductFormStore.getState().reset();
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
      height: isTablet ? 10 : 6,
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
      paddingHorizontal: isTablet ? 28 : 20,
      paddingVertical: isTablet ? 22 : 18,
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
