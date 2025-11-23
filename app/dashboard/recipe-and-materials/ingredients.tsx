import ComboInput from "@/components/combo-input";
import ConfirmationDialog, { ConfirmationDialogHandle } from "@/components/drawers/confirmation-dialog";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function IngredientsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const [ingredient, setIngredient] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSave = () => {
    router.replace({
      pathname: "/dashboard/recipe-and-materials/add-recipe",
      params: {
        ingredient_name: ingredient,
        ingredient_qty: String(
          Number((quantity || "").replace(/[^0-9]/g, "")),
        ),
      },
    } as never);
  };

  const isDirty =
    ingredient.trim() !== "" ||
    quantity.trim() !== "";

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
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 80,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ComboInput
          label="Pilih Bahan"
          value={ingredient}
          onChangeText={setIngredient}
          items={[
            {label: "Pilih Bahan", value: ""},
            {label: "Gula", value: "gula"},
            {label: "Tepung Terigu", value: "tepung_terigu"},
            {label: "Minyak Goreng", value: "minyak_goreng"},
          ]}
        />
        <ThemedInput
          label="Jumlah Bahan"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
        />
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
