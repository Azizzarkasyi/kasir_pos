"use client";

import Header from "@/components/header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCartStore } from "@/stores/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Share, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

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
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
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
      <ScrollView
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.statusWrapper}>
            <View style={styles.statusIconWrapper}>
              <Ionicons
                name="checkmark"
                size={isTablet ? 56 : 40}
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
                {color: "white"},
              ]}
            >
              Transaksi Baru
            </Text>
          </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollWrapper: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: isTablet ? 24 : 16,
    },
    contentWrapper: {
      flex: 1,
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
      paddingTop: isTablet ? 56 : 40,
      alignItems: "center",
    },
    statusWrapper: {
      alignItems: "center",
      marginBottom: isTablet ? 48 : 32,
    },
    statusIconWrapper: {
      width: isTablet ? 120 : 96,
      height: isTablet ? 120 : 96,
      borderRadius: isTablet ? 60 : 48,
      borderWidth: isTablet ? 5 : 4,
      borderColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isTablet ? 32 : 24,
    },
    successTitle: {
      fontSize: isTablet ? 28 : 22,
      fontWeight: "700",
      color: Colors[colorScheme].text,
      marginBottom: isTablet ? 10 : 6,
    },
    successSubtitle: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].icon,
    },
    detailWrapper: {
      width: "100%",
      maxWidth: isTablet ? 500 : undefined,
      marginTop: isTablet ? 48 : 32,
      rowGap: isTablet ? 20 : 16,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    detailLabel: {
      fontSize: isTablet ? 18 : 15,
      color: Colors[colorScheme].icon,
    },
    detailValue: {
      fontSize: isTablet ? 18 : 15,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    bottomWrapper: {
      width: "100%",
      paddingVertical: isTablet ? 24 : 20,
      marginTop: isTablet ? 48 : 32,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      rowGap: isTablet ? 16 : 12,
    },
    topButtonsRow: {
      flexDirection: "row",
      columnGap: isTablet ? 16 : 12,
    },
    secondaryButton: {
      flex: 1,
      height: isTablet ? 56 : 48,
      borderRadius: isTablet ? 10 : 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    secondaryFullButton: {
      width: "100%",
      height: isTablet ? 56 : 48,
      borderRadius: isTablet ? 10 : 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    secondaryButtonText: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    primaryButton: {
      width: "100%",
      height: isTablet ? 60 : 52,
      borderRadius: isTablet ? 10 : 8,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      fontSize: isTablet ? 20 : 16,
      fontWeight: "700",
    },
  });
