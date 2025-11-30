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
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function MaterialVariantScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);
  const setVariants = useProductFormStore(state => state.setVariants);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [capitalPrice, setCapitalPrice] = useState("");
  const [isSubmit, setIsSubmit] = useState(false);

  const handleSave = () => {
    setIsSubmit(true);
    const priceNum = Number((price || "").replace(/[^0-9]/g, ""));

    setVariants(prev => [
      ...prev,
      {
        name,
        price: priceNum,
      },
    ]);

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

        <View style={styles.sectionDivider} />

        <View style={styles.contentSection}>
          <MenuRow
            title="Kelola Stok"
            rightText="Stok Tidak Aktif"
            showBottomBorder={false}
            variant="link"
            onPress={() => {
              // Untuk sekarang hanya meneruskan nilai dasar stok/varian jika sudah ada
              router.push({
                pathname: "/dashboard/recipe-and-materials/variant-stock",
                params: {
                  ...(name ? {name} : {}),
                  ...(price ? {price} : {}),
                  ...(capitalPrice ? {capitalPrice} : {}),
                },
              } as never);
            }}
          />
        </View>
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
