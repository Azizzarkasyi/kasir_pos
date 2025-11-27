"use client";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TransactionSettlementPage() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

  const paymentMethod = "Tunai";
  const totalTagihan = 20000;
  const diterima = 20000;
  const kembali = 0;

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
          <Text style={styles.successSubtitle}>20-Nov-2025, 07:24</Text>
        </View>

        <View style={styles.detailWrapper}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pembayaran</Text>
            <Text style={styles.detailValue}>{paymentMethod}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Tagihan</Text>
            <Text style={styles.detailValue}>Rp{formatCurrency(totalTagihan)}</Text>
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
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Cetak Struk</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => { router.push("/dashboard/transaction/share-struck" as never)}}>
            <Text style={styles.secondaryButtonText}>Kirim Struk</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Colors[colorScheme].primary }]}
          onPress={() => router.replace("/dashboard/transaction" as never)}
        >
          <Text
            style={[
              styles.primaryButtonText,
              { color: Colors[colorScheme].secondary },
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

