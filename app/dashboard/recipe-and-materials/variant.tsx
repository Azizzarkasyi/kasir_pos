import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import MenuRow from "@/components/menu-row";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProductFormStore } from "@/stores/product-form-store";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MaterialVariantScreen() {
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
  const setVariants = useProductFormStore(state => state.setVariants);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [capitalPrice, setCapitalPrice] = useState("");
  const [stock, setStock] = useState<{
    offlineStock: number;
    unit: string;
    minStock: number;
    notifyMin: boolean;
  } | null>(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const {
    offlineStock: qsOfflineStock,
    unit: qsUnit,
    minStock: qsMinStock,
    notifyMin: qsNotifyMin,
  } = useLocalSearchParams<{
    offlineStock?: string;
    unit?: string;
    minStock?: string;
    notifyMin?: string;
  }>();

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
    }
  }, [qsOfflineStock, qsUnit, qsMinStock, qsNotifyMin]);

  const handleSave = () => {
    setIsSubmit(true);
    const priceNum = Number((price || "").replace(/[^0-9]/g, ""));
    const capitalPriceNum = Number((capitalPrice || "").replace(/[^0-9]/g, ""));

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

    console.log("✅ Variant saved to store");
    router.back();
  };

  const isDirty =
    name.trim() !== "" || price.trim() !== "" || capitalPrice.trim() !== "";

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
      <Header
        showHelp={false}
        title="Tambah Varian Bahan"
        withNotificationButton={false}
      />
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
        <View style={[styles.contentSection, {paddingVertical: 12}]}>
          <View style={styles.contentWrapper}>
            <ThemedInput
              label="Nama Varian"
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
            <ThemedInput
              label="Harga Modal"
              value={capitalPrice}
              size="md"
              onChangeText={setCapitalPrice}
              numericOnly
            />
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.contentSection}>
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
              onPress={() => {
                  router.push({
                  pathname: "/dashboard/recipe-and-materials/variant-stock",
                  params: {
                    ...(name ? {name} : {}),
                    ...(price ? {price} : {}),
                    ...(capitalPrice ? {capitalPrice} : {}),
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
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.contentWrapper}>
          <ThemedButton title="Simpan" onPress={handleSave} />
        </View>
      </View>

      <ConfirmationDialog ref={confirmationRef} />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    sectionDivider: {
      backgroundColor: Colors[colorScheme].border2,
      height: isTablet ? 16 : 12,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    contentSection: {
      paddingHorizontal: isTablet ? 80 : 20,
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: isTablet ? 80 : 20,
      paddingBottom: isTablet ? 32 : 24,
      paddingTop: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
