"use client";

import Header from "@/components/header";
import PaymentCalculator from "@/components/mollecules/payment-calculator";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useRouter} from "expo-router";
import React, {useState, useEffect, useRef} from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import {useCartStore} from "@/stores/cart-store";
import {transactionApi} from "@/services/endpoints/transactions";

export default function PaymentPage() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

  const {
    items: cartItems,
    additionalFees,
    discount,
    customerName: cartCustomerName,
    note: cartNote,
    getTotalAmount,
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

  const totalAmount = getTotalAmount();

  // Set initial amount dari total cart
  useEffect(() => {
    if (totalAmount > 0) {
      setAmount(totalAmount.toString());
    }
  }, [totalAmount]);

  const formatCurrency = (value: string | number) => {
    if (!value) return "0";
    const stringValue = String(value);
    const [intPart] = stringValue.split(".");
    const cleaned = intPart.replace(/\D/g, "");
    if (!cleaned) return "0";
    const withDots = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  const paidAmount = amount === "0" ? 0 : Number(amount.replace(/\D/g, ""));
  const changeAmount = paidAmount - totalAmount;

  const handlePayment = async () => {
    // Validasi pembayaran
    if (paidAmount < totalAmount) {
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
        paid_amount: paidAmount,
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
          paidAmount: paidAmount,
          changeAmount: changeAmount,
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
        {backgroundColor: Colors[colorScheme].background},
      ]}
    >
      <Header
        showHelp={false}
        withNotificationButton={false}
        title="Pembayaran"
      />

      {/* Content */}
      <View style={styles.mainWrapper}>
        <View style={styles.contentWrapper}>
          <View style={styles.amountWrapper}>
            <Text
              style={[styles.amountLabel, {color: Colors[colorScheme].icon}]}
            >
              Total Tagihan
            </Text>
            <Text
              style={[styles.amountValue, {color: Colors[colorScheme].text}]}
            >
              Rp {formatCurrency(totalAmount)}
            </Text>
            {changeAmount > 0 && (
              <View style={styles.changeWrapper}>
                <Text
                  style={[
                    styles.changeLabel,
                    {color: Colors[colorScheme].icon},
                  ]}
                >
                  Kembalian
                </Text>
                <Text
                  style={[
                    styles.changeValue,
                    {color: Colors[colorScheme].primary},
                  ]}
                >
                  Rp {formatCurrency(changeAmount)}
                </Text>
              </View>
            )}
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

          {/* Payment Method Selector */}
          <View style={styles.methodRow}>
            <TouchableOpacity
              style={[
                styles.methodBadge,
                paymentMethod === "cash" && styles.methodBadgeActive,
              ]}
              onPress={() => setPaymentMethod("cash")}
            >
              <Text
                style={[
                  styles.methodBadgeText,
                  paymentMethod === "cash" && styles.methodBadgeTextActive,
                ]}
              >
                Tunai
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodBadge,
                paymentMethod === "debt" && styles.methodBadgeActive,
              ]}
              onPress={() => setPaymentMethod("debt")}
            >
              <Text
                style={[
                  styles.methodBadgeText,
                  paymentMethod === "debt" && styles.methodBadgeTextActive,
                ]}
              >
                Hutang
              </Text>
            </TouchableOpacity>
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
                  isProcessing || paidAmount < totalAmount
                    ? Colors[colorScheme].border
                    : Colors[colorScheme].primary,
              },
            ]}
            onPress={handlePayment}
            disabled={isProcessing || paidAmount < totalAmount}
          >
            <Text style={[styles.continueButtonText, {color: "white"}]}>
              {isProcessing
                ? "Memproses..."
                : paidAmount < totalAmount
                ? "Jumlah Bayar Kurang"
                : "Proses Pembayaran"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerWrapper: {
      paddingTop: 12,
      paddingBottom: 12,
      paddingHorizontal: 16,
      shadowColor: "#000000",
      shadowOffset: {width: 0, height: 2},
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
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: {
      flex: 1,
      alignItems: "center",
    },
    totalText: {
      fontSize: 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    headerRightPlaceholder: {
      width: 32,
      height: 32,
    },
    mainWrapper: {
      flex: 1,
    },
    contentWrapper: {
      flex: 1,
      paddingHorizontal: 4,
      paddingTop: 16,
      flexDirection: "column",
    },
    amountWrapper: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      flexDirection: "column",
      gap: 8,
    },
    amountLabel: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginBottom: 4,
    },
    amountValue: {
      fontSize: 32,
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
      marginBottom: 12,
      paddingHorizontal: 12,
    },
    noteInput: {
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 14,
      borderColor: Colors[colorScheme].border,
      borderWidth: 1,
      color: Colors[colorScheme].text,
    },
    methodRow: {
      flexDirection: "row",
      marginBottom: 16,
      justifyContent: "space-evenly",
    },
    methodBadge: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].secondary,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    methodBadgeActive: {
      backgroundColor: Colors[colorScheme].primary,
      borderColor: Colors[colorScheme].primary,
    },
    methodBadgeText: {
      fontSize: 13,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    methodBadgeTextActive: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
    },

    bottomWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    continueButton: {
      width: "100%",
      height: 54,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
