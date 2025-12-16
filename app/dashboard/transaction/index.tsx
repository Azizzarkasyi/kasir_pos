"use client";

import CheckoutItem from "@/components/atoms/checkout-item";
import ProductItem from "@/components/atoms/product-item";
import AddCustomQuantityModal from "@/components/drawers/add-custom-quantity";
import SelectVariantModal from "@/components/drawers/select-variant-modal";
import Header from "@/components/header";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import CalculatorInput from "@/components/mollecules/calculator-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useScannerDevice } from "@/hooks/use-scanner-device";
import { categoryApi } from "@/services/endpoints/categories";
import { productApi } from "@/services/endpoints/products";
import { useBranchStore } from "@/stores/branch-store";
import { useCartStore } from "@/stores/cart-store";
import { Category, Product } from "@/types/api";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

const STATUS_BAR_HEIGHT = StatusBar.currentHeight ?? 0;

type ProductVariant = {
  id: string;
  name: string;
  price: number;
  stock?: number;
};


type CheckoutItemData = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  note?: string;
};

export default function PaymentPage() {
  const [amount, setAmount] = useState<string>("0");
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"manual" | "product" | "favorite">(
    "product"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isBarcodeLoading, setIsBarcodeLoading] = useState(false);
  const [usbInputBuffer, setUsbInputBuffer] = useState("");

  const textInputRef = useRef<TextInput>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSearchFirstRender = useRef(true);

  const {
    savedDevice,
    lastScannedBarcode,
    clearLastBarcode,
  } = useScannerDevice();

  const [checkoutProducts, setCheckoutProducts] = useState<CheckoutItemData[]>([]);
  const [variantModalVisible, setVariantModalVisible] = useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] =
    useState<Product | null>(null);
  const [customQtyModalVisible, setCustomQtyModalVisible] = useState(false);
  const [selectedProductForCustomQty, setSelectedProductForCustomQty] =
    useState<Product | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const {
      clearCart,
    } = useCartStore();

  // Get current branch from store
  const { currentBranchId } = useBranchStore();

  useEffect(() => {
    clearCart();
  }, [])

  useEffect(() => {
    if (savedDevice?.connectionType === "usb") {
      textInputRef.current?.focus();
      const timer = setTimeout(() => {
        textInputRef.current?.focus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [savedDevice]);

  useEffect(() => {
    if (lastScannedBarcode) {
      handleScannedBarcode(lastScannedBarcode);
      clearLastBarcode();
    }
  }, [lastScannedBarcode]);

  // Cart store
  const {
    items: cartItems,
    addItem,
    getTotalItems,
    getTotalAmount,
  } = useCartStore();

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {};

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedCategoryId !== "all") {
        params.category_id = selectedCategoryId;
      }

      // Note: Backend doesn't support is_favorite filter yet
      // if (activeTab === "favorite") {
      //   params.is_favorite = true;
      // }

      // Filter by selected branch/outlet
      if (currentBranchId) {
        params.branch_id = currentBranchId;
      }

      const response = await productApi.getProducts(params);

      if (response.data) {
        setProducts(response.data);
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategoryId, activeTab, currentBranchId]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryApi.getCategories();
      if (response.data) {
        setCategories(response.data);
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch categories:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load products when filters change
  useEffect(() => {
    if (activeTab !== "manual") {
      fetchProducts();
    }
  }, [fetchProducts, activeTab]);

  // Debounced search - skip first render to avoid double fetch
  useEffect(() => {
    if (isSearchFirstRender.current) {
      isSearchFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      if (activeTab !== "manual") {
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const isEmptyState = products.length === 0 && !isLoading;

  const formatAmount = (value: string) => {
    if (!value) return "0";
    const [intPart, decimalPart] = value.split(".");
    const cleaned = intPart.replace(/\D/g, "");
    if (!cleaned) return "0";
    const withDots = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimalPart ? `${withDots}.${decimalPart}` : withDots;
  };

  const handleAddProductToCheckout = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    addItem({
      productId: product.id,
      productName: product.name,
      variantId: null,
      variantName: null,
      quantity: 1,
      unitPrice: product.price || 0,
      note: "",
    });

    // Also update local state for backward compatibility
    setCheckoutProducts(prev => {
      const existing = prev.find(
        item => item.productId === productId && !item.variantId
      );
      if (existing) {
        return prev.map(item =>
          item.productId === productId && !item.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, variantId: null, quantity: 1, note: "" }];
    });
  };

  const handleProductPress = (product: Product) => {
    // Check if product has multiple variants
    if (product.variants && product.variants.length > 1) {
      setSelectedProductForVariant(product);
      setVariantModalVisible(true);
      return;
    }

    // If only one variant or no variant, add directly with default variant
    if (product.variants && product.variants.length === 1) {
      const variant = product.variants[0];
      handleConfirmVariant({
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
        note: "",
      });
    } else {
      handleAddProductToCheckout(product.id);
    }
  };

  const handleProductLongPress = (product: Product) => {
    setSelectedProductForCustomQty(product);
    setCustomQtyModalVisible(true);
  };

  const handleConfirmVariant = (payload: {
    productId: string;
    variantId: string;
    quantity: number;
    note: string;
  }) => {
    const product = products.find(p => p.id === payload.productId);
    const variant = product?.variants?.find(v => v.id === payload.variantId);

    if (product && variant) {
      addItem({
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantName: variant.name,
        quantity: payload.quantity,
        unitPrice: variant.price,
        note: payload.note,
      });
    }

    // Also update local state
    setCheckoutProducts(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.productId === payload.productId &&
          item.variantId === payload.variantId
      );

      if (existingIndex >= 0) {
        const next = [...prev];
        const existing = next[existingIndex];
        next[existingIndex] = {
          ...existing,
          quantity: existing.quantity + payload.quantity,
          note: payload.note,
        };
        return next;
      }

      return [
        ...prev,
        {
          productId: payload.productId,
          variantId: payload.variantId,
          quantity: payload.quantity,
          note: payload.note,
        },
      ];
    });

    setVariantModalVisible(false);
    setSelectedProductForVariant(null);
  };

  const handleScannedBarcode = async (code: string) => {
    if (!code || isBarcodeLoading) {
      return;
    }

    try {
      setIsBarcodeLoading(true);
      const response = await productApi.getProducts({ search: code });

      const list = response.data ?? [];
      if (!list.length) {
        return;
      }

      const product = list[0];

      if (product.variants && product.variants.length > 0) {
        const matchedVariant =
          product.variants.find(v => v.barcode === code) ||
          product.variants[0];

        if (matchedVariant) {
          handleConfirmVariant({
            productId: product.id,
            variantId: matchedVariant.id,
            quantity: 1,
            note: "",
          });
          return;
        }
      }

      // Fallback: treat as non-variant product match (by product barcode or generic search)
      handleAddProductToCheckout(product.id);
    } catch (error) {
      console.error("❌ Failed to fetch product by variant (barcode):", error);
    } finally {
      setIsBarcodeLoading(false);
    }
  };

  const handleUsbTextChange = (text: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (text.includes("\n")) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const barcode = text.replace(/\n/g, "").trim();

      if (barcode) {
        handleScannedBarcode(barcode);
      }
      setUsbInputBuffer("");

      setTimeout(() => {
        textInputRef.current?.focus();
      }, 50);
      return;
    }

    setUsbInputBuffer(text);

    debounceTimerRef.current = setTimeout(() => {
      const barcode = text.trim();
      if (barcode && barcode.length >= 3) {
        handleScannedBarcode(barcode);
        setUsbInputBuffer("");

        setTimeout(() => {
          textInputRef.current?.focus();
        }, 50);
      }
    }, 150);
  };

  const getProductQuantity = (productId: string) => {
    return checkoutProducts
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getProductNote = (productId: string) => {
    const item = checkoutProducts.find(
      checkoutItem =>
        checkoutItem.productId === productId && !checkoutItem.variantId
    );
    return item?.note ?? "";
  };

  const handleConfirmCustomQuantity = (payload: {
    quantity: number;
    note: string;
  }) => {
    const { quantity, note } = payload;
    if (!selectedProductForCustomQty) {
      setCustomQtyModalVisible(false);
      return;
    }

    const productId = selectedProductForCustomQty.id;

    setCheckoutProducts(prev => {
      const index = prev.findIndex(
        item => item.productId === productId && !item.variantId
      );

      if (index >= 0) {
        const next = [...prev];

        if (quantity <= 0) {
          next.splice(index, 1);
          return next;
        }

        next[index] = {
          ...next[index],
          quantity,
          note,
        };
        return next;
      }

      if (quantity <= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          productId,
          variantId: null,
          quantity,
          note,
        },
      ];
    });

    setCustomQtyModalVisible(false);
    setSelectedProductForCustomQty(null);
  };

  const getItemUnitPrice = (item: CheckoutItemData) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return 0;

    if (item.variantId) {
      const variant = product.variants?.find(v => v.id === item.variantId);
      return variant?.price ?? 0;
    }

    // If product has variants but no variant selected, use first variant price
    if (product.variants && product.variants.length > 0) {
      return product.variants[0].price;
    }

    return product.price || 0;
  };

  const getProductStock = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;

    // Sum all variant stocks or return product stock
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }

    return product.stock || 0;
  };

  const checkoutItemsCount = checkoutProducts.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const checkoutTotalAmount = checkoutProducts.reduce((sum, item) => {
    const unitPrice = getItemUnitPrice(item);
    return sum + unitPrice * item.quantity;
  }, 0);

  const formatCurrency = (value: number) => {
    if (!value) return "0";
    const intPart = Math.floor(value).toString();
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  const getCheckoutItemName = (item: CheckoutItemData) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return "";
    if (item.variantId) {
      const variant = product.variants?.find((v) => v.id === item.variantId);
      return `${product.name} - ${variant?.name ?? ""}`;
    }
    return product.name;
  };

  const handleRemoveCheckoutItem = (productId: string, variantId?: string | null) => {
    setCheckoutProducts((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {savedDevice?.connectionType === "usb" && (
        <TextInput
          ref={textInputRef}
          value={usbInputBuffer}
          onChangeText={handleUsbTextChange}
          autoFocus
          style={styles.hiddenInput}
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
          multiline={false}
          blurOnSubmit={false}
        />
      )}

      <Header
        showHelp={false}
        title="Transaksi"
        withNotificationButton={false}
      />
      {/* Top search and actions (simplified) */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: Colors[colorScheme].secondary,
            shadowColor: Colors[colorScheme].shadow,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerIconBox}
            onPress={() => setIsSidebarOpen(true)}
          >
            <AntDesign name="menu" size={isTablet ? 24 : 18} color={Colors[colorScheme].icon} />
          </TouchableOpacity>

          <View style={styles.searchWrapper}>
            <View
              style={[
                styles.searchInner,
                { backgroundColor: Colors[colorScheme].background },
              ]}
            >
              <Ionicons
                name="search-outline"
                style={styles.searchIcon}
                size={isTablet ? 20 : 16}
                color={Colors[colorScheme].icon}
              />
              <TextInput
                placeholder="Cari Produk"
                placeholderTextColor={Colors[colorScheme].icon}
                style={[styles.searchInput, { color: Colors[colorScheme].text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/transaction/history")}
              style={styles.headerIconBox}
            >
              <AntDesign
                name="history"
                size={isTablet ? 24 : 20}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View
          style={[
            styles.tabsContainer,
            { backgroundColor: Colors[colorScheme].tabBackground },
          ]}
        >
          <TouchableOpacity
            style={[styles.tab, activeTab === "manual" && styles.tabActive]}
            onPress={() => setActiveTab("manual")}
          >
            <Text
              style={
                activeTab === "manual"
                  ? [styles.tabActiveText, { color: Colors[colorScheme].text }]
                  : [styles.tabText, { color: Colors[colorScheme].icon }]
              }
            >
              Manual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "product" && [
                styles.tabActive,
                { backgroundColor: Colors[colorScheme].secondary },
              ],
            ]}
            onPress={() => setActiveTab("product")}
          >
            <Text
              style={
                activeTab === "product"
                  ? [styles.tabActiveText, { color: Colors[colorScheme].text }]
                  : [styles.tabText, { color: Colors[colorScheme].icon }]
              }
            >
              Produk
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "favorite" && [
                styles.tabActive,
                { backgroundColor: Colors[colorScheme].secondary },
              ],
            ]}
            onPress={() => setActiveTab("favorite")}
          >
            <Text
              style={
                activeTab === "favorite"
                  ? [styles.tabActiveText, { color: Colors[colorScheme].text }]
                  : [styles.tabText, { color: Colors[colorScheme].icon }]
              }
            >
              Favorit
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content area */}
      <View style={styles.main}>
        {/* Left side - Products */}
        <View style={styles.leftPanel}>
          {activeTab === "manual" ? (
            <>
              {/* Grey display area with amount on right */}
              <View
                style={[
                  styles.displayWrapper,
                  { backgroundColor: Colors[colorScheme].background },
                ]}
              >
                <View style={styles.displayAmountRow}>
                  <Text
                    style={[
                      styles.displayAmount,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {formatAmount(amount)}
                  </Text>
                </View>
              </View>

              {/* Calculator */}
              <View style={styles.calculatorWrapper}>
                <CalculatorInput value={amount} onChangeValue={setAmount} />
              </View>
            </>
          ) : (
            <View
              style={[
                styles.productWrapper,
                { backgroundColor: Colors[colorScheme].secondary },
              ]}
            >
              <View style={styles.badgeRow}>
                <TouchableOpacity
                  style={[
                    styles.badge,
                    selectedCategoryId === "all" && styles.badgeActive,
                  ]}
                  onPress={() => setSelectedCategoryId("all")}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      selectedCategoryId === "all" && styles.badgeTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.badge,
                      selectedCategoryId === category.id && styles.badgeActive,
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        selectedCategoryId === category.id &&
                        styles.badgeTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {isLoading ? (
                <View style={styles.blankStateWrapper}>
                  <ActivityIndicator
                    size="large"
                    color={Colors[colorScheme].primary}
                  />
                  <Text
                    style={[
                      styles.blankStateText,
                      { color: Colors[colorScheme].text, marginTop: 16 },
                    ]}
                  >
                    Memuat produk...
                  </Text>
                </View>
              ) : isEmptyState ? (
                <View style={styles.blankStateWrapper}>
                  <Image
                    source={require("../../../assets/ilustrations/empty.jpg")}
                    style={styles.blankStateImage}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.blankStateText,
                      { color: Colors[colorScheme].text },
                    ]}
                  >
                    {searchQuery ? "Produk tidak ditemukan" : "Belum Ada Produk"}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={products}
                  renderItem={({ item: product }) => (
                    <ProductItem
                      name={product.name}
                      remaining={getProductStock(product.id)}
                      price={
                        product.variants && product.variants.length > 0
                          ? product.variants[0].price
                          : product.price || 0
                      }
                      quantity={getProductQuantity(product.id)}
                      onPress={() => handleProductPress(product)}
                      onLongPress={() => handleProductLongPress(product)}
                    />
                  )}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.productListWrapper}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={[Colors[colorScheme].primary]}
                      tintColor={Colors[colorScheme].primary}
                    />
                  }
                />
              )}
            </View>
          )}

          {/* Bottom charge button - only show on phone/tablet portrait */}
          {!isTabletLandscape && (
            <View
              style={[
                styles.bottomWrapper,
                { backgroundColor: Colors[colorScheme].secondary },
              ]}
            >
              <View style={styles.bottomHandle} />
              <TouchableOpacity
                style={[
                  styles.chargeButton,
                  { backgroundColor: Colors[colorScheme].primary },
                ]}
                disabled={
                  activeTab !== "manual" && checkoutItemsCount === 0
                }
                onPress={() => {
                  if (activeTab !== "manual" && checkoutItemsCount === 0) {
                    return;
                  }
                  router.replace("/dashboard/transaction/summary");
                }}
              >
                <Text
                  style={[
                    styles.chargeButtonText,
                    { color: "white" },
                  ]}
                >
                  {activeTab === "manual"
                    ? `Tagih = Rp ${amount === "0" ? "0" : formatAmount(amount)}`
                    : getTotalItems() === 0
                      ? "Pilih produk terlebih dahulu"
                      : `(${getTotalItems()} Produk)  Rp ${formatCurrency(
                        getTotalAmount()
                      )}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right side - Cart Panel (only for tablet landscape) */}
        {isTabletLandscape && (
          <View
            style={[
              styles.rightPanel,
              { backgroundColor: Colors[colorScheme].secondary },
            ]}
          >
            {/* Cart Items List */}
            <ScrollView
              style={styles.cartScrollView}
              contentContainerStyle={styles.cartScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {checkoutProducts.length === 0 ? (
                <View style={styles.emptyCartWrapper}>
                  <Text style={[styles.emptyCartText, { color: Colors[colorScheme].icon }]}>
                    Belum ada produk dipilih
                  </Text>
                </View>
              ) : (
                checkoutProducts.map((item, index) => (
                  <View
                    key={`${item.productId}-${item.variantId ?? "no-variant"}`}
                    style={[
                      styles.cartItemContainer,
                      { borderBottomColor: Colors[colorScheme].border },
                    ]}
                  >
                    <CheckoutItem
                      index={index + 1}
                      name={getCheckoutItemName(item)}
                      quantity={item.quantity}
                      unitPrice={getItemUnitPrice(item)}
                      onRemove={() => handleRemoveCheckoutItem(item.productId, item.variantId)}
                      hideIndex
                      withSummary={false}
                      isTablet={isTablet}
                    />
                  </View>
                ))
              )}
            </ScrollView>

            {/* Cart Footer with Total and Actions */}
            <View
              style={[
                styles.cartFooter,
                { borderTopColor: Colors[colorScheme].border },
              ]}
            >
              <View style={styles.cartTotalRow}>
                <Text style={[styles.cartTotalLabel, { color: Colors[colorScheme].text }]}>
                  Total ({checkoutItemsCount})
                </Text>
                <Text style={[styles.cartTotalAmount, { color: Colors[colorScheme].primary }]}>
                  Rp{formatCurrency(checkoutTotalAmount)}
                </Text>
              </View>

              <View style={styles.cartActionsRow}>

                <TouchableOpacity
                  style={[
                    styles.payButton,
                    { backgroundColor: Colors[colorScheme].primary },
                    (activeTab !== "manual" && checkoutItemsCount === 0) && styles.payButtonDisabled,
                  ]}
                  disabled={activeTab !== "manual" && checkoutItemsCount === 0}
                  onPress={() => {
                    if (activeTab !== "manual" && checkoutItemsCount === 0) {
                      return;
                    }
                    router.push("/dashboard/transaction/summary");
                  }}
                >
                  <Text style={styles.payButtonText}>Bayar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      <SelectVariantModal
        visible={variantModalVisible}
        productId={selectedProductForVariant?.id ?? ""}
        productName={selectedProductForVariant?.name ?? ""}
        variants={selectedProductForVariant?.variants ?? []}
        onClose={() => {
          setVariantModalVisible(false);
          setSelectedProductForVariant(null);
        }}
        onConfirm={handleConfirmVariant}
      />

      <AddCustomQuantityModal
        visible={customQtyModalVisible}
        productName={selectedProductForCustomQty?.name ?? ""}
        initialQuantity={
          selectedProductForCustomQty
            ? getProductQuantity(selectedProductForCustomQty.id) || 1
            : 1
        }
        initialNote={
          selectedProductForCustomQty
            ? getProductNote(selectedProductForCustomQty.id)
            : ""
        }
        minQuantity={1}
        onClose={() => {
          setCustomQtyModalVisible(false);
          setSelectedProductForCustomQty(null);
        }}
        onSubmit={handleConfirmCustomQuantity}
      />

      <Sidebar
        activeKey="transactions"
        isOpen={isSidebarOpen}
        onSelect={key => {
          setIsSidebarOpen(false);
        }}
        onClose={() => setIsSidebarOpen(false)}
      />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    header: {
      paddingHorizontal: isTablet ? 24 : 16,
      paddingTop: isTablet ? 16 : 12,
      paddingBottom: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].secondary,
      shadowColor: Colors[colorScheme].shadow,
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isTablet ? 12 : 8,
      columnGap: isTablet ? 16 : 12,
    },
    menuButton: {
      width: isTablet ? 48 : 32,
      height: isTablet ? 48 : 32,
      borderRadius: isTablet ? 10 : 8,
      borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    menuButtonText: {
      fontSize: isTablet ? 20 : 16,
      color: Colors[colorScheme].text,
    },
    searchWrapper: {
      flex: 1,
      borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      borderRadius: isTablet ? 10 : 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: isTablet ? 14 : 12,
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].text,
    },
    searchInner: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: isTablet ? 12 : 8,
      borderRadius: isTablet ? 10 : 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: isTablet ? 16 : 12,
    },
    searchIcon: {
      fontSize: isTablet ? 20 : 16,
      color: Colors[colorScheme].icon,
    },
    headerIcons: {
      flexDirection: "row",
      columnGap: isTablet ? 12 : 8,
    },
    hiddenInput: {
      position: "absolute",
      opacity: 0,
      height: 0,
      width: 0,
    },
    barcodeInputWrapper: {
      minWidth: isTablet ? 180 : 140,
      maxWidth: isTablet ? 220 : 160,
      height: isTablet ? 52 : 40,
      borderRadius: isTablet ? 10 : 8,
      borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      justifyContent: "center",
      paddingHorizontal: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
    },
    barcodeInput: {
      fontSize: isTablet ? 16 : 13,
      paddingVertical: 0,
    },
    headerIconBox: {
      width: isTablet ? 52 : 40,
      height: isTablet ? 52 : 40,
      borderRadius: isTablet ? 10 : 8,
      borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    headerIconText: {
      fontSize: isTablet ? 16 : 12,
      color: Colors[colorScheme].text,
    },
    tabsContainer: {
      flexDirection: "row",
      marginTop: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].tabBackground,
      borderRadius: isTablet ? 10 : 8,
      padding: isTablet ? 6 : 4,
    },
    tab: {
      flex: 1,
      paddingVertical: isTablet ? 12 : 8,
      borderRadius: isTablet ? 10 : 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].tabBackground,
    },
    tabActive: {
      backgroundColor: Colors[colorScheme].tabActive,
    },
    tabText: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].text,
    },
    tabActiveText: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].text,
      fontWeight: "600",
    },
    main: {
      flex: 1,
      flexDirection: isTabletLandscape ? "row" : "column",
    },
    leftPanel: {
      flex: isTabletLandscape ? 1 : 1,
    },
    rightPanel: {
      width: isTabletLandscape ? 360 : 0,
      borderLeftWidth: isTabletLandscape ? 1 : 0,
      borderLeftColor: Colors[colorScheme].border,
    },
    cartScrollView: {
      flex: 1,
    },
    cartScrollContent: {
      flexGrow: 1,
    },
    emptyCartWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
    },
    emptyCartText: {
      fontSize: 16,
      color: Colors[colorScheme].icon,
    },
    cartItemContainer: {
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    cartFooter: {
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    cartTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    cartTotalLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    cartTotalAmount: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors[colorScheme].primary,
    },
    cartActionsRow: {
      flexDirection: "row",
      columnGap: 12,
    },
    saveButton: {
      flex: 1,
      height: 48,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    payButton: {
      flex: 2,
      height: 48,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    payButtonDisabled: {
      opacity: 0.5,
    },
    payButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
    },
    displayWrapper: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      justifyContent: "center",
    },
    displayAmountRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: isTablet ? 24 : 16,
      paddingVertical: isTablet ? 16 : 12,
    },
    displayAmount: {
      fontSize: isTablet ? 32 : 24,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    productWrapper: {
      flex: 1,
      backgroundColor: Colors[colorScheme].secondary,
    },
    productTopBar: {
      paddingHorizontal: isTablet ? 24 : 16,
      paddingTop: isTablet ? 16 : 12,
      paddingBottom: isTablet ? 8 : 4,
      backgroundColor: Colors[colorScheme].secondary,
    },
    categoryDropdownText: {
      fontSize: isTablet ? 18 : 15,
      color: Colors[colorScheme].text,
    },
    badgeRow: {
      flexDirection: "row",
      columnGap: isTablet ? 12 : 8,
      paddingHorizontal: isTablet ? 24 : 16,
      paddingVertical: isTablet ? 12 : 8,
    },
    badge: {
      paddingHorizontal: isTablet ? 18 : 14,
      paddingVertical: isTablet ? 10 : 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    badgeActive: {
      backgroundColor: Colors[colorScheme].badgeActive,
      color: Colors[colorScheme].secondary,
    },
    badgeText: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].text,
    },
    badgeTextActive: {
      fontWeight: "600",
      color: Colors[colorScheme].secondary,
    },
    blankStateWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: isTablet ? 48 : 32,
    },
    blankStateImage: {
      width: isTablet ? 220 : 160,
      height: isTablet ? 220 : 160,
      marginBottom: isTablet ? 24 : 16,
    },
    blankStateText: {
      fontSize: isTablet ? 20 : 16,
      color: Colors[colorScheme].text,
    },
    productListWrapper: {
      paddingHorizontal: isTablet ? 24 : 16,
      paddingVertical: isTablet ? 12 : 8,
      rowGap: isTablet ? 12 : 8,
    },
    calculatorWrapper: {
      backgroundColor: Colors[colorScheme].secondary,
      borderTopColor: Colors[colorScheme].border,
      borderTopWidth: 1,
    },
    bottomWrapper: {
      backgroundColor: Colors[colorScheme].secondary,
      paddingTop: isTablet ? 12 : 8,
      paddingBottom: isTablet ? 20 : 16,
      paddingHorizontal: isTablet ? 24 : 16,
      alignItems: "center",
      rowGap: isTablet ? 12 : 8,
    },
    bottomHandle: {
      width: isTablet ? 50 : 40,
      height: isTablet ? 5 : 4,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].border,
    },
    chargeButton: {
      width: "100%",
      height: isTablet ? 60 : 50,
      borderRadius: isTablet ? 10 : 8,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    chargeButtonText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: isTablet ? 20 : 16,
    },
  });
