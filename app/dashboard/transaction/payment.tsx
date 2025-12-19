"use client";

import Header from "@/components/header";
import PaymentCalculator from "@/components/mollecules/payment-calculator";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { transactionApi } from "@/services/endpoints/transactions";
import { useCartStore } from "@/stores/cart-store";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity, useWindowDimensions,
    View,
} from "react-native";

export default function PaymentPage() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();

  const {
    items: cartItems,
    additionalFees,
    discount,
    customerName: cartCustomerName,
    note: cartNote,
    getTotalAmount,
    getTotalWithTax,
    setCustomerName,
    setNote,
    clearCart,
  } = useCartStore();

  const [amount, setAmount] = useState<string>("0");
  const [receiptNote, setReceiptNote] = useState<string>(cartNote || "");
  const [customerName, setCustomerNameLocal] = useState<string>(
    cartCustomerName || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "debt">("cash");
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = getTotalWithTax();

  const formatCurrency = (value: string | number) => {
    if (!value) return "0";
    const stringValue = String(value);
    const [intPart] = stringValue.split(".");
    const cleaned = intPart.replace(/\D/g, "");
    if (!cleaned) return "0";
    const withDots = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };



  const handlePayment = async () => {
    // Validasi pembayaran
    if (Number(amount) < totalAmount) {
      Alert.alert(
        "Pembayaran Kurang",
        `Jumlah bayar minimal Rp ${formatCurrency(totalAmount)}`
      );
      return;
    }

    try {
      setIsProcessing(true);

      // Update customer name dan note di cart store
      setCustomerName(customerName);
      setNote(receiptNote);

      // Prepare transaction data
      const transactionData = {
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
          product_id: item.productId,
          variant_id: item.variantId || undefined,
          quantity: item.quantity,
          note: item.note,
        })),
        discount: discount,
        paid_amount: Number(amount),
        customer_name: customerName || undefined,
        note: receiptNote || undefined,
        additional_fees: additionalFees.map(fee => ({
          name: fee.name,
          amount: fee.amount,
        })),
      };

      console.log("📦 Creating transaction:", transactionData);

      const response = await transactionApi.createTransaction(transactionData);

      if (response.data) {
        console.log("✅ Transaction created:", response.data);

        // Prepare transaction result for settlement page
        const transactionResult = {
          id: response.data.id?.toString() || "",
          invoiceNumber: response.data.invoiceNumber || "",
          totalAmount: totalAmount,
          paymentMethod: paymentMethod,
          createdAt: response.data.createdAt || new Date().toISOString(),
        };

        // Clear cart
        clearCart();

        // Navigate to settlement page
        router.replace({
          pathname: "/dashboard/transaction/settlement",
          params: {
            transaction: JSON.stringify(transactionResult),
          },
        });
      }
    } catch (error: any) {
      console.error("❌ Failed to create transaction:", error);

      // Extract error message from API response
      let errorMessage = "Terjadi kesalahan saat memproses transaksi";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Transaksi Gagal", errorMessage);
    } finally {
      setIsProcessing(false);
    }
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
        withNotificationButton={false}
        title="Pembayaran"
      />

      {/* Content */}
      <View style={styles.mainWrapper}>
        {/* Left Column - Amount & Inputs */}
        <View style={styles.leftColumn}>
          <View style={styles.amountWrapper}>
            <Text
              style={[styles.amountLabel, { color: Colors[colorScheme].icon }]}
            >
              Total Tagihan
            </Text>
            <Text
              style={[
                styles.amountValue,
                {
                  color: Colors[colorScheme].text,
                  fontSize: isTablet ? 32 : 22,
                },
              ]}
            >
              Rp {formatCurrency(totalAmount)}
            </Text>

            <Text
              style={[styles.amountLabel, { color: Colors[colorScheme].icon }]}
            >
              Jumlah Dibayar
            </Text>
            <Text
              style={[styles.amountValue, { color: Colors[colorScheme].text }]}
            >
              Rp {formatCurrency(amount)}
            </Text>

        
          </View>

          {/* Input catatan */}
          <View style={styles.noteWrapper}>
            <TextInput
              value={receiptNote}
              onChangeText={setReceiptNote}
              placeholder="Catatan struk"
              placeholderTextColor={Colors[colorScheme].icon}
              style={styles.noteInput}
            />
          </View>
          <View style={styles.noteWrapper}>
            <TextInput
              value={customerName}
              onChangeText={setCustomerNameLocal}
              placeholder="Nama Customer (opsional)"
              placeholderTextColor={Colors[colorScheme].icon}
              style={styles.noteInput}
            />
          </View>

          {/* Calculator */}
          <PaymentCalculator value={amount} onChangeValue={setAmount} />
        </View>

        {/* Bottom continue button */}
        <View style={styles.bottomWrapper}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor:
                  isProcessing || Number(amount) < totalAmount
                    ? Colors[colorScheme].border
                    : Colors[colorScheme].primary,
              },
            ]}
            onPress={handlePayment}
            disabled={isProcessing || Number(amount) < totalAmount}
          >
            <Text style={[styles.continueButtonText, { color: "white" }]}>
              {isProcessing
                ? "Memproses..."
                : Number(amount) < totalAmount
                  ? "Jumlah Bayar Kurang"
                  : "Proses Pembayaran"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerWrapper: {
      paddingTop: isTablet ? 16 : 12,
      paddingBottom: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 24 : 16,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 6,
      backgroundColor: Colors[colorScheme].background,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: isTablet ? 44 : 32,
      height: isTablet ? 44 : 32,
      borderRadius: isTablet ? 22 : 16,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    totalText: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    headerRightPlaceholder: {
      width: isTablet ? 44 : 32,
      height: isTablet ? 44 : 32,
    },
    mainWrapper: {
      flex: 1,
      flexDirection: isTabletLandscape ? "row" : "column",
    },
    leftColumn: {
      flex: isTabletLandscape ? 1 : 1,
      paddingHorizontal: isTablet ? 24 : 4,
      paddingTop: isTablet ? 24 : 16,
      flexDirection: "column",
      borderRightWidth: isTabletLandscape ? 1 : 0,
      borderRightColor: Colors[colorScheme].border,
    },
    rightColumn: {
      flex: isTabletLandscape ? 1 : undefined,
      justifyContent: isTabletLandscape ? "flex-end" : undefined,
    },
    amountWrapper: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      flexDirection: "column",
      gap: 8,
    },
    amountLabel: {
      fontSize: isTablet ? 20 : 14,
      color: Colors[colorScheme].icon,
      marginBottom: isTablet ? 8 : 4,
    },
    amountValue: {
      fontSize: isTablet ? 42 : 32,
      fontWeight: "700",
      color: Colors[colorScheme].text,
    },
    changeWrapper: {
      alignItems: "center",
      marginTop: 8,
    },
    changeLabel: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
    },
    changeValue: {
      fontSize: 24,
      fontWeight: "600",
      color: Colors[colorScheme].primary,
    },
    noteWrapper: {
      marginBottom: isTablet ? 16 : 8,
      paddingHorizontal: isTablet ? 16 : 12,
    },
    noteInput: {
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: isTablet ? 20 : 16,
      paddingVertical: isTablet ? 14 : 10,
      fontSize: isTablet ? 18 : 14,
      borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      color: Colors[colorScheme].text,
    },
    methodRow: {
      flexDirection: "row",
      marginBottom: isTablet ? 24 : 16,
      justifyContent: "space-evenly",
      paddingHorizontal: isTablet ? 16 : 12,
      gap: isTablet ? 16 : 8,
    },
    methodBadge: {
      paddingHorizontal: isTablet ? 18 : 14,
      paddingVertical: isTablet ? 10 : 6,
      flex: isTablet ? 1 : undefined,
      borderRadius: 100,
      backgroundColor: Colors[colorScheme].secondary,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    methodBadgeActive: {
      backgroundColor: Colors[colorScheme].primary,
      borderColor: Colors[colorScheme].primary,
    },
    methodBadgeText: {
      fontSize: isTablet ? 18 : 13,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    methodBadgeTextActive: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
    },

    bottomWrapper: {
      paddingHorizontal: isTablet ? 24 : 16,
      paddingVertical: isTablet ? 20 : 16,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    continueButton: {
      width: "100%",
      height: isTablet ? 64 : 54,
      borderRadius: isTablet ? 10 : 8,
      alignItems: "center",
      justifyContent: "center",
    },
    continueButtonText: {
      fontSize: isTablet ? 20 : 16,
      fontWeight: "600",
    },
  });
