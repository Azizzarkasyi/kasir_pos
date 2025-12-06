import VariantItem from "@/components/atoms/variant-item";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import MenuRow from "@/components/menu-row";
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
import { Alert, StyleSheet, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddMaterialScreen() {
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
  const [isSaving, setIsSaving] = useState(false);

  const {
    name,
    price,
    brand,
    imageUri,
    capitalPrice,
    barcode,
    variants,
    stock,
    setName,
    setPrice,
    setBrand,
    setImageUri,
    setCapitalPrice,
    setBarcode,
    setVariants,
    setStock,
  } = useProductFormStore(state => state);
  const {variant_name, variant_price} = useLocalSearchParams<{
    variant_name?: string;
    variant_price?: string;
  }>();

  React.useEffect(() => {
    if (variant_name && variant_price) {
      const priceNum = Number(String(variant_price).replace(/[^0-9]/g, ""));
      setVariants(prev => [
        ...prev,
        {name: String(variant_name), price: priceNum},
      ]);
      router.replace("/dashboard/recipe-and-materials/add-material" as never);
    }
  }, [variant_name, variant_price, router]);

  // Barcode sekarang dikelola via Zustand store dan diisi langsung dari layar scan,
  // jadi tidak lagi diambil dari query param.

  const isDirty =
    Object.values({
      name,
      price,
      brand,
      imageUri: imageUri || "",
      capitalPrice,
      barcode,
    }).some(value => {
      if (typeof value === "string") {
        return value.trim() !== "";
      }

      if (typeof value === "number") {
        return value > 0;
      }

      return false;
    }) || variants.length > 0;

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

    const cleanPrice = String(price).replace(/[^0-9]/g, "");
    const numericPrice = Number(cleanPrice);

    if (!cleanPrice || numericPrice <= 0) {
      Alert.alert("Error", "Harga jual harus lebih dari 0");
      return;
    }

    // Validate merk_id (optional)
    if (brand && brand.length < 10) {
      Alert.alert("Error", "Merk tidak valid");
      return;
    }

    try {
      setIsSaving(true);

      const payload: any = {
        name: name.trim(),
        price: numericPrice,
        is_ingredient: true, // Flag untuk bahan baku
      };

      if (brand) payload.merk_id = brand;

      if (imageUri) payload.photo_url = imageUri;
      if (capitalPrice > 0) payload.capital_price = capitalPrice;
      if (barcode) payload.barcode = barcode;

      // Add stock if configured - Backend expects flat structure
      if (stock) {
        payload.stock = stock.offlineStock;
        payload.is_stock_active = true;
        payload.min_stock = stock.minStock;
        payload.notify_on_stock_ronouts = stock.notifyMin;
        // Note: unit adalah string (pcs, kg, etc), tapi backend expect unit_id
        // Untuk sekarang kita skip unit_id, atau bisa fetch units API dulu
      }

      // Add variants if any - Backend expects flat structure per variant
      if (variants.length > 0) {
        payload.variants = variants.map(v => ({
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
      }

      console.log("📦 Creating material:", payload);

      const response = await productApi.createProduct(payload);

      if (response.data) {
        console.log("✅ Material created successfully:", response.data);
        Alert.alert("Sukses", "Bahan berhasil ditambahkan", [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setName("");
              setPrice("");
              setBrand("");
              setImageUri(null);
              setCapitalPrice(0);
              setBarcode("");
              setVariants([]);
              setStock(null);
              router.back();
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error("❌ Failed to create material:", error);
      Alert.alert("Error", error.message || "Gagal menambahkan bahan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header
        showHelp={false}
        title="Tambah Bahan"
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
