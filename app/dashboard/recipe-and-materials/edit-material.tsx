import VariantItem from "@/components/atoms/variant-item";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import MenuRow from "@/components/menu-row";
import CategoryPicker from "@/components/mollecules/category-picker";
import MerkPicker from "@/components/mollecules/merk-picker";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import { useProductFormStore } from "@/stores/product-form-store";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditMaterialScreen() {
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    name,
    price,
    brand,
    category,
    imageUri,
    capitalPrice,
    barcode,
    variants,
    stock,
    setName,
    setPrice,
    setBrand,
    setCategory,
    setImageUri,
    setCapitalPrice,
    setBarcode,
    setVariants,
    setStock,
    reset,
  } = useProductFormStore(state => state);

  const {
    id,
    name: paramName,
    brand: paramBrand,
    imageUri: paramImageUri,
    capitalPrice: paramCapitalPrice,
    variants: paramVariants,
    variant_name,
    variant_price,
  } = useLocalSearchParams<{
    id?: string;
    name?: string;
    brand?: string;
    imageUri?: string;
    capitalPrice?: string;
    variants?: string;
    variant_name?: string;
    variant_price?: string;
  }>();

  // Load material data from API
  useEffect(() => {
    const loadMaterial = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await productApi.getProduct(id);

        if (response.data) {
          const product = response.data;
          setName(product.name);

          if (product.merk_id) setBrand(product.merk_id);
          if (product.category_id) setCategory(product.category_id);
          if (product.photo_url) setImageUri(product.photo_url);
          if (product.barcode) setBarcode(product.barcode);

          // Load variants or create default from product data
          if (product.variants && product.variants.length > 0) {
            // Product has variants - load them
            const loadedVariants = product.variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              price: v.price,
              ...(v.stock || v.is_stock_active
                ? {
                    stock: {
                      count: v.stock || 0,
                      unit: v.unit?.name || "pcs",
                      minStock: v.min_stock || 0,
                      notifyMin: v.notify_on_stock_ronouts || false,
                    },
                  }
                : {}),
            }));
            setVariants(loadedVariants);
          } else {
            // No variants - use product level data as main variant
            if (product.price) {
              setPrice(String(product.price));
            }
            if (product.capital_price) setCapitalPrice(product.capital_price);

            // Load stock data if available at product level
            if (product.is_stock_active) {
              setStock({
                offlineStock: product.stock || 0,
                unit: product.unit?.name || "pcs",
                minStock: product.min_stock || 0,
                notifyMin: product.notify_on_stock_ronouts || false,
              });
            }
          }

          console.log("✅ Material loaded:", product);
        }
      } catch (error: any) {
        console.error("❌ Failed to load material:", error);
        Alert.alert("Error", "Gagal memuat data bahan");
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterial();
  }, [id]);

  React.useEffect(() => {
    if (variant_name && variant_price) {
      const priceNum = Number(String(variant_price).replace(/[^0-9]/g, ""));
      setVariants(prev => [
        ...prev,
        {name: String(variant_name), price: priceNum},
      ]);
      router.replace("/dashboard/recipe-and-materials/edit-material" as never);
    }
  }, [variant_name, variant_price, router]);

  const isDirty =
    name.trim() !== "" ||
    brand.trim() !== "" ||
    imageUri !== null ||
    capitalPrice > 0 ||
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
          navigation.dispatch(action);
        },
      });
    });

    return sub;
  }, [navigation, isDirty]);

  const formatIDR = (n: number) => new Intl.NumberFormat("id-ID").format(n);

  const handleSave = async () => {
    if (!id) {
      Alert.alert("Error", "ID bahan tidak ditemukan");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Error", "Nama bahan harus diisi");
      return;
    }

    const cleanPrice = String(price).replace(/[^0-9]/g, "");
    const numericPrice = Number(cleanPrice);

    if (!cleanPrice || numericPrice <= 0) {
      Alert.alert("Error", "Harga jual harus lebih dari 0");
      return;
    }

    // Validate merk_id and category_id (optional)
    if (brand && brand.length < 10) {
      Alert.alert("Error", "Merk tidak valid");
      return;
    }

    if (category && category.length < 10) {
      Alert.alert("Error", "Kategori tidak valid");
      return;
    }

    try {
      setIsSaving(true);

      // UpdateProductDto structure: name, merk_id, category_id are required by backend
      // Price, stock, capital_price are NOT in product level for update - they're at variant level

      // Backend requires merk_id and category_id, use existing values or alert user
      if (!brand) {
        Alert.alert("Error", "Merk harus dipilih");
        setIsSaving(false);
        return;
      }

      if (!category) {
        Alert.alert("Error", "Kategori harus dipilih");
        setIsSaving(false);
        return;
      }

      const payload: any = {
        name: name.trim(),
        merk_id: brand,
        category_id: category,
        is_ingredient: true,
      };

      if (imageUri) payload.photo_url = imageUri;

      // For update, backend expects variants array
      if (variants.length > 0) {
        // Has variants - update them
        payload.variants = variants.map(v => ({
          ...(v.id ? {id: v.id} : {}), // Include ID if updating existing variant
          name: v.name,
          price: v.price,
          ...(v.stock
            ? {
                stock: v.stock.count,
                is_stock_active: true,
                min_stock: v.stock.minStock,
                notify_on_stock_ronouts: v.stock.notifyMin,
              }
            : {}),
        }));
      } else {
        // No variants - create default variant from product data
        // This handles products that were created without variants
        payload.variants = [
          {
            name: "Default",
            price: numericPrice,
            ...(capitalPrice > 0 ? {capital_price: capitalPrice} : {}),
            ...(barcode ? {barcode} : {}),
            ...(stock
              ? {
                  stock: stock.offlineStock,
                  is_stock_active: true,
                  min_stock: stock.minStock,
                  notify_on_stock_ronouts: stock.notifyMin,
                }
              : {}),
          },
        ];
      }

      console.log("📦 Updating material:", payload);

      const response = await productApi.updateProduct(id, payload);

      if (response.data) {
        console.log("✅ Material updated successfully:", response.data);
        Alert.alert("Sukses", "Bahan berhasil diperbarui", [
          {
            text: "OK",
            onPress: () => {
              reset();
              router.back();
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error("❌ Failed to update material:", error);
      Alert.alert("Error", error.message || "Gagal memperbarui bahan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
        <Header
          showHelp={false}
          title="Edit Bahan"
          withNotificationButton={false}
        />
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          <ThemedText style={{marginTop: 16, color: Colors[colorScheme].icon}}>
            Memuat data bahan...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header
        showHelp={false}
        title="Edit Bahan"
        withNotificationButton={false}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 80,
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
            onPress={() => {
              setImageUri(null);
            }}
          />
        </View>

        <View style={{height: 24}} />
        <View style={styles.rowSection}>
          <View style={styles.contentWrapper}>
          <ThemedInput
            label="Nama Produk"
            value={name}
            onChangeText={setName}
          />
          <ThemedInput
            label="Harga Jual"
            value={price}
            onChangeText={setPrice}
            numericOnly
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
              value={capitalPrice > 0 ? String(capitalPrice) : ""}
              onChangeText={v => {
              const num = Number(v.replace(/[^0-9]/g, ""));
              setCapitalPrice(num);
            }}
              numericOnly
              placeholder="Harga Modal"
              placeholderTextColor={Colors[colorScheme].icon}
              inputContainerStyle={{
                backgroundColor: colorScheme === "dark" ? "#1F1F1F" : "#FFFFFF",
              }}
            />
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.rowContent}>
          <View style={styles.contentWrapper}>
            <MenuRow
              title="Kelola Stok"
              rightText={
              stock
                ? `Stok Aktif (${stock.offlineStock} ${stock.unit})`
                : "Stok Tidak Aktif"
              }
            showBottomBorder={false}
              variant="link"
              onPress={() =>
                router.push("/dashboard/recipe-and-materials/stock" as never)
              }
            />
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.variantsSection}>
          <View style={styles.contentWrapper}>
          {variants.length > 0 ? (
            <>
              <ThemedText type="subtitle-2">Varian</ThemedText>
              {variants.map((v, idx) => (
                <VariantItem
                  key={idx}
                  initials={(v.name || "VR").slice(0, 2).toUpperCase()}
                  name={v.name}
                  price={v.price}
                  stock={v.stock}
                  onPress={() => {}}
                />
              ))}
            </>
          ) : null}

            <ThemedButton
              title="Tambah Varian"
              variant="secondary"
              onPress={() =>
                router.push("/dashboard/recipe-and-materials/variant" as never)
              }
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.contentWrapper}>
          <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
        </View>
      </View>

      <ConfirmationDialog ref={confirmationRef} />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    inlineCard: {
      marginTop: isTablet ? 12 : 8,
    },
    sectionDivider: {
      backgroundColor: Colors[colorScheme].border2,
      height: isTablet ? 16 : 12,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    rowSection: {
      paddingHorizontal: isTablet ? 80 : 20,
      paddingVertical: isTablet ? 32 : 24,
    },
    rowContent: {
      paddingHorizontal: isTablet ? 80 : 20,
      paddingVertical: isTablet ? 10 : 6,
    },
    variantsSection: {
      paddingHorizontal: isTablet ? 80 : 20,
      paddingVertical: isTablet ? 24 : 18,
      gap: isTablet ? 16 : 12,
      flexDirection: "column",
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: isTablet ? 80 : 20,
      paddingBottom: isTablet ? 24 : 16,
      paddingTop: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
