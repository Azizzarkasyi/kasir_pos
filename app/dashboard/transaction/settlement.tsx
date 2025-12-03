"use client";

import Header from "@/components/header";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import {useRouter, useLocalSearchParams} from "expo-router";
import React, {useEffect, useState} from "react";
import {StyleSheet, Text, TouchableOpacity, View, Share} from "react-native";
import {useCartStore} from "@/stores/cart-store";

type TransactionResult = {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  createdAt: string;
};

export default function TransactionSettlementPage() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const params = useLocalSearchParams();

  const {getTotalAmount, clearCart} = useCartStore();

  const [transaction, setTransaction] = useState<TransactionResult | null>(
    null
  );

  useEffect(() => {
    // Parse transaction data from params
    if (params.transaction) {
      try {
        const txnData = JSON.parse(params.transaction as string);
        setTransaction(txnData);
      } catch (error) {
        console.error("Failed to parse transaction data:", error);
      }
    }
  }, [params.transaction]);

  const paymentMethod =
    transaction?.paymentMethod === "cash" ? "Tunai" : "Hutang";
  const totalTagihan = transaction?.totalAmount || 0;
  const diterima = transaction?.paidAmount || 0;
  const kembali = transaction?.changeAmount || 0;
  const transactionDate = transaction?.createdAt
    ? new Date(transaction.createdAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const formatCurrency = (value: number) => {
    if (!value) return "0";
    const intPart = Math.floor(value).toString();
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  const handleShareReceipt = async () => {
    try {
      const message = `Transaksi Berhasil\n\nNo: ${
        transaction?.invoiceNumber || "-"
      }\nTotal: Rp ${formatCurrency(totalTagihan)}\nBayar: Rp ${formatCurrency(
        diterima
      )}\nKembali: Rp ${formatCurrency(
        kembali
      )}\nMetode: ${paymentMethod}\nWaktu: ${transactionDate}`;

      await Share.share({
        message: message,
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleNewTransaction = () => {
    clearCart();
    router.replace("/dashboard/transaction");
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: Colors[colorScheme].background},
      ]}
    >
      <Header
        showBack
        showHelp={false}
        title="Pembayaran Berhasil"
        withNotificationButton={false}
      />
      <View style={styles.contentWrapper}>
        <View style={styles.statusWrapper}>
          <View style={styles.statusIconWrapper}>
            <Ionicons
              name="checkmark"
              size={40}
              color={Colors[colorScheme].primary}
            />
          </View>

          <Text style={styles.successTitle}>Transaksi Berhasil</Text>
          <Text style={styles.successSubtitle}>{transactionDate}</Text>
          {transaction?.invoiceNumber && (
            <Text style={[styles.successSubtitle, {marginTop: 4}]}>
              #{transaction.invoiceNumber}
            </Text>
          )}
        </View>

        <View style={styles.detailWrapper}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pembayaran</Text>
            <Text style={styles.detailValue}>{paymentMethod}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Tagihan</Text>
            <Text style={styles.detailValue}>
              Rp{formatCurrency(totalTagihan)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Diterima</Text>
            <Text style={styles.detailValue}>Rp{formatCurrency(diterima)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kembali</Text>
            <Text style={styles.detailValue}>Rp{formatCurrency(kembali)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomWrapper}>
        <View style={styles.topButtonsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              // TODO: Implement print functionality
              console.log("Print receipt");
            }}
          >
            <Text style={styles.secondaryButtonText}>Cetak Struk</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              if (transaction) {
                router.push({
                  pathname: "/dashboard/transaction/share-struck",
                  params: {transactionId: transaction.id},
                });
              } else {
                handleShareReceipt();
              }
            }}
          >
            <Text style={styles.secondaryButtonText}>Kirim Struk</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {backgroundColor: Colors[colorScheme].primary},
          ]}
          onPress={handleNewTransaction}
        >
          <Text
            style={[
              styles.primaryButtonText,
              {color: Colors[colorScheme].text},
            ]}
          >
            Transaksi Baru
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
      justifyContent: "space-between",
    },
    contentWrapper: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 40,
      alignItems: "center",
    },
    statusWrapper: {
      alignItems: "center",
      marginBottom: 32,
    },
    statusIconWrapper: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 4,
      borderColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    successTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: Colors[colorScheme].text,
      marginBottom: 6,
    },
    successSubtitle: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
    },
    detailWrapper: {
      width: "100%",
      marginTop: 32,
      rowGap: 16,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    detailLabel: {
      fontSize: 15,
      color: Colors[colorScheme].icon,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    bottomWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
      rowGap: 12,
    },
    topButtonsRow: {
      flexDirection: "row",
      columnGap: 12,
    },
    secondaryButton: {
      flex: 1,
      height: 48,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    secondaryFullButton: {
      width: "100%",
      height: 48,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    primaryButton: {
      width: "100%",
      height: 52,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "700",
    },
  });
