"use client";

import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import PaymentMethodModal from "@/components/drawers/payment-method-modal";
import Header from "@/components/header";
import PaymentCalculator from "@/components/mollecules/payment-calculator";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { transactionApi } from "@/services/endpoints/transactions";
import { useCartStore } from "@/stores/cart-store";
import { useTaxStore } from "@/stores/tax-store";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, useWindowDimensions,
  View
} from "react-native";

type PaymentMethod = "cash" | "debt" | "qris" | "grab" | "shopee_food" | "bank_transfer" | "e_wallet" | "credit_card" | "debit_card";

const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    cash: "Tunai",
    debt: "Utang",
    qris: "QRIS",
    grab: "Grab",
    shopee_food: "ShopeeFood",
    bank_transfer: "Transfer Bank",
    e_wallet: "E-Wallet",
    credit_card: "Kartu Kredit",
    debit_card: "Kartu Debit",
  };
  return labels[method] || method;
};

export default function PaymentPage() {
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
    additionalIngredients,
    discount,
    customerName: cartCustomerName,
    note: cartNote,
    getTotalAmount,
    getTotalWithTax,
    setCustomerName,
    setNote,
    clearCart,
  } = useCartStore();

  const { taxRate, isLoading: isTaxLoading, fetchTaxRate } = useTaxStore();
  const [isInitializing, setIsInitializing] = useState(true);

  const [amount, setAmount] = useState<string>("0");
  const [receiptNote, setReceiptNote] = useState<string>(cartNote || "");
  const [customerName, setCustomerNameLocal] = useState<string>(
    cartCustomerName || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = getTotalWithTax();

  useEffect(() => {
    const initializeTax = async () => {
      try {
        await fetchTaxRate();
      } catch (error) {
        console.error('Failed to fetch tax rate:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeTax();
  }, []);

  // Add back navigation confirmation
  useEffect(() => {
    const sub = navigation.addListener("beforeRemove", (e) => {
      // Allow navigation if going forward to settlement
      const action = e.data.action;

      // Check if the navigation is going forward (to settlement)
      if (action.type === 'NAVIGATE' && (action.payload as any)?.name === '/dashboard/transaction/settlement') {
        return;
      }

      e.preventDefault();

      confirmationRef.current?.showConfirmationDialog({
        title: "Konfirmasi",
        message: "Anda yakin ingin kembali? Data pembayaran akan hilang.",
        onCancel: () => {
          // Stay on the page
        },
        onConfirm: () => {
          navigation.dispatch(action);
        },
      });
    });

    return sub;
  }, [navigation]);

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
        additional_ingredients: additionalIngredients.map(ing => ({
          variant_id: ing.variantId,
          quantity: ing.quantity,
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
        router.push({
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
        {isInitializing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
            <Text style={styles.loadingText}>Memuat data pajak...</Text>
            <Text style={styles.loadingSubtext}>Mohon tunggu sebentar</Text>
          </View>
        ) : (
          <>
            {/* Left Column - Amount & Inputs */}
            <View style={styles.leftColumn}>
              {/* Payment Method Badge */}
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
              <View style={styles.calculatorWrapper}>
                <PaymentCalculator
                  value={amount}
                  onChangeValue={(value) => {
                    if (value === "exact") {
                      // Set amount to total bill when "Uang Pas" is clicked
                      setAmount(totalAmount.toString());
                    } else {
                      setAmount(value);
                    }
                  }}
                  paymentMethodBadge={
                    <TouchableOpacity
                      style={styles.paymentMethodBadge}
                      onPress={() => setShowPaymentMethodModal(true)}
                    >
                      <Ionicons
                        name="wallet-outline"
                        size={isTablet ? 18 : 14}
                        color={Colors[colorScheme].text}
                      />
                      <Text style={styles.paymentMethodText}>
                        {getPaymentMethodLabel(paymentMethod)}
                      </Text>
                      <Ionicons
                        name="chevron-down-outline"
                        size={isTablet ? 12 : 10}
                        color={Colors[colorScheme].icon}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>
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
          </>
        )}
      </View>

      <PaymentMethodModal
        visible={showPaymentMethodModal}
        onClose={() => setShowPaymentMethodModal(false)}
        onSelect={setPaymentMethod}
        selectedMethod={paymentMethod}
        colorScheme={colorScheme}
      />
      <ConfirmationDialog ref={confirmationRef} />
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    loadingText: {
      fontSize: isTablet ? 16 : 14,
      color: Colors[colorScheme].icon,
      marginTop: 16,
    },
    loadingSubtext: {
      fontSize: isTablet ? 14 : 12,
      color: Colors[colorScheme].icon,
      marginTop: 8,
      opacity: 0.7,
    },
    calculatorWrapper: {
      marginTop: isTablet ? 20 : 16,
    },
    paymentMethodBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 8 : 6,
      backgroundColor: Colors[colorScheme].secondary,
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 10 : 6,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    paymentMethodIcon: {
      marginRight: 6,
    },
    paymentMethodText: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
      flex: 1,
    },
    paymentMethodArrow: {
      marginLeft: 6,
    },
  });
