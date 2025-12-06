import Checkbox from "@/components/checkbox";
import ComboInput from "@/components/combo-input";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProductFormStore } from "@/stores/product-form-store";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
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

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const [offlineStock, setOfflineStock] = useState(0);
  const [unit, setUnit] = useState("pcs");
  const [minStock, setMinStock] = useState(0);
  const [notifyMin, setNotifyMin] = useState(false);

  const unitItems = [
    {label: "Pcs", value: "pcs"},
    {label: "Box", value: "box"},
    {label: "Kg", value: "kg"},
    {label: "L", value: "l"},
  ];

  const setStockInStore = useProductFormStore(state => state.setStock);

  const handleSave = () => {
    const payload = {offlineStock, unit, minStock, notifyMin};
    console.log("✅ Stock saved to store:", payload);

    setStockInStore({
      offlineStock,
      unit,
      minStock,
      notifyMin,
    });

    router.back();
  };

  const isDirty =
    offlineStock !== 0 || unit !== "pcs" || minStock !== 0 || notifyMin;

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

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header
        showHelp={false}
        title="Pengaturan Stok Bahan"
        withNotificationButton={false}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 80 : 20,
          paddingVertical: isTablet ? 40 : 32,
          paddingBottom: insets.bottom + (isTablet ? 100 : 80),
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <ThemedInput
            label="Stok "
            value={String(offlineStock)}
            onChangeText={v => setOfflineStock(Number(v))}
            numericOnly
          />

          <ComboInput
            label="Pilih Satuan Unit"
            value={unit}
            onChangeText={setUnit}
            items={unitItems}
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
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    sectionHeader: {
      marginTop: isTablet ? 16 : 12,
      marginBottom: isTablet ? 12 : 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 14 : 10,
      marginTop: isTablet ? 12 : 8,
    },
    rowText: {
      flex: 1,
      fontSize: isTablet ? 18 : 14,
      lineHeight: isTablet ? 24 : 16,
      color: Colors[colorScheme].text,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: Colors[colorScheme].icon,
      marginVertical: isTablet ? 24 : 16,
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
