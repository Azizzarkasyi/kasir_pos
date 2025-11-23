import ComboInput from "@/components/combo-input";
import ConfirmationDialog, { ConfirmationDialogHandle } from "@/components/drawers/confirmation-dialog";
import ImageUpload from "@/components/image-upload";
import MenuRow from "@/components/menu-row";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditMaterialScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [capitalPrice, setCapitalPrice] = useState(0);
  const onCapitalPriceChange = (val: number) => setCapitalPrice(val);
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    price?: string;
    brand?: string;
    imageUri?: string;
  }>();

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
    if (params.imageUri !== undefined && params.imageUri !== "") {
      setImageUri(String(params.imageUri));
    }
  }, [params]);

  const isDirty =
    name.trim() !== "" ||
    price.trim() !== "" ||
    brand.trim() !== "" ||
    imageUri !== null;

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
      imageUri,
    };
    console.log("Tambah produk", payload);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
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

        <View style={{ height: 24 }} />

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
            { label: "Pilih Merk", value: "" },
            { label: "Tidak ada merk", value: "none" },
            { label: "Qasir", value: "qasir" },
          ]}
        />
        <ThemedInput
          label="Harga Modal"
          value={String(capitalPrice)}
          onChangeText={v =>
            onCapitalPriceChange(
              Number((v || "").replace(/[^0-9]/g, "")),
            )
          }
          keyboardType="number-pad"
          placeholder="Harga Modal"
          placeholderTextColor={Colors[colorScheme].icon}
          inputContainerStyle={{
            backgroundColor: colorScheme === "dark" ? "#1F1F1F" : "#FFFFFF",
          }}

        />


        <MenuRow
          title="Kelola Stok"
          rightText="Stok Tidak Aktif"
          variant="link"
          onPress={() =>
            router.push("/dashboard/recipe-and-materials/stock" as never)
          }
        />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
      </View>

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
      backgroundColor: Colors[colorScheme].tint,
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
