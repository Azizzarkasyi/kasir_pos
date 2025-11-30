import ComboInput from "@/components/combo-input";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useRecipeFormStore} from "@/stores/recipe-form-store";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

type IngredientVariant = {
  id: string;
  name: string;
  price: number;
};

type IngredientOption = {
  label: string;
  value: string;
  unit: {id: string; name: string};
  variants?: IngredientVariant[];
};

export default function IngredientsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const addIngredient = useRecipeFormStore(state => state.addIngredient);

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const [ingredient, setIngredient] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [availableVariants, setAvailableVariants] = useState<
    IngredientVariant[]
  >([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  const ingredientOptions: IngredientOption[] = [
    {label: "Pilih Bahan", value: "", unit: {id: "", name: "-"}, variants: []},
    {
      label: "Gula",
      value: "gula",
      unit: {id: "gram", name: "Gram"},
      variants: [
        {id: "gula_pasir", name: "Gula Pasir", price: 10000},
        {id: "gula_merah", name: "Gula Merah", price: 12000},
      ],
    },
    {
      label: "Tepung Terigu",
      value: "tepung_terigu",
      unit: {id: "gram", name: "Gram"},
      variants: [{id: "tepung_all_purpose", name: "All Purpose", price: 9000}],
    },
    {
      label: "Minyak Goreng",
      value: "minyak_goreng",
      unit: {id: "ml", name: "Mililiter"},
      variants: [
        {id: "minyak_sawit", name: "Minyak Sawit", price: 15000},
        {id: "minyak_kelapa", name: "Minyak Kelapa", price: 20000},
      ],
    },
  ];

  const handleChangeIngredient = (text: string) => {
    setIngredient(text);
    const found = ingredientOptions.find(opt => opt.label === text);
    if (found) {
      setSelectedUnit(found.unit);
      const vars = found.variants ?? [];
      setAvailableVariants(vars);
      setSelectedVariantId(vars.length === 1 ? vars[0].id : "");
    } else {
      setSelectedUnit(null);
      setAvailableVariants([]);
      setSelectedVariantId("");
    }
  };

  const handleSave = () => {
    const selectedVariant = availableVariants.find(
      v => v.id === selectedVariantId
    );

    const qtyNum = Number(String(quantity).replace(/[^0-9]/g, ""));

    if (!ingredient || Number.isNaN(qtyNum) || qtyNum <= 0) {
      return;
    }

    addIngredient({
      ingredient: {
        id: ingredient,
        name: ingredient,
        ...(selectedVariant ? {variant_id: selectedVariant.id} : {}),
      },
      unit: selectedUnit
        ? {id: selectedUnit.id, name: selectedUnit.name}
        : undefined,
      amount: qtyNum,
    });

    router.back();
  };

  const isDirty = ingredient.trim() !== "" || quantity.trim() !== "";

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
        title="Tambah Bahan Resep"
        withNotificationButton={false}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 80,
          paddingVertical: 32,
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
          onChangeText={handleChangeIngredient}
          items={ingredientOptions.map(opt => ({
            label: opt.label,
            value: opt.value,
          }))}
        />
        {availableVariants.length > 1 && (
          <ComboInput
            label="Pilih Varian"
            value={
              availableVariants.find(v => v.id === selectedVariantId)?.name ??
              ""
            }
            onChangeText={text => {
              const found = availableVariants.find(v => v.name === text);
              setSelectedVariantId(found ? found.id : "");
            }}
            items={availableVariants.map(v => ({label: v.name, value: v.id}))}
          />
        )}
        <View style={styles.quantityRow}>
          <View style={styles.unitBox}>
            <Text style={styles.unitText}>{selectedUnit?.name ?? "-"}</Text>
          </View>

          <View style={styles.quantityInputWrapper}>
            <ThemedInput
              label="Jumlah Bahan"
              value={quantity}
              onChangeText={setQuantity}
              numericOnly
            />
          </View>
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
    quantityRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    unitBox: {
      minWidth: 72,
      height: 56,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors[colorScheme].border,
      justifyContent: "center",
      alignItems: "center",
    },
    unitText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    quantityInputWrapper: {
      flex: 1,
    },
  });
