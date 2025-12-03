"use client";

import CheckoutItem from "@/components/atoms/checkout-item";
import AddAdditionalCostModal from "@/components/drawers/add-addditional-cost-modal";
import Header from "@/components/header";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useRouter} from "expo-router";
import React, {useState, useEffect} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import {useCartStore} from "@/stores/cart-store";
import {Ionicons} from "@expo/vector-icons";

export default function TransactionSummaryPage() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

  const {
    items: cartItems,
    additionalFees,
    removeItem,
    addFee,
    removeFee,
    getSubtotal,
    getTotalFees,
    getTotalAmount,
  } = useCartStore();

  const [isCostModalVisible, setIsCostModalVisible] = useState(false);

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

  const subtotal = getSubtotal();
  const totalFees = getTotalFees();
  const totalAmount = getTotalAmount();

  const handleAddFee = (payload: {name: string; price: number}) => {
    addFee({
      id: `fee-${Date.now()}`,
      name: payload.name,
      amount: payload.price,
    });
    setIsCostModalVisible(false);
  };

  const handleRemoveItem = (productId: string, variantId: string | null) => {
    Alert.alert("Hapus Item", "Yakin ingin menghapus item ini?", [
      {text: "Batal", style: "cancel"},
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
        {backgroundColor: Colors[colorScheme].background},
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

      {/* Summary Info */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryRow}>
          <Text
            style={[styles.summaryLabel, {color: Colors[colorScheme].icon}]}
          >
            Subtotal
          </Text>
          <Text
            style={[styles.summaryValue, {color: Colors[colorScheme].text}]}
          >
            Rp {formatCurrency(subtotal)}
          </Text>
        </View>
        {totalFees > 0 && (
          <View style={styles.summaryRow}>
            <Text
              style={[styles.summaryLabel, {color: Colors[colorScheme].icon}]}
            >
              Biaya Tambahan
            </Text>
            <Text
              style={[styles.summaryValue, {color: Colors[colorScheme].text}]}
            >
              Rp {formatCurrency(totalFees)}
            </Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.summaryRowTotal]}>
          <Text
            style={[
              styles.summaryLabelTotal,
              {color: Colors[colorScheme].text},
            ]}
          >
            Total
          </Text>
          <Text
            style={[
              styles.summaryValueTotal,
              {color: Colors[colorScheme].primary},
            ]}
          >
            Rp {formatCurrency(totalAmount)}
          </Text>
        </View>
      </View>

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
                  style={[styles.itemNote, {color: Colors[colorScheme].icon}]}
                >
                  Catatan: {item.note}
                </Text>
              )}
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
        ))}
      </ScrollView>

      <AddAdditionalCostModal
        visible={isCostModalVisible}
        onClose={() => setIsCostModalVisible(false)}
        onConfirm={({name, price}) => handleAddFee({name, price})}
      />

      <View style={styles.bottomWrapper}>
        <TouchableOpacity
          style={[
            styles.payButton,
            {backgroundColor: Colors[colorScheme].primary},
          ]}
          onPress={() =>
            router.replace("/dashboard/transaction/payment" as never)
          }
        >
          <Text style={[styles.payButtonText, {color: "white"}]}>
            Lanjutkan Pembayaran
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      fontSize: 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    feeButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].primary,
      columnGap: 4,
    },
    feeButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].secondary,
    },
    listWrapper: {
      paddingTop: 12,
      flex: 1,
    },
    listContent: {
      paddingVertical: 8,
    },
    itemContainer: {
      borderBottomWidth: 1,
      borderRadius: 8,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    itemNote: {
      fontSize: 12,
      fontStyle: "italic",
      paddingHorizontal: 16,
      paddingBottom: 8,
      color: Colors[colorScheme].icon,
    },
    bottomWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    payButton: {
      width: "100%",
      height: 54,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    payButtonText: {
      fontSize: 18,
      fontWeight: "600",
    },
  });
