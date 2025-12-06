import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import MenuRow from "@/components/menu-row";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useProductFormStore} from "@/stores/product-form-store";
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, View, useWindowDimensions} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function VariantScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
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
    variantId: qsVariantId,
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
    variantId?: string;
  }>();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);
  const variants = useProductFormStore(state => state.variants);
  const setVariants = useProductFormStore(state => state.setVariants);
  const pendingVariant = useProductFormStore(state => state.pendingVariant);
  const setPendingVariant = useProductFormStore(
    state => state.setPendingVariant
  );
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
        offlineStock: qsOfflineStock
          ? Number(String(qsOfflineStock).replace(/[^0-9]/g, ""))
          : 0,
        unit: qsUnit ? String(qsUnit) : "pcs",
        minStock: qsMinStock
          ? Number(String(qsMinStock).replace(/[^0-9]/g, ""))
          : 0,
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
        const parsedCapital = Number(
          String(qsCapitalPrice).replace(/[^0-9]/g, "")
        );
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
    qsName,
    qsPrice,
    qsEnableCostBarcode,
    qsCapitalPrice,
    qsBarcode,
  ]);

  useEffect(() => {
    if (qsFrom === "edit") {
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
        const parsedCapital = Number(
          String(qsCapitalPrice).replace(/[^0-9]/g, "")
        );
        if (!Number.isNaN(parsedCapital)) {
          setCapitalPrice(parsedCapital);
        }
      }
      if (qsBarcode) {
        setBarcode(String(qsBarcode));
      }
    }
  }, [qsFrom, qsName, qsPrice, qsEnableCostBarcode, qsCapitalPrice, qsBarcode]);

  const handleSave = () => {
    setIsSubmit(true);
    const priceNum = Number((price || "").replace(/[^0-9]/g, ""));

    if (qsFrom === "edit" && qsVariantId) {
      setVariants(prev =>
        prev.map(v =>
          v.id === qsVariantId
            ? {
                ...v,
                name,
                capital_price: capitalPrice,
                price: priceNum,
                // Keep existing stock fields from store (already updated by variant-stock)
                // Don't override with local state
              }
            : v
        )
      );
    } else {
      const baseStockFields = (() => {
        if (pendingVariant && pendingVariant.id) {
          return {
            stock: pendingVariant.stock,
            is_stock_active: pendingVariant.is_stock_active,
            min_stock: pendingVariant.min_stock,
            notify_on_stock_ronouts: pendingVariant.notify_on_stock_ronouts,
            unit_id: pendingVariant.unit_id,
          };
        }
        return {}; // No stock fields if not set
      })();

      const generatedId = pendingVariant?.id ?? `${Date.now()}`;
      setVariants(prev => [
        ...prev,
        {
          id: generatedId,
          name,
          price: priceNum,
          ...baseStockFields,
        },
      ]);
      setPendingVariant(null);
    }

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
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Variasi Bahan" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + (isTablet ? 96 : 80),
          paddingVertical: isTablet ? 16 : 12,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={[styles.contentSection, {paddingVertical: 12}]}>
            <ThemedInput
              label="Nama Variasi"
              size="md"
              value={name}
              onChangeText={setName}
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

        <View style={styles.contentWrapper}>
          <View style={styles.contentSection}>
            <MenuRow
              title="Kelola Stok"
              rightText={(() => {
                // Get stock from store based on variant ID
                if (qsFrom === "edit" && qsVariantId) {
                  const currentVariant = variants.find(
                    v => v.id === qsVariantId
                  );
                  if (currentVariant && currentVariant.is_stock_active) {
                    return `Stok Aktif (${currentVariant.stock || 0})`;
                  }
                } else if (qsFrom === "add" && pendingVariant) {
                  if (pendingVariant.is_stock_active) {
                    return `Stok Aktif (${pendingVariant.stock || 0})`;
                  }
                }
                return "Stok Tidak Aktif";
              })()}
              showBottomBorder={false}
              variant="link"
              onPress={() => {
                let targetVariantId = qsVariantId as string | undefined;

                if (!targetVariantId) {
                  const priceNum = Number((price || "").replace(/[^0-9]/g, ""));

                  const base =
                    pendingVariant && pendingVariant.id
                      ? pendingVariant
                      : {
                          id: `${Date.now()}`,
                        };

                  const updated = {
                    ...base,
                    name,
                    price: priceNum,
                  };

                  setPendingVariant(updated as any);
                  targetVariantId = String(updated.id);
                }

                router.push({
                  pathname: "/dashboard/recipe-and-materials/variant-stock",
                  params: {
                    variantId: String(targetVariantId),
                    from: qsFrom ?? "add",
                  },
                } as never);
              }}
            />
          </View>
        </View>

        <View style={styles.sectionDivider} />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" onPress={handleSave} />
        {qsVariantId ? (
          <View style={{marginTop: 8}}>
            <ThemedButton
              title="Hapus Varian"
              variant="secondary"
              onPress={() => {
                if (qsVariantId) {
                  setVariants(prev => prev.filter(v => v.id !== qsVariantId));
                }
                router.back();
              }}
            />
          </View>
        ) : null}
      </View>

      <ConfirmationDialog ref={confirmationRef} />
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
    sectionDivider: {
      backgroundColor: Colors[colorScheme].border2,
      height: isTablet ? 14 : 12,
    },
    contentSection: {
      paddingHorizontal: isTablet ? 28 : 20,
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: isTablet ? 28 : 20,
      paddingBottom: isTablet ? 28 : 24,
      paddingTop: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
