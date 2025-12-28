import ComboInput from "@/components/combo-input";
import ConfirmPopup from "@/components/atoms/confirm-popup";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import productApi from "@/services/endpoints/products";
import {useRecipeFormStore} from "@/stores/recipe-form-store";
import {Product, ProductVariant} from "@/types/api";
import {useNavigation, useRouter} from "expo-router";
import React, {useEffect, useRef, useState} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
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
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const addIngredient = useRecipeFormStore(state => state.addIngredient);
  const updateIngredient = useRecipeFormStore(state => state.updateIngredient);
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
  const [availableVariants, setAvailableVariants] = useState<ProductVariant[]>(
    []
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

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
            response.data.map((p: Product) => ({id: p.id, name: p.name}))
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
            if (found) {
              setSelectedUnit({id: "pcs", name: "Pcs"});
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
        // Get unit from variant
        const variantUnit = vars[0].unit;
        if (variantUnit) {
          setSelectedUnit({id: variantUnit.id, name: variantUnit.name});
        } else {
          setSelectedUnit({id: "pcs", name: "Pcs"});
        }
      } else if (vars.length > 1) {
        setSelectedVariantId("");
        setSelectedUnit({id: "pcs", name: "Pcs"});
      } else {
        setSelectedUnit({id: "pcs", name: "Pcs"});
      }
    } else {
      console.log("❌ Product not found in list");
      setSelectedUnit(null);
      setAvailableVariants([]);
      setSelectedVariantId("");
    }
  };

  // Update unit when variant changes
  const handleChangeVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    const variant = availableVariants.find(v => v.id === variantId);
    if (variant?.unit) {
      setSelectedUnit({id: variant.unit.id, name: variant.unit.name});
    }
  };

  const handleSave = () => {
    const selectedProduct = ingredients.find(p => p.id === selectedProductId);
    const selectedVariant = availableVariants.find(
      v => v.id === selectedVariantId
    );

    const qtyNum = Number(String(quantity).replace(/[^0-9]/g, ""));

    console.log("🔍 Debug handleSave:", {
      selectedProductId,
      selectedProduct: selectedProduct
        ? {id: selectedProduct.id, name: selectedProduct.name}
        : null,
      selectedVariantId,
      selectedVariant: selectedVariant
        ? {id: selectedVariant.id, name: selectedVariant.name}
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
        ? {id: selectedUnit.id, name: selectedUnit.name}
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

  const isDirty = selectedProductId !== "" || quantity.trim() !== "";

  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", e => {
      // Clear editing index when leaving
      setEditingIngredientIndex(null);
      
      if (!isDirty) {
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
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
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
              style={{marginTop: 16, color: Colors[colorScheme].icon}}
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
                {label: "Pilih Bahan", value: ""},
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
                items={availableVariants.map(v => ({
                  label: v.name,
                  value: v.id,
                }))}
              />
            )}
          </>
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
        <View style={styles.contentWrapper}>
          <ThemedButton title="Simpan" onPress={handleSave} />
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
      alignItems: "center",
      gap: isTablet ? 16 : 12,
    },
    unitBox: {
      minWidth: isTablet ? 100 : 72,
      height: isTablet ? 64 : 56,
      paddingHorizontal: isTablet ? 16 : 12,
      borderWidth: 1,
      borderRadius: isTablet ? 12 : 8,
      borderColor: Colors[colorScheme].border,
      justifyContent: "center",
      alignItems: "center",
    },
    unitText: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].text,
    },
    quantityInputWrapper: {
      flex: 1,
    },
  });
