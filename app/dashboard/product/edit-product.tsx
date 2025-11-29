import VariantItem from "@/components/atoms/variant-item";
import ComboInput from "@/components/combo-input";
import CostBarcodeFields from "@/components/cost-barcode-fields";
import ConfirmationDialog, { ConfirmationDialogHandle } from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import MenuRow from "@/components/menu-row";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProductFormStore } from "@/stores/product-form-store";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    setRecipe,
    setFavorite,
    setEnableCostBarcode,
    setImageUri,
    setCapitalPrice,
    setBarcode,
    setVariants,
    setStock,
  } = useProductFormStore(state => state);
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    price?: string;
    brand?: string;
    category?: string;
    favorite?: string;
    enableCostBarcode?: string;
    imageUri?: string;
    capitalPrice?: string;
    barcode?: string;
    variants?: string;
    variant_name?: string;
    variant_price?: string;
    variant_offlineStock?: string;
    variant_unit?: string;
    variant_minStock?: string;
    variant_notifyMin?: string;
    offlineStock?: string;
    unit?: string;
    minStock?: string;
    notifyMin?: string;
  }>();
  const {
    variant_name,
    variant_price,
    variant_offlineStock,
    variant_unit,
    variant_minStock,
    variant_notifyMin,
    variants: qsVariants,
    offlineStock: qsOfflineStock,
    unit: qsUnit,
    minStock: qsMinStock,
    notifyMin: qsNotifyMin,
  } = params;

  React.useEffect(() => {
    return () => {
      // Opsional: reset form saat keluar dari halaman edit produk
      // useProductFormStore.getState().reset();
    };
  }, []);

  useEffect(() => {
    if (params.name !== undefined) {
      setName(String(params.name));
    }
    if (params.price !== undefined) {
      setPrice(String(params.price));
    }
    if (params.brand !== undefined) {
      setBrand(String(params.brand));
    }
    if (params.category !== undefined) {
      setCategory(String(params.category));
    }
    if (params.favorite !== undefined) {
      setFavorite(params.favorite === "true");
    }
    if (params.enableCostBarcode !== undefined) {
      setEnableCostBarcode(params.enableCostBarcode === "true");
    }
    if (params.imageUri !== undefined && params.imageUri !== "") {
      setImageUri(String(params.imageUri));
    }
    if (params.capitalPrice !== undefined) {
      const parsed = Number(String(params.capitalPrice).replace(/[^0-9]/g, ""));
      if (!Number.isNaN(parsed)) {
        setCapitalPrice(parsed);
      }
    }
    if (params.barcode !== undefined) {
      setBarcode(String(params.barcode));
    }
    if (qsOfflineStock || qsUnit || qsMinStock || qsNotifyMin) {
      const parsedStock = {
        offlineStock: qsOfflineStock ? Number(String(qsOfflineStock).replace(/[^0-9]/g, "")) : 0,
        unit: qsUnit ? String(qsUnit) : "pcs",
        minStock: qsMinStock ? Number(String(qsMinStock).replace(/[^0-9]/g, "")) : 0,
        notifyMin: qsNotifyMin === "1" || qsNotifyMin === "true",
      };
      setStock(parsedStock);
    }
  }, []);

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
    (stock !== null && (stock.offlineStock !== 0 || stock.unit !== "pcs" || stock.minStock !== 0 || stock.notifyMin)) ||
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

  const handleSave = () => {
    const payload = {
      name,
      price,
      brand,
      category,
      recipe,
      favorite,
      enableCostBarcode,
      imageUri,
    };
    console.log("Tambah produk", payload);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
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
          <ThemedInput label="Nama Produk" size="md" value={name} onChangeText={setName} />
          <ThemedInput
            label="Harga Jual"
            value={price}
            size="md"
            onChangeText={setPrice}
            keyboardType="number-pad"
          />

          <ComboInput
            label="Pilih Merk"
            value={brand}
            size="md"
            onChangeText={setBrand}
            items={[
              {label: "Pilih Merk", value: ""},
              {label: "Tidak ada merk", value: "none"},
              {label: "Qasir", value: "qasir"},
            ]}
          />
          <ComboInput
            label="Pilih Kategori"
            value={category}
            size="md"
            onChangeText={setCategory}
            items={[
              {label: "Pilih Kategori", value: ""},
              {label: "Umum", value: "umum"},
              {label: "Minuman", value: "minuman"},
              {label: "Makanan", value: "makanan"},
            ]}
          />
          <ComboInput
            label="Resep Produk"
            value={recipe}
            size="md"
            onChangeText={setRecipe}
            items={[
              {label: "Pilih Resep", value: ""},
              {label: "Tanpa Resep", value: "none"},
              {label: "Resep Default", value: "default"},
            ]}
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

        <View style={styles.rowSection}>
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
            />
          ) : null}
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.rowSection}>
          <MenuRow
            title="Kelola Stok"
            rightText={stock ? `Stok Aktif (${stock.offlineStock} ${stock.unit})` : "Stok Tidak Aktif"}
            showBottomBorder={false}
            variant="link"
            onPress={() =>
              router.push({
                pathname: "/dashboard/product/stock",
                params: {
                  from: "edit",
                  ...(params.id ? { id: String(params.id) } : {}),
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
            <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
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
