import Checkbox from "@/components/checkbox";
import ComboInput from "@/components/combo-input";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useProductFormStore} from "@/stores/product-form-store";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function StockSettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const stockFromStore = useProductFormStore(state => state.stock);
  const setStockInStore = useProductFormStore(state => state.setStock);

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const [offlineStock, setOfflineStock] = useState(
    stockFromStore?.offlineStock ?? 0
  );
  const [unit, setUnit] = useState(stockFromStore?.unit ?? "pcs");
  const [minStock, setMinStock] = useState(stockFromStore?.minStock ?? 0);
  const [notifyMin, setNotifyMin] = useState(
    stockFromStore?.notifyMin ?? false
  );
  const [isSubmit, setIsSubmit] = useState(false);

  const unitItems = [
    {label: "Pcs", value: "pcs"},
    {label: "Box", value: "box"},
    {label: "Kg", value: "kg"},
    {label: "L", value: "l"},
  ];

  const handleSave = () => {
    setIsSubmit(true);
    const payload = {offlineStock, unit, minStock, notifyMin};
    console.log("Kelola stok", payload);
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
      <Header title="Kelola Stok" showHelp={false} />

      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 40,
          paddingBottom: insets.bottom + 80,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedInput
          label="Stok Toko Offline"
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

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    sectionHeader: {
      marginTop: 12,
      marginBottom: 8,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 8,
    },
    rowText: {
      flex: 1,
      color: Colors[colorScheme].text,
      lineHeight: 20,
      fontSize: 14,
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
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
