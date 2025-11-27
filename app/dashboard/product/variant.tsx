import CostBarcodeFields from "@/components/cost-barcode-fields";
import ConfirmationDialog, { ConfirmationDialogHandle } from "@/components/drawers/confirmation-dialog";
import MenuRow from "@/components/menu-row";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProductFormStore } from "@/stores/product-form-store";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VariantScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    offlineStock: qsOfflineStock,
    unit: qsUnit,
    minStock: qsMinStock,
    notifyMin: qsNotifyMin,
    from: qsFrom,
    name: qsName,
    price: qsPrice,
    brand: qsBrand,
    category: qsCategory,
    favorite: qsFavorite,
    enableCostBarcode: qsEnableCostBarcode,
    imageUri: qsImageUri,
    capitalPrice: qsCapitalPrice,
    barcode: qsBarcode,
    variants: qsVariants,
  } = useLocalSearchParams<{
    offlineStock?: string;
    unit?: string;
    minStock?: string;
    notifyMin?: string;
    from?: string;
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
  }>();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);
  const setVariants = useProductFormStore(state => state.setVariants);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [enableCostBarcode, setEnableCostBarcode] = useState(false);
  const [capitalPrice, setCapitalPrice] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [stock, setStock] = useState<{
    offlineStock: number;
    unit: string;
    minStock: number;
    notifyMin: boolean;
  } | null>(null);
  const [isSubmit, setIsSubmit] = useState(false);

  useEffect(() => {
    if (qsOfflineStock || qsUnit || qsMinStock || qsNotifyMin) {
      const parsed = {
        offlineStock: qsOfflineStock ? Number(String(qsOfflineStock).replace(/[^0-9]/g, "")) : 0,
        unit: qsUnit ? String(qsUnit) : "pcs",
        minStock: qsMinStock ? Number(String(qsMinStock).replace(/[^0-9]/g, "")) : 0,
        notifyMin: qsNotifyMin === "1" || qsNotifyMin === "true",
      };
      setStock(parsed);
      if (qsName) {
        setName(String(qsName));
      }
      if (qsPrice) {
        setPrice(String(qsPrice));
      }
      if (qsEnableCostBarcode) {
        setEnableCostBarcode(String(qsEnableCostBarcode) === "true");
      }
      if (qsCapitalPrice) {
        const parsedCapital = Number(String(qsCapitalPrice).replace(/[^0-9]/g, ""));
        if (!Number.isNaN(parsedCapital)) {
          setCapitalPrice(parsedCapital);
        }
      }
      if (qsBarcode) {
        setBarcode(String(qsBarcode));
      }
    }
  }, [
    qsOfflineStock,
    qsUnit,
    qsMinStock,
    qsNotifyMin,
    qsFrom,
    qsName,
    qsPrice,
    qsCapitalPrice,
    qsBarcode,
    qsBrand,
    qsCategory,
    qsFavorite,
    qsEnableCostBarcode,
    qsImageUri,
    router,
  ]);

  const handleSave = () => {
    setIsSubmit(true);
    const priceNum = Number((price || "").replace(/[^0-9]/g, ""));

    setVariants(prev => [
      ...prev,
      {
        name,
        price: priceNum,
        ...(stock
          ? {
              stock: {
                count: stock.offlineStock,
                unit: stock.unit,
                minStock: stock.minStock,
                notifyMin: stock.notifyMin,
              },
            }
          : {}),
      },
    ]);

    router.back();
  };

  const isDirty =
    name.trim() !== "" ||
    price.trim() !== "" ||
    enableCostBarcode ||
    capitalPrice > 0 ||
    barcode.trim() !== "";

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", e => {
      const action = e.data.action;
      if (!isDirty || isSubmit || action.type === "REPLACE") {
        return;
      }

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
  }, [navigation, isDirty, isSubmit]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
          paddingVertical: 12,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentSection, { paddingVertical: 12 }]}>
          <ThemedInput label="Nama Variasi" size="md" value={name} onChangeText={setName} />
          <ThemedInput
            label="Harga Jual"
            value={price}
            size="md"
            onChangeText={setPrice}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.contentSection}>
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

        <View style={styles.contentSection}>
          <MenuRow
            title="Kelola Stok"
            rightText={stock ? `Stok Aktif (${stock.offlineStock} ${stock.unit})` : "Stok Tidak Aktif"}
            showBottomBorder={false}
            variant="link"
            onPress={() => {
              router.push({
                pathname: "/dashboard/product/variant-stock",
                params: {
                  ...(qsFrom ? { from: String(qsFrom) } : {}),
                  ...(name ? { name } : {}),
                  ...(price ? { price } : {}),
                  ...(capitalPrice ? { capitalPrice: String(capitalPrice) } : {}),
                  ...(barcode ? { barcode } : {}),
                  ...(stock
                    ? {
                        offlineStock: String(stock.offlineStock),
                        unit: stock.unit,
                        minStock: String(stock.minStock),
                        notifyMin: stock.notifyMin ? "1" : "0",
                      }
                    : {}),
                },
              } as never);
            }}
          />
        </View>

        <View style={styles.sectionDivider} />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" onPress={handleSave} />
      </View>

      <ConfirmationDialog ref={confirmationRef} />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    sectionDivider: {
      backgroundColor: Colors[colorScheme].border2,
      height: 12,
    },
    contentSection: {
      paddingHorizontal: 20,

    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingBottom: 24,
      paddingTop: 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
