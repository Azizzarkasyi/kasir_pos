import Checkbox from "@/components/checkbox";
import ComboInput from "@/components/combo-input";
import HeaderWithoutSidebar from "@/components/layouts/dashboard/header-without-sidebar";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useRouter} from "expo-router";

export default function StockSettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

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

  const handleSave = () => {
    const payload = {offlineStock, unit, minStock, notifyMin};
    console.log("Kelola stok", payload);
    router.back();
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <HeaderWithoutSidebar onPressBack={() => router.back()} title="Kelola Stok" />

      <KeyboardAwareScrollView
        contentContainerStyle={{paddingHorizontal: 20, paddingBottom: insets.bottom + 80}}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle-2">Stok Toko Offline</ThemedText>
        </View>

        <ThemedInput
          label="Stok Toko Offline"
          value={String(offlineStock)}
          onChangeText={v => setOfflineStock(Number(v.replace(/[^0-9]/g, "")))}
          keyboardType="number-pad"
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
          onChangeText={v => setMinStock(Number(v.replace(/[^0-9]/g, "")))}
          keyboardType="number-pad"
        />

        <View style={styles.row}>
          <Checkbox checked={notifyMin} onChange={setNotifyMin} />
          <ThemedText style={styles.rowText}>Kirimkan notifikasi saat stok mencapai batas minimum</ThemedText>
        </View>

        <View style={styles.sectionDivider} />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
      </View>
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