import VariantItem from "@/components/atoms/variant-item";
import CostBarcodeFields from "@/components/cost-barcode-fields";
import ConfirmationDialog, { ConfirmationDialogHandle } from "@/components/drawers/confirmation-dialog";
import ImageUpload from "@/components/image-upload";
import MenuRow from "@/components/menu-row";
import CategoryPicker from "@/components/mollecules/category-picker";
import MerkPicker from "@/components/mollecules/merk-picker";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProductFormStore } from "@/stores/product-form-store";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddProductScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const categories: Category[] = [
    { id: "general", name: "Umum" },
    { id: "food", name: "Makanan" },
    { id: "drink", name: "Minuman" },
    { id: "snack", name: "Snack" },
  ];

  const {
    name,
    price,
    brand,
    category,
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
  } = useProductFormStore(state => state);

  const isDirty = Object.values({
    name,
    price,
    brand,
    category,
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

  const handleSave = () => {
    const payload = {
      name,
      price,
      brand,
      category,
      favorite,
      enableCostBarcode,
      imageUri,
    };
    console.log("Tambah produk", payload);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
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
            onChange={(category: Category) => {
              setCategory(category.id);
            }}
            onUpdate={(category: Category) => {

            }}
            categories={categories}
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

        <View style={{ paddingHorizontal: 20, paddingVertical: 6 }}>
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
            showBottomBorder={false}
            rightText={stock ? `Stok Aktif (${stock.offlineStock} ${stock.unit})` : "Stok Tidak Aktif"}
            variant="link"
            onPress={() =>
              router.push({
                pathname: "/dashboard/product/stock",
                params: {
                  from: "add",
                  ...(name ? { name } : {}),
                  ...(price ? { price } : {}),
                  ...(brand ? { brand } : {}),
                  ...(category ? { category } : {}),
                  ...(favorite ? { favorite: String(favorite) } : {}),
                  ...(enableCostBarcode ? { enableCostBarcode: String(enableCostBarcode) } : {}),
                  ...(imageUri ? { imageUri } : {}),
                  ...(capitalPrice ? { capitalPrice: String(capitalPrice) } : {}),
                  ...(barcode ? { barcode } : {}),
                  ...(variants.length ? { variants: JSON.stringify(variants) } : {}),
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

        <View style={styles.sectionDivider} />
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
                  stock={v.stock}
                  onPress={() => { }}
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
                  from: "add",
                  ...(name ? { name } : {}),
                  ...(price ? { price } : {}),
                  ...(brand ? { brand } : {}),
                  ...(category ? { category } : {}),
                  ...(favorite ? { favorite: String(favorite) } : {}),
                  ...(enableCostBarcode ? { enableCostBarcode: String(enableCostBarcode) } : {}),
                  ...(imageUri ? { imageUri } : {}),
                  ...(capitalPrice ? { capitalPrice: String(capitalPrice) } : {}),
                  ...(barcode ? { barcode } : {}),
                  ...(variants.length ? { variants: JSON.stringify(variants) } : {}),
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
      paddingVertical: 18,
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
