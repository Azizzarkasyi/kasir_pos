"use client";

import CheckoutItem from "@/components/atoms/checkout-item";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import {useRouter, useLocalSearchParams} from "expo-router";
import React, {useState, useEffect} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import {transactionApi} from "@/services/endpoints/transactions";
import {Transaction} from "@/types/api";

export default function TransactionDetailPage() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const params = useLocalSearchParams();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      const txnId = params.id as string;

      if (txnId) {
        try {
          setIsLoading(true);
          const response = await transactionApi.getTransaction(Number(txnId));
          if (response.data) {
            setTransaction(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch transaction:", error);
          Alert.alert("Error", "Gagal memuat detail transaksi");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTransaction();
  }, [params.id]);

  const items = transaction?.items || [];

  const formatCurrency = (value: number) => {
    if (!value) return "0";
    const intPart = Math.floor(value).toString();
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  const subtotal = transaction?.totalAmount || 0;
  const totalProduk = items.reduce((sum, item) => sum + item.quantity, 0);
  const dibayar = transaction?.totalAmount || 0;
  const kembalian = 0;

  const transactionDate = transaction?.createdAt
    ? new Date(transaction.createdAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const paymentMethod =
    transaction?.paymentMethod === "cash" ? "Tunai" : "Hutang";

  const handleCancelTransaction = () => {
    Alert.alert(
      "Batalkan Transaksi",
      "Yakin ingin membatalkan transaksi ini?",
      [
        {text: "Tidak", style: "cancel"},
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: async () => {
            try {
              if (transaction?.id) {
                await transactionApi.cancelTransaction(transaction.id);
                Alert.alert("Berhasil", "Transaksi dibatalkan");
                router.back();
              }
            } catch (error) {
              Alert.alert("Error", "Gagal membatalkan transaksi");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {backgroundColor: Colors[colorScheme].background},
        ]}
      >
        <Header showBack={true} showHelp={false} title="Detail Transaksi" />
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          <Text style={{marginTop: 16, color: Colors[colorScheme].text}}>
            Memuat detail transaksi...
          </Text>
        </View>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View
        style={[
          styles.container,
          {backgroundColor: Colors[colorScheme].background},
        ]}
      >
        <Header showBack={true} showHelp={false} title="Detail Transaksi" />
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <Text style={{color: Colors[colorScheme].text}}>
            Transaksi tidak ditemukan
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: Colors[colorScheme].background},
      ]}
    >
      <Header
        showBack={true}
        showHelp={false}
        title={`#${transaction.invoiceNumber || "Detail"}`}
      />

      <ScrollView
        style={styles.contentWrapper}
        contentContainerStyle={styles.contentInner}
      >
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRowPrimary}>
            <Text style={styles.sectionTitle}>Detail Transaksi</Text>
            <Text style={styles.sectionCode}>#{transaction.invoiceNumber}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoWrapper}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipe Pembayaran</Text>
              <Text style={styles.infoValue}>{paymentMethod}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>
                {transaction.paymentStatus === "paid" ? "Dibayar" : "Pending"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal Transaksi</Text>
              <Text style={styles.infoValue}>{transactionDate}</Text>
            </View>
            <View style={styles.buttonStack}>
              <ThemedButton
                title="Batalkan"
                size="medium"
                variant="secondary"
                onPress={handleCancelTransaction}
              />
              <ThemedButton
                title="Kirim Struk"
                size="medium"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: "/dashboard/transaction/share-struck",
                    params: {transactionId: transaction.id?.toString() || ""},
                  })
                }
              />
              <ThemedButton
                title="Cetak Struk"
                size="medium"
                variant="primary"
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionCard2}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.sectionHeaderRowSecondary,
              isDetailOpen
                ? {
                    borderBottomWidth: 1,
                    borderBottomColor: Colors[colorScheme].border,
                  }
                : {},
            ]}
            onPress={() => setIsDetailOpen(prev => !prev)}
          >
            <Text style={styles.sectionTitle}>Detail Pembelian</Text>
            <Ionicons
              name={
                isDetailOpen ? "chevron-up-outline" : "chevron-down-outline"
              }
              size={18}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>

          {isDetailOpen && (
            <>
              <View style={styles.itemsWrapper}>
                {items.map((item, index) => (
                  <CheckoutItem
                    key={item.id || index}
                    index={index + 1}
                    name={item.productName}
                    quantity={item.quantity}
                    unitPrice={item.price}
                    hideDeleteButton
                  />
                ))}
              </View>

              <View style={styles.summaryWrapper}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>
                    Rp {formatCurrency(subtotal)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Total ({totalProduk} Produk)
                  </Text>
                  <Text style={styles.summaryValue}>
                    Rp {formatCurrency(subtotal)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Dibayar</Text>
                  <Text style={styles.summaryValue}>
                    Rp {formatCurrency(dibayar)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Kembalian</Text>
                  <Text style={styles.summaryValue}>
                    Rp {formatCurrency(kembalian)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentWrapper: {
      flex: 1,
    },
    contentInner: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      rowGap: 16,
    },
    sectionCard: {
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      paddingVertical: 16,
    },
    infoWrapper: {
      padding: 16,
    },
    sectionCard2: {
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    sectionHeaderRowPrimary: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 16,
      paddingHorizontal: 16,
      justifyContent: "space-between",
    },
    sectionHeaderRowSecondary: {
      flexDirection: "row",
      padding: 16,
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    sectionCode: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].icon,
    },
    divider: {
      height: 1,
      backgroundColor: Colors[colorScheme].border,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    infoLabel: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
    },
    infoValue: {
      fontSize: 13,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    buttonStack: {
      marginTop: 16,
      rowGap: 10,
    },
    headerIconButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    outlineButton: {
      width: "100%",
      height: 44,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].secondary,
    },
    outlineButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    primaryButton: {
      width: "100%",
      height: 44,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    itemsWrapper: {
      marginTop: 8,
      rowGap: 8,
    },
    summaryWrapper: {
      marginTop: 12,
      borderTopWidth: 1,
      borderColor: Colors[colorScheme].border2,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border2,
    },
    summaryLabel: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
    },
    summaryValue: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
  });
