"use client";

import ProductItem from "@/components/atoms/product-item";
import AddCustomQuantityModal from "@/components/drawers/add-custom-quantity";
import SelectVariantModal from "@/components/drawers/select-variant-modal";
import Header from "@/components/header";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import CalculatorInput from "@/components/mollecules/calculator-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_BAR_HEIGHT = StatusBar.currentHeight ?? 0;

type ProductVariant = {
  id: string;
  name: string;
  price: number;
  stock?: number;
};

type Product = {
  id: string;
  name: string;
  remaining: number;
  price: number;
  category: string;
  variants?: ProductVariant[];
};

type CheckoutItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  note?: string;
};

export default function PaymentPage() {
  const [amount, setAmount] = React.useState<string>("0");
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<"manual" | "product" | "favorite">("product");
  const products = React.useMemo(
    (): Product[] => [
      {
        id: "burger-1",
        name: "Burger",
        remaining: 28,
        price: 1000,
        category: "all",
        variants: [
          {
            id: "burger-1-ori",
            name: "Original",
            price: 1000,
            stock: 10
          },
          {
            id: "burger-1-cheese",
            name: "Cheese",
            price: 1200,
            stock: 10
          },
        ],
      },
      {
        id: "mie-goreng-1",
        name: "Mie Goreng",
        remaining: 12,
        price: 8000,
        category: "mie",
      },
    ],
    []
  );

  const [checkoutProducts, setCheckoutProducts] = React.useState<CheckoutItem[]>(
    []
  );

  const [variantModalVisible, setVariantModalVisible] = React.useState(false);
  const [selectedProductForVariant, setSelectedProductForVariant] =
    React.useState<Product | null>(null);

  const [customQtyModalVisible, setCustomQtyModalVisible] = React.useState(false);
  const [selectedProductForCustomQty, setSelectedProductForCustomQty] =
    React.useState<Product | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isEmptyState = products.length === 0;

  const formatAmount = (value: string) => {
    if (!value) return "0";
    const [intPart, decimalPart] = value.split(".");
    const cleaned = intPart.replace(/\D/g, "");
    if (!cleaned) return "0";
    const withDots = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decimalPart ? `${withDots}.${decimalPart}` : withDots;
  };

  const handleAddProductToCheckout = (productId: string) => {
    setCheckoutProducts((prev) => {
      const existing = prev.find(
        (item) => item.productId === productId && !item.variantId
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === productId && !item.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        { productId, variantId: null, quantity: 1, note: "" },
      ];
    });
  };

  const handleProductPress = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      setSelectedProductForVariant(product);
      setVariantModalVisible(true);
      return;
    }

    handleAddProductToCheckout(product.id);
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
    setCheckoutProducts((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
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

  const getProductQuantity = (productId: string) => {
    return checkoutProducts
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getProductNote = (productId: string) => {
    const item = checkoutProducts.find(
      (checkoutItem) => checkoutItem.productId === productId && !checkoutItem.variantId
    );
    return item?.note ?? "";
  };

  const handleConfirmCustomQuantity = (payload: { quantity: number; note: string }) => {
    const { quantity, note } = payload;
    if (!selectedProductForCustomQty) {
      setCustomQtyModalVisible(false);
      return;
    }

    const productId = selectedProductForCustomQty.id;

    setCheckoutProducts((prev) => {
      const index = prev.findIndex(
        (item) => item.productId === productId && !item.variantId
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

  const getItemUnitPrice = (item: CheckoutItem) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return 0;
    if (item.variantId) {
      const variant = product.variants?.find((v) => v.id === item.variantId);
      return variant?.price ?? product.price;
    }
    return product.price;
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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
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
            <AntDesign name="menu" size={18} color={Colors[colorScheme].icon} />
          </TouchableOpacity>

          <View style={styles.searchWrapper}>
            <View
              style={[
                styles.searchInner,
                { backgroundColor: Colors[colorScheme].background },
              ]}
            >
              <Ionicons name="search-outline" style={styles.searchIcon} size={16} color={Colors[colorScheme].icon} />
              <TextInput
                placeholder="Cari Produk"
                placeholderTextColor={Colors[colorScheme].icon}
                style={[
                  styles.searchInput,
                  { color: Colors[colorScheme].text },
                ]}
              />
            </View>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => { }} style={styles.headerIconBox}>
              <Ionicons
                name="barcode-outline"
                size={24}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { }} style={styles.headerIconBox}>
              <AntDesign
                name="history"
                size={20}
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
            style={[
              styles.tab,
              activeTab === "manual" && styles.tabActive,
            ]}
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
              <View style={[styles.badge, styles.badgeActive]}>
                <Text style={[styles.badgeText, styles.badgeTextActive]}>All</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>mie</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>minuman</Text>
              </View>
            </View>

            {isEmptyState ? (
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
                  Belum Ada Produk
                </Text>
              </View>
            ) : (
              <View style={styles.productListWrapper}>
                {products.map((product) => (
                  <ProductItem
                    key={product.id}
                    name={product.name}
                    remaining={product.remaining}
                    price={product.price}
                    quantity={getProductQuantity(product.id)}
                    onPress={() => handleProductPress(product)}
                    onLongPress={() => handleProductLongPress(product)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Bottom charge button */}
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
              router.push("/dashboard/transaction/summary");
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
                : checkoutItemsCount === 0
                  ? "Pilih produk terlebih dahulu"
                  : `(${checkoutItemsCount} Produk)  Rp ${formatCurrency(checkoutTotalAmount)}`}
            </Text>
          </TouchableOpacity>
        </View>
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

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: Colors[colorScheme].secondary,
      shadowColor: Colors[colorScheme].shadow,
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      columnGap: 12,
    },
    menuButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    menuButtonText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    searchWrapper: {
      flex: 1, borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      borderRadius: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,

      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    searchInner: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 8,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 12,
    },
    searchIcon: {
      fontSize: 16,
      color: Colors[colorScheme].icon,
    },
    headerIcons: {
      flexDirection: "row",
      columnGap: 8,
    },
    headerIconBox: {
      width: 40,
      height: 40,
      borderRadius: 8,
      borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    headerIconText: {
      fontSize: 12,
      color: Colors[colorScheme].text,
    },
    tabsContainer: {
      flexDirection: "row",
      marginTop: 8,
      backgroundColor: Colors[colorScheme].tabBackground,
      borderRadius: 8,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].tabBackground,
    },
    tabActive: {
      backgroundColor: Colors[colorScheme].tabActive,
    },
    tabText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
    tabActiveText: {
      fontSize: 14,
      color: Colors[colorScheme].text,
      fontWeight: "600",
    },
    main: {
      flex: 1,
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
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    displayAmount: {
      fontSize: 24,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    productWrapper: {
      flex: 1,
      backgroundColor: Colors[colorScheme].secondary,
    },
    productTopBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
      backgroundColor: Colors[colorScheme].secondary,
    },

    categoryDropdownText: {
      fontSize: 15,
      color: Colors[colorScheme].text,
    },
    badgeRow: {
      flexDirection: "row",
      columnGap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    badge: {
      paddingHorizontal: 14,
      paddingVertical: 6,
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
      fontSize: 14,
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
      paddingHorizontal: 32,
    },
    blankStateImage: {
      width: 160,
      height: 160,
      marginBottom: 16,
    },
    blankStateText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    productListWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      rowGap: 8,
    },
    calculatorWrapper: {
      backgroundColor: Colors[colorScheme].secondary,
      borderTopColor: Colors[colorScheme].border,
      borderTopWidth: 1,
    },
    bottomWrapper: {
      backgroundColor: Colors[colorScheme].secondary,
      paddingTop: 8,
      paddingBottom: 16,
      paddingHorizontal: 16,
      alignItems: "center",
      rowGap: 8,
    },
    bottomHandle: {
      width: 40,
      height: 4,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].border,
    },
    chargeButton: {
      width: "100%",
      height: 50,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    chargeButtonText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: 16,
    },
  });

