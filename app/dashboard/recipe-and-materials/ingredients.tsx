import ComboInput from "@/components/combo-input";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
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

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

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
      // Set unit (default to pcs if not available)
      setSelectedUnit({id: "pcs", name: "Pcs"});

      // Set available variants
      const vars = found.variants || [];
      setAvailableVariants(vars);
      setSelectedVariantId(vars.length === 1 ? vars[0].id : "");
    } else {
      console.log("❌ Product not found in list");
      setSelectedUnit(null);
      setAvailableVariants([]);
      setSelectedVariantId("");
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
    });

    if (!selectedProduct || Number.isNaN(qtyNum) || qtyNum <= 0) {
      console.log("❌ Validation failed");
      return;
    }

    addIngredient({
      ingredient: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        variant_id: selectedVariant?.id,
      },
      unit: selectedUnit
        ? {id: selectedUnit.id, name: selectedUnit.name}
        : undefined,
      amount: qtyNum,
    });

    console.log("✅ Ingredient added:", {
      productId: selectedProduct.id,
      product: selectedProduct.name,
      variantId: selectedVariant?.id,
      variant: selectedVariant?.name,
      quantity: qtyNum,
    });

    router.back();
  };

  const isDirty = selectedProductId !== "" || quantity.trim() !== "";

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
              value={
                ingredients.find(p => p.id === selectedProductId)?.name ?? ""
              }
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
                  setSelectedVariantId(found ? found.id : "");
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

      <ConfirmationDialog ref={confirmationRef} />
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
