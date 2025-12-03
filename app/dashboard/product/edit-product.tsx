import VariantItem from "@/components/atoms/variant-item";
import ComboInput from "@/components/combo-input";
import CostBarcodeFields from "@/components/cost-barcode-fields";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
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
import {useProductFormStore} from "@/stores/product-form-store";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, View, ActivityIndicator, Alert} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import productApi from "@/services/endpoints/products";
import merkApi from "@/services/endpoints/merks";
import {Merk, Product} from "@/types/api";

export default function EditProductScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [productData, setProductData] = useState<Product | null>(null);
  const [defaultVariantId, setDefaultVariantId] = useState<string | null>(null);

  React.useEffect(() => {
    loadProduct();
    loadMerks();

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
        console.log("Loaded product:", product);

        // Cari variant default untuk data produk utama
        const defaultVariant = product.variants?.find(
          (v: any) => v.is_default === true
        );

        // Populate form dari product
        setName(product.name);
        setBrand(product.merk_id || "");
        setCategory(product.category_id || "");
        setFavorite(product.is_favorite || false);
        setImageUri(product.photo_url || null);

        // Ambil harga, stock, barcode dari variant default
        if (defaultVariant) {
          setDefaultVariantId(defaultVariant.id); // Simpan ID default variant
          setPrice(String(defaultVariant.price));

          if (defaultVariant.barcode || defaultVariant.capital_price) {
            setEnableCostBarcode(true);
            setBarcode(defaultVariant.barcode || "");
            setCapitalPrice(defaultVariant.capital_price || 0);
          }

          if (
            defaultVariant.is_stock_active &&
            defaultVariant.stock !== undefined
          ) {
            setStock({
              offlineStock: defaultVariant.stock,
              unit: defaultVariant.unit_id || "pcs",
              minStock: defaultVariant.min_stock || 0,
              notifyMin: defaultVariant.notify_on_stock_ronouts || false,
            });
          }
        } else {
          // Fallback jika tidak ada default variant
          setPrice("0");
        }

        // Load variants (kecuali yang default) - simpan ID untuk update
        if (product.variants && product.variants.length > 0) {
          const nonDefaultVariants = product.variants.filter(
            (v: any) => !v.is_default
          );
          const mappedVariants = nonDefaultVariants.map((v: any) => ({
            id: v.id, // Simpan ID variant untuk update
            name: v.name,
            price: v.price,
            barcode: v.barcode,
            capital_price: v.capital_price,
            stock: v.is_stock_active
              ? {
                  count: v.stock || 0,
                  unit: v.unit_id || "pcs",
                  minStock: v.min_stock || 0,
                  notifyMin: v.notify_on_stock_ronouts || false,
                }
              : undefined,
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

    // Clean and parse price
    const cleanPrice = String(price).replace(/[^0-9]/g, "");
    const numericPrice = Number(cleanPrice);

    if (!cleanPrice || numericPrice <= 0) {
      Alert.alert("Error", "Harga jual harus lebih dari 0");
      return;
    }

    try {
      setIsSaving(true);

      // Build payload sesuai UpdateProductDto
      // Level product HANYA boleh ada: name, merk_id, category_id, is_favorite, photo_url
      const payload: any = {
        name: name.trim(),
        is_favorite: favorite,
      };

      // merk_id wajib ada
      if (brand && brand.length > 10 && brand.startsWith("cm")) {
        payload.merk_id = brand;
      } else {
        Alert.alert("Error", "Merk harus dipilih");
        return;
      }

      // category_id wajib ada
      if (category) {
        payload.category_id = category;
      } else {
        Alert.alert("Error", "Kategori harus dipilih");
        return;
      }

      if (imageUri) payload.photo_url = imageUri;

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
        const nonDefaultVariants = variants.map((v: any) => {
          const variantData: any = {
            name: v.name,
            price: v.price,
            capital_price: v.capital_price || 0,
            is_stock_active: !!v.stock,
          };

          // Kirim ID jika variant sudah ada
          if (v.id) variantData.id = v.id;
          if (v.barcode) variantData.barcode = v.barcode;

          if (v.stock) {
            variantData.stock = v.stock.count || 0;
            variantData.min_stock = v.stock.minStock || 0;
            variantData.notify_on_stock_ronouts = v.stock.notifyMin || false;
            if (
              v.stock.unit &&
              v.stock.unit.length > 10 &&
              v.stock.unit.startsWith("cm")
            ) {
              variantData.unit_id = v.stock.unit;
            }
          }

          return variantData;
        });
        allVariants.push(...nonDefaultVariants);
      }

      payload.variants = allVariants;

      console.log("Updating product:", payload);
      const response = await productApi.updateProduct(params.id, payload);

      if (response.data) {
        Alert.alert("Sukses", "Produk berhasil diperbarui", [
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
      console.error("Failed to update product:", error);
      Alert.alert("Error", error.message || "Gagal memperbarui produk");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
        <Header title="Edit Produk" showHelp={false} />
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
      <Header title="Edit Produk" showHelp={false} />
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
        <ImageUpload
          uri={imageUri || undefined}
          initials={(name || "NP").slice(0, 2).toUpperCase()}
          onPress={() => {
            // Integrasi picker bisa ditambahkan nanti
            setImageUri(null);
          }}
        />

        <View style={styles.contentSection}>
          <ThemedInput
            label="Nama Produk"
            size="md"
            value={name}
            onChangeText={setName}
          />
          <ThemedInput
            label="Harga Jual"
            value={price}
            size="md"
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
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.rowSection}>
          <MenuRow
            title="Produk Favorit"
            subtitle="Tampilkan produk di kategori terdepan."
            variant="toggle"
            value={favorite}
            onValueChange={setFavorite}
            badgeText="Baru"
          />
        </View>

        <View style={styles.sectionDivider} />

        <View style={{paddingHorizontal: 20, paddingVertical: 6}}>
          <MenuRow
            title="Atur Harga Modal dan Barcode"
            variant="toggle"
            value={enableCostBarcode}
            onValueChange={setEnableCostBarcode}
            showBottomBorder={!enableCostBarcode}
          />
          {enableCostBarcode ? (
            <CostBarcodeFields
              capitalPrice={capitalPrice}
              onCapitalPriceChange={setCapitalPrice}
              barcode={barcode}
              onBarcodeChange={setBarcode}
              onPressScan={() =>
                router.push("/dashboard/product/add-barcode" as never)
              }
            />
          ) : null}
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.rowSection}>
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
              router.push({
                pathname: "/dashboard/product/stock",
                params: {
                  from: "edit",
                  ...(params.id ? {id: String(params.id)} : {}),
                },
              } as never)
            }
          />
        </View>

        <View style={styles.variantsSection}>
          {variants.length > 0 ? (
            <>
              <View style={styles.sectionDivider} />
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
              router.push({
                pathname: "/dashboard/product/variant",
                params: {
                  from: "edit",
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
      </KeyboardAwareScrollView>

      <ConfirmationDialog ref={confirmationRef} />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    inlineCard: {
      marginTop: 8,
    },
    sectionDivider: {
      backgroundColor: Colors[colorScheme].border2,
      height: 12,
    },
    contentSection: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    rowSection: {
      paddingHorizontal: 20,
      paddingVertical: 6,
    },
    variantsSection: {
      paddingHorizontal: 20,
      paddingVertical: 6,
      gap: 12,
      flexDirection: "column",
    },
    bottomBar: {
      left: 0,
      right: 0,
      bottom: 0,
      paddingBottom: 16,
      paddingTop: 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
