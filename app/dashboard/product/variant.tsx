import ComboInput from "@/components/combo-input";
import CostBarcodeFields from "@/components/cost-barcode-fields";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import MenuRow from "@/components/menu-row";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { recipeApi } from "@/services";
import { useProductFormStore } from "@/stores/product-form-store";
import { useVariantBarcodeStore } from "@/stores/variant-barcode-store";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VariantScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    offlineStock: qsOfflineStock,
    unit: qsUnit,
    minStock: qsMinStock,
    editAction: qsEditActions,
    notifyMin: qsNotifyMin,
    from: qsFrom,
    name: qsName,
    price: qsPrice,
    brand: qsBrand,
    category: qsCategory,
    favorite: qsFavorite,
    enableCostBarcode: qsEnableCostBarcode,
    imageUri: qsImageUri,
    capitalPrice: qsCapitalPrice,
    barcode: qsBarcode,
    recipe: qsRecipe,
    variants: qsVariants,
    variantId: qsVariantId,
  } = useLocalSearchParams<{
    offlineStock?: string;
    unit?: string;
    minStock?: string;
    notifyMin?: string;
    editAction?: string;
    from?: string;
    name?: string;
    price?: string;
    brand?: string;
    category?: string;
    favorite?: string;
    enableCostBarcode?: string;
    imageUri?: string;
    capitalPrice?: string;
    barcode?: string;
    recipe?: string;
    variants?: string;
    variantId?: string;
  }>();

  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);
  const setVariants = useProductFormStore(state => state.setVariants);
  const variants = useProductFormStore(state => state.variants);
  const pendingVariant = useProductFormStore(state => state.pendingVariant);
  const setPendingVariant = useProductFormStore(
    state => state.setPendingVariant
  );
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [enableCostBarcode, setEnableCostBarcode] = useState(false);
  const [capitalPrice, setCapitalPrice] = useState(0);
  const [barcode, setBarcode] = useState("");
  const [recipe, setRecipe] = useState("");
  const [recipes, setRecipes] = useState<{ id: string; name: string }[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [stock, setStock] = useState<{
    offlineStock: number;
    unit: string;
    minStock: number;
    notifyMin: boolean;
  } | null>(null);
  const [isSubmit, setIsSubmit] = useState(false);
  const variantBarcode = useVariantBarcodeStore(state => state.barcode);
  const resetVariantBarcode = useVariantBarcodeStore(state => state.reset);

  useEffect(() => {
    if (qsOfflineStock || qsUnit || qsMinStock || qsNotifyMin) {
      const parsed = {
        offlineStock: qsOfflineStock
          ? Number(String(qsOfflineStock).replace(/[^0-9]/g, ""))
          : 0,
        unit: qsUnit ? String(qsUnit) : "pcs",
        minStock: qsMinStock
          ? Number(String(qsMinStock).replace(/[^0-9]/g, ""))
          : 0,
        notifyMin: qsNotifyMin === "1" || qsNotifyMin === "true",
      };
      setStock(parsed);
      if (qsName) {
        setName(String(qsName));
      }
      if (qsPrice) {
        setPrice(String(qsPrice));
      }
      if (qsEnableCostBarcode) {
        setEnableCostBarcode(String(qsEnableCostBarcode) === "true");
      }
      if (qsCapitalPrice) {
        const parsedCapital = Number(
          String(qsCapitalPrice).replace(/[^0-9]/g, "")
        );
        if (!Number.isNaN(parsedCapital)) {
          setCapitalPrice(parsedCapital);
        }
      }
      if (qsBarcode) {
        setBarcode(String(qsBarcode));
      }
      if (qsRecipe) {
        setRecipe(String(qsRecipe));
      }
    }
  }, [
    qsOfflineStock,
    qsUnit,
    qsMinStock,
    qsNotifyMin,
    qsName,
    qsPrice,
    qsEnableCostBarcode,
    qsCapitalPrice,
    qsBarcode,
    qsRecipe,
  ]);

  useEffect(() => {
    if (variantBarcode && variantBarcode !== barcode) {
      setBarcode(variantBarcode);
      resetVariantBarcode();
    }

  }, [variantBarcode, barcode, resetVariantBarcode]);

  useEffect(() => {
    if (qsFrom === "edit" && qsVariantId) {
      const current = variants.find(v => v.id === qsVariantId);
      if (current && typeof current.stock === "number") {
        setStock({
          offlineStock: current.stock,
          unit: current.unit_id || "pcs",
          minStock: typeof current.min_stock === "number" ? current.min_stock : 0,
          notifyMin:
            typeof current.notify_on_stock_ronouts === "boolean"
              ? current.notify_on_stock_ronouts
              : false,
        });
      }
    }
  }, [qsFrom, qsVariantId, variants]);

  useEffect(() => {
    if (qsFrom === "edit") {
      if (qsName) {
        setName(String(qsName));
      }
      if (qsPrice) {
        setPrice(String(qsPrice));
      }

      if (qsEnableCostBarcode) {
        setEnableCostBarcode(String(qsEnableCostBarcode) === "true");
      }
      if (qsCapitalPrice) {
        const parsedCapital = Number(
          String(qsCapitalPrice).replace(/[^0-9]/g, "")
        );
        if (!Number.isNaN(parsedCapital)) {
          setCapitalPrice(parsedCapital);
        }
      }
      if (qsBarcode) {
        setBarcode(String(qsBarcode));
      }
      if (qsRecipe) {
        setRecipe(String(qsRecipe));
      }
    }
  }, [
    qsFrom,
    qsName,
    qsPrice,
    qsEnableCostBarcode,
    qsCapitalPrice,
    qsBarcode,
  ]);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoadingRecipes(true);
        const response = await recipeApi.getRecipes();
        if (response.data) {
          const recipesList = response.data.map(r => ({ id: r.id, name: r.name }));
          setRecipes(recipesList);
          
          // Set recipe after recipes are loaded
          if (qsRecipe) {
            const found = recipesList.find(r => r.id === qsRecipe);
            if (found) {
              setRecipe(qsRecipe);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load recipes:", error);
      } finally {
        setLoadingRecipes(false);
      }
    };

    loadRecipes();
  }, [qsRecipe]);

  const handleSave = () => {
    setIsSubmit(true);
    const priceNum = Number((price || "").replace(/[^0-9]/g, ""));

    const buildStockFields = () => {
      if (!stock) return {};
      const fields: any = {
        stock: stock.offlineStock,
        is_stock_active: stock.offlineStock> 0 && stock.minStock> 0 ,
        min_stock: stock.minStock,
        notify_on_stock_ronouts: stock.notifyMin,
      };

      // Only add unit_id if it's a valid CUID
      if (stock.unit && stock.unit.length > 10 && stock.unit.startsWith("cm")) {
        fields.unit_id = stock.unit;
      }

      return fields;
    };

    console.log("qsfrom", qsFrom)
    console.log("variant_id", qsVariantId)
    
    


    if (qsFrom === "edit" && qsVariantId) {
      setVariants(prev =>
        prev.map(v => {
          if (v.id !== qsVariantId) return v;

          const updated: any = {
            ...v,
            name,
            price: priceNum,
            capital_price: capitalPrice || 0,
            ...buildStockFields(),
          };

          // Only add recipe_id if it's a valid CUID
          if (recipe && recipe.length > 10 && recipe.startsWith("cm")) {
            updated.recipe_id = recipe;
          } else {
            // Remove recipe_id if invalid
            delete updated.recipe_id;
          }

          // Only add barcode if it has a value
          if (barcode && barcode.trim()) {
            updated.barcode = barcode;
          } else {
            delete updated.barcode;
          }

          return updated;
        })
      );
    } else if (qsFrom === "edit" && qsEditActions === "add") {
      const baseStockFields = (() => {
        if (pendingVariant && pendingVariant.id) {
          const fields: any = {
            stock: pendingVariant.stock,
            is_stock_active: pendingVariant.is_stock_active,
            min_stock: pendingVariant.min_stock,
            notify_on_stock_ronouts: pendingVariant.notify_on_stock_ronouts,
          };

          // Only add unit_id if it's a valid CUID
          if (
            pendingVariant.unit_id &&
            pendingVariant.unit_id.length > 10 &&
            pendingVariant.unit_id.startsWith("cm")
          ) {
            fields.unit_id = pendingVariant.unit_id;
          }

          return fields;
        }
        return buildStockFields();
      })();

      const generatedId = pendingVariant?.id ?? `${Date.now()}`;
      const newVariant: any = {
        name,
        price: priceNum,
        capital_price: capitalPrice || 0,
        ...baseStockFields,
      };

      // Only add recipe_id if it's a valid CUID
      if (recipe && recipe.length > 10 && recipe.startsWith("cm")) {
        newVariant.recipe_id = recipe;
      }

      // Only add barcode if it has a value
      if (barcode && barcode.trim()) {
        newVariant.barcode = barcode;
      }

      setVariants(prev => [...prev, newVariant]);
      setPendingVariant(null);
    } else {
      const baseStockFields = (() => {
        if (pendingVariant && pendingVariant.id) {
          const fields: any = {
            stock: pendingVariant.stock,
            is_stock_active: pendingVariant.is_stock_active,
            min_stock: pendingVariant.min_stock,
            notify_on_stock_ronouts: pendingVariant.notify_on_stock_ronouts,
          };

          // Only add unit_id if it's a valid CUID
          if (
            pendingVariant.unit_id &&
            pendingVariant.unit_id.length > 10 &&
            pendingVariant.unit_id.startsWith("cm")
          ) {
            fields.unit_id = pendingVariant.unit_id;
          }

          return fields;
        }
        return buildStockFields();
      })();

      const generatedId = pendingVariant?.id ?? `${Date.now()}`;
      const newVariant: any = {
        id: generatedId,
        name,
        price: priceNum,
        capital_price: capitalPrice || 0,
        ...baseStockFields,
      };

      // Only add recipe_id if it's a valid CUID
      if (recipe && recipe.length > 10 && recipe.startsWith("cm")) {
        newVariant.recipe_id = recipe;
      }

      // Only add barcode if it has a value
      if (barcode && barcode.trim()) {
        newVariant.barcode = barcode;
      }

      setVariants(prev => [...prev, newVariant]);
      setPendingVariant(null);
    }

    router.back();
  };

  const isDirty =
    name.trim() !== "" ||
    price.trim() !== "" ||
    recipe.trim() !== "" ||
    enableCostBarcode ||
    capitalPrice > 0 ||
    barcode.trim() !== "";

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

  console.log("qsfrom", qsFrom)
  console.log("stock", stock)

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header title="Variasi Produk" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + (isTablet ? 96 : 160),
          paddingVertical: isTablet ? 16 : 12,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={[styles.contentSection, { paddingVertical: 12 }]}>
            <ThemedInput
              label="Nama Variasi"
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
            <ComboInput
              label="Resep Produk"
              value={recipes.find(r => r.id === recipe)?.name || ""}
              size="md"
              onChangeText={text => {
                const found = recipes.find(r => r.name === text);
                setRecipe(found ? found.id : "");
              }}
              items={recipes.map(r => ({ label: r.name, value: r.id }))}
            />
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.contentWrapper}>
          <View style={styles.contentSection}>
            <MenuRow
              title="Atur Harga Modal dan Barcode"
              variant="toggle"
              value={enableCostBarcode}
              onValueChange={setEnableCostBarcode}
              showBottomBorder={!enableCostBarcode}
            />

            {enableCostBarcode ? (
              <CostBarcodeFields
                capitalPrice={capitalPrice}
                onCapitalPriceChange={setCapitalPrice}
                barcode={barcode}
                onBarcodeChange={setBarcode}
                onPressScan={() =>
                  router.push({
                    pathname: "/dashboard/product/add-barcode",
                    params: { from: "variant" },
                  } as never)
                }
              />
            ) : null}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        {(qsFrom != "edit" || (qsFrom == "edit" && qsEditActions == "add")) && (
          <>
            <View style={styles.contentWrapper}>
              <View style={styles.contentSection}>
                <MenuRow
                  title="Kelola Stok"
                  rightText={
                    qsFrom === "edit" && qsVariantId
                      ? variants.find(v => v.id === qsVariantId)?.stock
                        ? `Stok Aktif (${variants.find(v => v.id === qsVariantId)?.stock})`
                        : "Stok Tidak Aktif"
                      : pendingVariant && pendingVariant.is_stock_active && typeof pendingVariant.stock === "number"
                        ? `Stok Aktif (${pendingVariant.stock})`
                        : stock
                          ? `Stok Aktif (${stock.offlineStock})`
                          : "Stok Tidak Aktif"
                  }
                  showBottomBorder={false}
                  variant="link"
                  onPress={() => {
                    let targetVariantId = qsVariantId as string | undefined;



                    if (!targetVariantId) {
                      const priceNum = Number((price || "").replace(/[^0-9]/g, ""));

                      const base =
                        pendingVariant && pendingVariant.id
                          ? pendingVariant
                          : {
                            id: `${Date.now()}`,
                          };

                      const updated = {
                        ...base,
                        name,
                        price: priceNum,
                      };

                      console.log("updated", updated)

                      setPendingVariant(updated as any);
                      targetVariantId = String(updated.id);
                    }

                    router.push({
                      pathname: "/dashboard/product/variant-stock",
                      params: {
                        variantId: String(targetVariantId),
                        from: qsFrom ?? "add",
                        action: qsEditActions,
                      },
                    } as never);
                  }}
                />
              </View>
            </View>

            <View style={styles.sectionDivider} />
          </>
        )}


      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" onPress={handleSave} />
        {qsVariantId ? (
          <View style={{ marginTop: 8 }}>
            <ThemedButton
              title="Hapus Varian"
              variant="secondary"
              onPress={() => {
                if (qsVariantId) {
                  setVariants(prev => prev.filter(v => v.id !== qsVariantId));
                }
                router.back();
              }}
            />
          </View>
        ) : null}
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
    sectionDivider: {
      backgroundColor: Colors[colorScheme].border2,
      height: isTablet ? 14 : 12,
    },
    contentSection: {
      paddingHorizontal: isTablet ? 28 : 20,
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: isTablet ? 28 : 20,
      paddingBottom: isTablet ? 28 : 24,
      paddingTop: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
