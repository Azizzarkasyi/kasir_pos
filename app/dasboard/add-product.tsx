import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import Toggle from "@/components/toggle";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";
import React, {useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function AddProductScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [enableCostBarcode, setEnableCostBarcode] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

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
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Tambah Produk" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 20,
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

        <View style={{height: 24}} />

        <ThemedInput label="Nama Produk" value={name} onChangeText={setName} />
        <ThemedInput
          label="Harga Jual"
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
        />

        <ComboInput
          label="Pilih Merk"
          value={brand}
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
          onChangeText={setCategory}
          items={[
            {label: "Pilih Kategori", value: ""},
            {label: "Umum", value: "umum"},
            {label: "Minuman", value: "minuman"},
            {label: "Makanan", value: "makanan"},
          ]}
        />

        <View style={styles.sectionDivider} />

        <Toggle
          label="Produk Favorit"
          badgeText="Baru"
          description="Tampilkan produk di kategori terdepan."
          value={favorite}
          onValueChange={setFavorite}
        />

        <Toggle
          label="Atur Harga Modal dan Barcode"
          value={enableCostBarcode}
          onValueChange={setEnableCostBarcode}
        />

        <TouchableOpacity style={styles.manageRow}>
          <ThemedText style={styles.manageTitle}>Kelola Stok</ThemedText>
          <View style={styles.manageRight}>
            <ThemedText style={styles.manageStatus}>
              Stok Tidak Aktif
            </ThemedText>
            <Ionicons
              name="chevron-forward-outline"
              size={18}
              color={Colors[colorScheme].icon}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionDivider} />

        <ThemedButton title="Tambah Varian" variant="secondary" disabled />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
      </View>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    sectionDivider: {
      height: 1,
      backgroundColor: Colors[colorScheme].icon,
      marginVertical: 16,
    },
    manageRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
    },
    manageTitle: {
      fontWeight: "700",
    },
    manageRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    manageStatus: {
      color: Colors[colorScheme].icon,
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
