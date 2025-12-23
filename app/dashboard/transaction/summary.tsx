"use client";

import CheckoutItem from "@/components/atoms/checkout-item";
import AddAdditionalCostModal from "@/components/drawers/add-addditional-cost-modal";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCartStore } from "@/stores/cart-store";
import { useTaxStore } from "@/stores/tax-store";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity, useWindowDimensions,
  View,
} from "react-native";

export default function TransactionSummaryPage() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();
  const navigation = useNavigation();
  const confirmationRef = useRef<ConfirmationDialogHandle | null>(null);

  const {
    items: cartItems,
    additionalFees,
    removeItem,
    addFee,
    removeFee,
    getSubtotal,
    getTotalFees,
    getTotalAmount,
    getTotalWithTax,
    getTaxAmount,
  } = useCartStore();

  const [isCostModalVisible, setIsCostModalVisible] = useState(false);

  // Check if cart has items (for confirmation dialog)
  const hasItemsInCart = cartItems.length > 0 || additionalFees.length > 0;

  useEffect(() => {
    // Cek jika cart kosong hanya saat pertama kali mount
    if (cartItems.length === 0) {
      Alert.alert(
        "Keranjang Kosong",
        "Silakan tambahkan produk terlebih dahulu",
        [
          {
            text: "OK",
            onPress: () => router.replace("/dashboard/transaction"),
          },
        ]
      );
    }
  }, []); // Empty dependency - hanya run sekali saat mount

  // Add back navigation confirmation
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      // Allow navigation if cart is empty or if it's going forward
      if (!hasItemsInCart) {
        return;
      }

      const action = e.data.action;
      e.preventDefault();

      confirmationRef.current?.showConfirmationDialog({
        title: "Konfirmasi",
        message: "Anda yakin ingin kembali? Data yang telah dimasukkan akan hilang.",
        onCancel: () => {
          // Stay on the page
        },
        onConfirm: () => {
          navigation.dispatch(action);
        },
      });
    });

    return sub;
  }, [navigation, hasItemsInCart]);

  const subtotal = getSubtotal();
  const totalFees = getTotalFees();
  const totalAmount = getTotalAmount();
  const taxAmount = getTaxAmount();
  const totalWithTax = getTotalWithTax();

  const handleAddFee = (payload: { name: string; price: number }) => {
    addFee({
      id: `fee-${Date.now()}`,
      name: payload.name,
      amount: payload.price,
    });
    setIsCostModalVisible(false);
  };

  const handleRemoveItem = (productId: string, variantId: string | null) => {
    Alert.alert("Hapus Item", "Yakin ingin menghapus item ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => removeItem(productId, variantId),
      },
    ]);
  };

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
        title="Ringkasan Transaksi"
        showHelp={false}
        right={
          <TouchableOpacity
            style={styles.feeButton}
            onPress={() => setIsCostModalVisible(true)}
          >
            <Ionicons
              name="add"
              size={18}
              color={Colors[colorScheme].secondary}
            />
            <Text style={styles.feeButtonText}>Biaya</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.listWrapper}
        contentContainerStyle={styles.listContent}
      >
        {/* Cart Items */}
        {cartItems.map((item, index) => {
          const displayName = item.variantName
            ? `${item.productName} - ${item.variantName}`
            : item.productName;

          return (
            <View
              key={`${item.productId}-${item.variantId || "default"}`}
              style={styles.itemContainer}
            >
              <View style={styles.contentWrapper}>
                <CheckoutItem
                  index={index + 1}
                  name={displayName}
                  quantity={item.quantity}
                  unitPrice={item.unitPrice}
                  onRemove={() =>
                    handleRemoveItem(item.productId, item.variantId || null)
                  }
                />
                {item.note && (
                  <Text
                    style={[styles.itemNote, { color: Colors[colorScheme].icon }]}
                  >
                    Catatan: {item.note}
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Additional Fees */}
        {additionalFees.map((fee, index) => (
          <View key={fee.id} style={styles.itemContainer}>
            <CheckoutItem
              index={cartItems.length + index + 1}
              name={fee.name}
              quantity={1}
              unitPrice={fee.amount}
              onRemove={() => removeFee(fee.id)}
            />
          </View>
  ))
}
      </ScrollView >


      {/* Summary Info */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryRow}>
          <Text
            style={[styles.summaryLabel, { color: Colors[colorScheme].icon }]}
          >
            Subtotal
          </Text>
          <Text
            style={[styles.summaryValue, { color: Colors[colorScheme].text }]}
          >
            Rp {formatCurrency(subtotal)}
          </Text>
        </View>
        {totalFees > 0 && (
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: Colors[colorScheme].icon }]}
            >
              Biaya Tambahan
            </Text>
            <Text
              style={[styles.summaryValue, { color: Colors[colorScheme].text }]}
            >
              Rp {formatCurrency(totalFees)}
            </Text>
          </View>
        )}
        {taxAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, { color: Colors[colorScheme].icon }]}
            >
              Pajak ({useTaxStore.getState().taxRate}%)
            </Text>
            <Text
              style={[styles.summaryValue, { color: Colors[colorScheme].text }]}
            >
              Rp {formatCurrency(taxAmount)}
            </Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.summaryRowTotal]}>
          <Text
            style={[
              styles.summaryLabelTotal,
              { color: Colors[colorScheme].text },
            ]}
          >
            Total
          </Text>
          <Text
            style={[
              styles.summaryValueTotal,
              { color: Colors[colorScheme].primary },
            ]}
          >
            Rp {formatCurrency(totalWithTax)}
          </Text>
        </View>
      </View>


      <AddAdditionalCostModal
        visible={isCostModalVisible}
        onClose={() => setIsCostModalVisible(false)}
        onConfirm={({ name, price }) => handleAddFee({ name, price })}
      />

      <ConfirmationDialog ref={confirmationRef} />

      <View style={styles.bottomWrapper}>
        <TouchableOpacity
          style={[
            styles.payButton,
            { backgroundColor: Colors[colorScheme].primary },
          ]}
          onPress={() =>
            router.push("/dashboard/transaction/payment" as never)
          }
        >
          <Text style={[styles.payButtonText, { color: "white" }]}>
            Lanjutkan Pembayaran
          </Text>
        </TouchableOpacity>
      </View>
    </View >
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    summaryHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: Colors[colorScheme].secondary,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    summaryRowTotal: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      marginBottom: 0,
    },
    summaryLabel: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    summaryLabelTotal: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    summaryValueTotal: {
      fontSize: 18,
      fontWeight: "700",
      color: Colors[colorScheme].primary,
    },
    totalText: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    itemNote: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
    },
    feeButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 10 : 6,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].primary,
      columnGap: isTablet ? 6 : 4,
    },
    feeButtonText: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "600",
      color: "white",
    },
    listWrapper: {
      paddingTop: isTablet ? 16 : 8,
      flex: 1,
    },
    listContent: {
      paddingVertical: isTablet ? 12 : 8,
    },
    itemContainer: {
      borderBottomWidth: 1,
      borderRadius: isTablet ? 10 : 8,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    bottomWrapper: {
      paddingHorizontal: isTablet ? 24 : 16,
      paddingVertical: isTablet ? 24 : 20,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    payButton: {
      width: "100%",
      height: isTablet ? 64 : 54,
      borderRadius: isTablet ? 10 : 8,
      alignItems: "center",
      justifyContent: "center",
    },
    payButtonText: {
      fontSize: isTablet ? 22 : 16,
      fontWeight: "500",
    },
  });
