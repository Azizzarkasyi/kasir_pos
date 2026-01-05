import ConfirmPopup from "@/components/atoms/confirm-popup";
import ComboInput from "@/components/combo-input";
import UnitPicker from "@/components/mollecules/unit-picker";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import { useRecipeFormStore } from "@/stores/recipe-form-store";
import { UNITS, UnitType } from "@/constants/units";
import { Product, ProductVariant } from "@/types/api";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IngredientVariant = {
  id: string;
  name: string;
  price: number;
};

type IngredientOption = {
  label: string;
  value: string;
  unit: { id: string; name: string };
  variants?: IngredientVariant[];
};

export default function IngredientsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const addIngredient = useRecipeFormStore(state => state.addIngredient);
  const updateIngredient = useRecipeFormStore(state => state.updateIngredient);
  const removeIngredient = useRecipeFormStore(state => state.removeIngredient);
  const editingIndex = useRecipeFormStore(state => state.editingIngredientIndex);
  const storeIngredients = useRecipeFormStore(state => state.ingredients);
  const setEditingIngredientIndex = useRecipeFormStore(state => state.setEditingIngredientIndex);

  const isEditMode = editingIndex !== null;
  const editingIngredient = isEditMode ? storeIngredients[editingIndex] : null;



  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [unitTypeFilter, setUnitTypeFilter] = useState<UnitType | undefined>(undefined);
  const [availableVariants, setAvailableVariants] = useState<ProductVariant[]>(
    []
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [isSubmit, setIsSubmit] = useState(false);

  // Load ingredients from API
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIsLoading(true);
        // Use getIngredients instead of getProducts to filter is_ingredient=true
        const response = await productApi.getIngredients();

        if (response.data) {
          console.log("📦 Total ingredients loaded:", response.data.length);
          console.log(
            "📦 First 3 ingredients sample:",
            response.data.slice(0, 3).map((p: Product) => ({
              id: p.id,
              name: p.name,
              is_ingredient: p.is_ingredient,
            }))
          );

          setIngredients(response.data);
          console.log(
            "✅ Loaded",
            response.data.length,
            "ingredients for recipe:",
            response.data.map((p: Product) => ({ id: p.id, name: p.name }))
          );

          if (response.data.length === 0) {
            console.warn(
              "⚠️ No ingredients found. Make sure products have is_ingredient=true"
            );
          }

          // Pre-fill data if in edit mode
          if (editingIngredient && response.data.length > 0) {
            const productId = editingIngredient.ingredient.id;
            setSelectedProductId(productId);
            setQuantity(String(editingIngredient.amount));

            const found = response.data.find((p: Product) => p.id === productId);
            console.log("found", found?.variants?.[0]?.unit);
            if (found) {
              // Use unit from editing ingredient if available, otherwise use variant unit
              const unitToUse = editingIngredient.unit || {
                id: found?.variants?.[0]?.unit_id || "",
                name: found?.variants?.[0]?.unit?.name || "",
              };
              setSelectedUnit(unitToUse);

              // Set unit type filter based on variant unit
              const variantUnit = UNITS.find(u => u.id === unitToUse.id);
              setUnitTypeFilter(variantUnit?.type);

              const vars = found.variants || [];
              setAvailableVariants(vars);
              if (editingIngredient.ingredient.variant_id) {
                setSelectedVariantId(editingIngredient.ingredient.variant_id);
              } else if (vars.length === 1) {
                setSelectedVariantId(vars[0].id);
              }
            }
          }
        }
      } catch (error: any) {
        console.error("❌ Failed to load ingredients:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIngredients();
  }, []);

  // Helper to resolve unit from variant
  const resolveUnit = (variant: ProductVariant | undefined) => {
    if (!variant) return null;

    // 1. Try to get full unit object if available
    if (variant.unit) {
      return { id: variant.unit.id, name: variant.unit.name };
    }

    // 2. Fallback to unit_id mapping
    if (variant.unit_id) {
      const knownUnit = UNITS.find(u => u.id === variant.unit_id);
      if (knownUnit) {
        return { id: knownUnit.id, name: knownUnit.name };
      }
    }

    return { id: "pcs", name: "Pcs" };
  };

  const handleChangeIngredient = (productId: string) => {
    console.log("🔍 Selecting product:", productId);
    setSelectedProductId(productId);
    const found = ingredients.find(p => p.id === productId);

    if (found) {
      console.log("✅ Product found:", {
        id: found.id,
        name: found.name,
        variants: found.variants?.length,
      });

      // Set available variants
      const vars = found.variants || [];
      setAvailableVariants(vars);

      // Auto-select variant if only one, and get unit from it
      if (vars.length === 1) {
        setSelectedVariantId(vars[0].id);
        const resolvedUnit = resolveUnit(vars[0]);
        if (resolvedUnit) {
          setSelectedUnit(resolvedUnit);
          // Set unit type filter
          const unitInfo = UNITS.find(u => u.id === resolvedUnit.id);
          setUnitTypeFilter(unitInfo?.type);
        }
      } else if (vars.length > 1) {
        setSelectedVariantId("");
        setSelectedUnit({ id: "pcs", name: "Pcs" });
        setUnitTypeFilter("count"); // Default to count for multiple variants until selected
      } else {
        setSelectedUnit({ id: "pcs", name: "Pcs" });
        setUnitTypeFilter("count");
      }
    } else {
      console.log("❌ Product not found in list");
      setSelectedUnit(null);
      setAvailableVariants([]);
      setSelectedVariantId("");
      setUnitTypeFilter(undefined);
    }
  };

  // Update unit when variant changes
  const handleChangeVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = availableVariants.find(v => v.id === variantId);
    const resolvedUnit = resolveUnit(variant);
    if (resolvedUnit) {
      setSelectedUnit(resolvedUnit);
      // Set unit type filter
      const unitInfo = UNITS.find(u => u.id === resolvedUnit.id);
      setUnitTypeFilter(unitInfo?.type);
    }
  };

  const handleSave = () => {
    setIsSubmit(true);
    const selectedProduct = ingredients.find(p => p.id === selectedProductId);
    const selectedVariant = availableVariants.find(
      v => v.id === selectedVariantId
    );

    const qtyNum = Number(String(quantity).replace(/[^0-9]/g, ""));

    console.log("🔍 Debug handleSave:", {
      selectedProductId,
      selectedProduct: selectedProduct
        ? { id: selectedProduct.id, name: selectedProduct.name }
        : null,
      selectedVariantId,
      selectedVariant: selectedVariant
        ? { id: selectedVariant.id, name: selectedVariant.name }
        : null,
      quantity: qtyNum,
      isEditMode,
      editingIndex,
    });

    if (!selectedProduct || Number.isNaN(qtyNum) || qtyNum <= 0) {
      console.log("❌ Validation failed");
      return;
    }

    const ingredientData = {
      ingredient: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        variant_id: selectedVariant?.id,
        variant_name: selectedVariant?.name,
      },
      unit: selectedUnit
        ? { id: selectedUnit.id, name: selectedUnit.name }
        : undefined,
      amount: qtyNum,
    };

    if (isEditMode && editingIndex !== null) {
      updateIngredient(editingIndex, ingredientData);
      console.log("✅ Ingredient updated:", ingredientData);
    } else {
      addIngredient(ingredientData);
      console.log("✅ Ingredient added:", ingredientData);
    }

    // Clear editing index
    setEditingIngredientIndex(null);

    router.back();
  };

  const handleDelete = () => {
    if (isEditMode && editingIndex !== null) {
      setIsSubmit(true);
      removeIngredient(editingIndex);
      setEditingIngredientIndex(null);
      router.back();
    }
  };

  const isDirty = selectedProductId !== "" || quantity.trim() !== "";

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", e => {
      // Clear editing index when leaving
      setEditingIngredientIndex(null);

      if (!isDirty || isSubmit) {
        return;
      }

      const action = e.data.action;
      e.preventDefault();

      setPendingNavigation(action);
      setShowConfirmation(true);
    });

    return sub;
  }, [navigation, isDirty]);

  const handleConfirmExit = () => {
    setShowConfirmation(false);
    setEditingIngredientIndex(null);
    if (pendingNavigation) {
      navigation.dispatch(pendingNavigation);
    }
  };

  const handleCancelExit = () => {
    setShowConfirmation(false);
    setPendingNavigation(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header
        showHelp={false}
        title={isEditMode ? "Edit Bahan Resep" : "Tambah Bahan Resep"}
        withNotificationButton={false}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 80 : 20,
          paddingBottom: insets.bottom + (isTablet ? 100 : 80),
          paddingVertical: isTablet ? 40 : 32,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.contentWrapper}>
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme].primary}
            />
            <ThemedText
              style={{ marginTop: 16, color: Colors[colorScheme].icon }}
            >
              Memuat daftar bahan...
            </ThemedText>
          </View>
        ) : (
          <>
            <ComboInput
              label="Pilih Bahan"
              disableAutoComplete
              value={
                ingredients.find(p => p.id === selectedProductId)?.name ?? ""
              }
              onChange={item => {
                if (item.value) {
                  handleChangeIngredient(item.value);
                }
              }}
              onChangeText={text => {
                const found = ingredients.find(p => p.name === text);
                if (found) {
                  handleChangeIngredient(found.id);
                }
              }}
              items={[
                { label: "Pilih Bahan", value: "" },
                ...ingredients.map(ing => ({
                  label: ing.name,
                  value: ing.id,
                })),
              ]}
            />
            {availableVariants.length > 1 && (
              <ComboInput
                label="Pilih Varian"
                value={
                  availableVariants.find(v => v.id === selectedVariantId)
                    ?.name ?? ""
                }
                onChangeText={text => {
                  const found = availableVariants.find(v => v.name === text);
                  if (found) {
                    handleChangeVariant(found.id);
                  }
                }}
                disableAutoComplete
                items={availableVariants.map(v => ({
                  label: v.name,
                  value: v.id,
                }))}
              />
            )}
          </>
        )}
        <View style={styles.quantityRow}>
          <View style={styles.unitInputContainer}>
            <UnitPicker
              label="Unit"
              value={selectedUnit?.id || ""}
              onChange={(unitId) => {
                console.log("🔄 UnitPicker onChange triggered:", unitId);
                const unit = UNITS.find(u => u.id === unitId);
                console.log("🔄 Found unit in UNITS:", unit);
                if (unit) {
                  console.log("🔄 Setting selectedUnit to:", { id: unit.id, name: unit.name });
                  setSelectedUnit({ id: unit.id, name: unit.name });
                } else {
                  console.log("❌ Unit not found in UNITS constant");
                }
              }}
              usePredefined={true}
              filterByType={unitTypeFilter}
            />
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
        <View style={styles.contentWrapper}>
          <ThemedButton title="Simpan" onPress={handleSave} />
          {isEditMode && (
            <View style={{ marginTop: 8 }}>
              <ThemedButton
                title="Hapus Bahan"
                variant="secondary"
                onPress={handleDelete}
              />
            </View>
          )}
        </View>
      </View>

      <ConfirmPopup
        visible={showConfirmation}
        title="Konfirmasi"
        message="Pastikan data sudah benar. Apakah Anda yakin ingin menyimpannya?"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
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
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
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
    quantityRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: isTablet ? 16 : 12,
    },
    unitInputContainer: {
      width: isTablet ? 160 : 140,
    },
    quantityInputWrapper: {
      flex: 1,
    },
  });
