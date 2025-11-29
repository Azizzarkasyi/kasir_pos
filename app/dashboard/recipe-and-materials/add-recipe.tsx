import RecipeIngredientItem from "@/components/atoms/recipe-ingredient-item";
import ComboInput from "@/components/combo-input";
import ConfirmationDialog, { ConfirmationDialogHandle } from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRecipeFormStore } from "@/stores/recipe-form-store";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddProductScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const name = useRecipeFormStore(state => state.name);
  const category = useRecipeFormStore(state => state.category);
  const imageUri = useRecipeFormStore(state => state.imageUri);
  const ingredients = useRecipeFormStore(state => state.ingredients);
  const setName = useRecipeFormStore(state => state.setName);
  const setCategory = useRecipeFormStore(state => state.setCategory);
  const setImageUri = useRecipeFormStore(state => state.setImageUri);
  const resetForm = useRecipeFormStore(state => state.reset);


  const isDirty =
    name.trim() !== "" ||
    category.trim() !== "" ||
    imageUri !== null ||
    ingredients.length > 0;

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
      category,
      imageUri,
      ingredients,
    };
    console.log("Tambah resep", payload);
    resetForm();
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header
        showHelp={false}
        title="Tambah Resep"
        withNotificationButton={false}
      />
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

        <ThemedInput label="Nama Resep" value={name} onChangeText={setName} />


        <ComboInput
          label="Pilih Kategori"
          value={category}
          onChangeText={setCategory}
          items={[
            { label: "Pilih Kategori", value: "" },
            { label: "Umum", value: "umum" },
            { label: "Minuman", value: "minuman" },
            { label: "Makanan", value: "makanan" },
          ]}
        />

        <View style={styles.sectionDivider} />

        <ThemedText type="subtitle-2">Bahan</ThemedText>

        {ingredients.length > 0 ? (
          <>
            <View style={styles.sectionDivider} />
            {ingredients.map((v, idx) => (
              <RecipeIngredientItem
                key={idx}
                initials={(v.ingredient.name || "VR").slice(0, 2).toUpperCase()}
                name={v.ingredient.name}
                variantName={v.ingredient.name}
                count={v.amount}
                unitName={v.unit?.name}
                onPress={() => { }}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyStateContainer}>
            <ThemedText type="default">
              Belum ada bahan, tap "Tambah Bahan" untuk menambahkan.
            </ThemedText>
          </View>
        )}

        <View style={styles.sectionDivider} />

        <ThemedButton
          title="Tambah Bahan"
          variant="secondary"
          onPress={() =>
            router.push(
              "/dashboard/recipe-and-materials/ingredients" as never,
            )
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
    emptyStateContainer: {
      borderLeftWidth: 2,
      borderColor: Colors[colorScheme].icon,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: Colors[colorScheme].background,
      marginTop: 12,
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
