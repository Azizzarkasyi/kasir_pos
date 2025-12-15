import Checkbox from "@/components/checkbox";
import ConfirmationDialog, {
    ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import UnitPicker from "@/components/mollecules/unit-picker";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProductFormStore } from "@/stores/product-form-store";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StockSettingsScreen() {
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
    variantId,
    from,
    action,
  } = useLocalSearchParams<{
    variantId?: string;
    from?: string;
    action?: string;
  }>();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);
  const variants = useProductFormStore(state => state.variants);
  const setVariants = useProductFormStore(state => state.setVariants);
  const pendingVariant = useProductFormStore(state => state.pendingVariant);
  const setPendingVariant = useProductFormStore(state => state.setPendingVariant);

  const [offlineStock, setOfflineStock] = useState(0);
  const [unit, setUnit] = useState("");
  const [minStock, setMinStock] = useState(5);
  const [notifyMin, setNotifyMin] = useState(true);
  const [isSubmit, setIsSubmit] = useState(false);



  const handleSave = async () => {
    try {
      setIsSubmit(true);

      const buildStockFields = () => ({
        stock: offlineStock,
        is_stock_active: true,
        min_stock: minStock,
        notify_on_stock_ronouts: notifyMin,
        unit_id: unit,
      });


      if (variantId) {
        if (from === "add" || (from === "edit" && action === "add")) {
          const base =
            pendingVariant && pendingVariant.id === variantId
              ? pendingVariant
              : ({id: String(variantId)} as any);

          setPendingVariant({
            ...base,
            ...buildStockFields(),
          } as any);
        } else {
          setVariants(prev =>
            prev.map(v =>
              v.id === variantId
                ? {
                    ...v,
                    ...buildStockFields(),
                  }
                : v,
            ),
          );
        }
      }

      router.back();
    } catch (error: any) {
      console.error("❌ Failed to save variant stock:", error);
      setIsSubmit(false);
    }
  };

  useEffect(() => {
      console.log("variant_id",variantId)

    if (!variantId) return;

    const current =
      from === "add" || (from === "edit" && action === "add")
        ? pendingVariant && pendingVariant.id === variantId
          ? pendingVariant
          : null
        : variants.find(v => v.id === variantId) || null;

    if (!current) return;

    if (typeof current.stock === "number") {
      setOfflineStock(current.stock);
    }
    if (current.unit_id) {
      setUnit(current.unit_id);
    }
    if (typeof current.min_stock === "number") {
      setMinStock(current.min_stock);
    }
    if (typeof current.notify_on_stock_ronouts === "boolean") {
      setNotifyMin(current.notify_on_stock_ronouts);
    }
  }, [variantId, variants, from, pendingVariant]);

  const isDirty =
    offlineStock !== 0 || unit !== "" || minStock !== 0 || notifyMin;

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", e => {
      const action = e.data.action;
      // Jangan tampilkan modal ketika navigasi berasal dari router.replace (submit)
      if (action.type === "REPLACE" || !isDirty || isSubmit) {
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
      <Header title="Kelola Stok Varian" showHelp={false} />

      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingVertical: isTablet ? 44 : 40,
          paddingBottom: insets.bottom + (isTablet ? 96 : 80),
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <ThemedInput
          label="Stok Toko Offline"
          value={String(offlineStock)}
          onChangeText={v => setOfflineStock(Number(v))}
          numericOnly
        />

        <UnitPicker
          label="Pilih Satuan Unit"
          value={unit}
          onChange={setUnit}
        />

        <ThemedInput
          label="Minimum Stok"
          value={String(minStock)}
          onChangeText={v => setMinStock(Number(v))}
          numericOnly
        />

          <View style={styles.row}>
            <Checkbox checked={notifyMin} onChange={setNotifyMin} />
            <ThemedText style={styles.rowText}>
              Kirimkan notifikasi saat stok mencapai batas minimum
            </ThemedText>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton
          title="Simpan"
          variant="primary"
          onPress={handleSave}
          disabled={isSubmit}
        />
      </View>

      <ConfirmationDialog ref={confirmationRef} />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
      paddingHorizontal: isTablet ? 28 : 20,
    },
    sectionHeader: {
      marginTop: 12,
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 14 : 10,
      marginTop: isTablet ? 12 : 8,
    },
    rowText: {
      flex: 1,
      color: Colors[colorScheme].text,
      lineHeight: isTablet ? 26 : 20,
      fontSize: isTablet ? 18 : 14,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: Colors[colorScheme].icon,
      marginVertical: 16,
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: isTablet ? 28 : 20,
      paddingBottom: isTablet ? 22 : 16,
      paddingTop: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
