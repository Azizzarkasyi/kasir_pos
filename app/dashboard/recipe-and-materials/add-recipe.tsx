import RecipeIngredientItem from "@/components/atoms/recipe-ingredient-item";
import ComboInput from "@/components/combo-input";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import ConfirmPopup from "@/components/atoms/confirm-popup";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import assetApi, { prepareFileFromUri } from "@/services/endpoints/assets";
import recipeApi from "@/services/endpoints/recipes";
import { useRecipeFormStore } from "@/stores/recipe-form-store";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddProductScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const name = useRecipeFormStore(state => state.name);
  const category = useRecipeFormStore(state => state.category);
  const imageUri = useRecipeFormStore(state => state.imageUri);
  const ingredients = useRecipeFormStore(state => state.ingredients);
  const setName = useRecipeFormStore(state => state.setName);
  const setCategory = useRecipeFormStore(state => state.setCategory);
  const setImageUri = useRecipeFormStore(state => state.setImageUri);
  const removeIngredient = useRecipeFormStore(state => state.removeIngredient);
  const setEditingIngredientIndex = useRecipeFormStore(state => state.setEditingIngredientIndex);
  const resetForm = useRecipeFormStore(state => state.reset);

  // Reset form when entering add recipe page
  useEffect(() => {
    resetForm();
  }, []);

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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Nama resep harus diisi");
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert("Error", "Resep harus memiliki minimal 1 bahan");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: name.trim(),
        is_active: true,
        items: ingredients.map(ing => ({
          product_id: ing.ingredient.id,
          variant_id: ing.ingredient.variant_id,
          quantity: ing.amount,
          unit_id: ing.unit?.id,
        })),
      };

      console.log("📦 Creating recipe:", payload);

      const response = await recipeApi.createRecipe(payload);

      if (response.data) {
        console.log("✅ Recipe created successfully:", response.data);
        setShowSuccessPopup(true);
      }
    } catch (error: any) {
      console.error("❌ Failed to create recipe:", error);
      Alert.alert("Error", error.message || "Gagal menambahkan resep");
    } finally {
      setIsSaving(false);
    }
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
          paddingTop: isTablet ? 16 : 8,
          paddingBottom: insets.bottom + (isTablet ? 100 : 80),
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentSection}>
          <View style={styles.contentWrapper}>
            <ImageUpload
              uri={imageUri || undefined}
              initials={(name || "NP").slice(0, 2).toUpperCase()}
              onImageSelected={uri => setImageUri(uri)}
            />

            <View style={{ height: 24 }} />

            <ThemedInput
              label="Nama Resep"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.sectionDivider} />

            <ThemedText type="subtitle-2">Bahan</ThemedText>

            {ingredients.length > 0 ? (
              <>
                <View style={styles.sectionDivider} />
                {ingredients.map((v, idx) => (
                  <RecipeIngredientItem
                    key={idx}
                    initials={(v.ingredient.name || "VR")
                      .slice(0, 2)
                      .toUpperCase()}
                    name={v.ingredient.name}
                    variantName={v.ingredient.variant_name || ""}
                    count={v.amount}
                    unitName={v.unit?.name}
                    onPress={() => {
                      // Set editing index and navigate to ingredients page
                      setEditingIngredientIndex(idx);
                      router.push(
                        "/dashboard/recipe-and-materials/ingredients" as never
                      );
                    }}
                    onLongPress={() => {
                      // Show delete confirmation
                      setDeleteIndex(idx);
                      setShowDeleteConfirm(true);
                    }}
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
                  "/dashboard/recipe-and-materials/ingredients" as never
                )
              }
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.contentWrapper}>
          <ThemedButton title="Simpan" variant="primary" onPress={handleSave} />
        </View>
      </View>

      <ConfirmationDialog ref={confirmationRef} />
      <ConfirmPopup
        visible={showSuccessPopup}
        successOnly
        title="Berhasil"
        message="Resep berhasil ditambahkan"
        onConfirm={() => {
          setShowSuccessPopup(false);
          resetForm();
          router.back();
        }}
        onCancel={() => {
          setShowSuccessPopup(false);
          resetForm();
          router.back();
        }}
      />
      <ConfirmPopup
        visible={showDeleteConfirm}
        title="Hapus Bahan"
        message="Apakah Anda yakin ingin menghapus bahan ini dari resep?"
        onConfirm={() => {
          if (deleteIndex !== null) {
            removeIngredient(deleteIndex);
          }
          setShowDeleteConfirm(false);
          setDeleteIndex(null);
        }}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteIndex(null);
        }}
      />
    </View>
  );
}

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean
) =>
  StyleSheet.create({
    inlineCard: {
      marginTop: isTablet ? 12 : 8,
    },
    contentSection: {
      paddingHorizontal: isTablet ? 80 : 20,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    sectionDivider: {
      backgroundColor: Colors[colorScheme].tint,
      marginVertical: isTablet ? 24 : 16,
    },
    emptyStateContainer: {
      borderLeftWidth: isTablet ? 3 : 2,
      borderColor: Colors[colorScheme].icon,
      paddingVertical: isTablet ? 8 : 4,
      paddingHorizontal: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
      marginTop: isTablet ? 16 : 12,
    },
    emptyStateText: {
      fontSize: isTablet ? 18 : 14,
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
