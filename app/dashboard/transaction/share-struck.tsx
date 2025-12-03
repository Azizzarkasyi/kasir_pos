"use client";

import Header from "@/components/header";
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
  Share,
  ActivityIndicator,
  Alert,
} from "react-native";
import {transactionApi} from "@/services/endpoints/transactions";
import {Transaction} from "@/types/api";
import {useCartStore} from "@/stores/cart-store";

export default function ShareStruckPage() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const params = useLocalSearchParams();

  const {items: cartItems, getTotalAmount, additionalFees} = useCartStore();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      const txnId = params.transactionId as string;

      if (txnId) {
        try {
          setIsLoading(true);
          const response = await transactionApi.getTransaction(Number(txnId));
          if (response.data) {
            setTransaction(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch transaction:", error);
          Alert.alert("Error", "Gagal memuat data transaksi");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchTransaction();
  }, [params.transactionId]);

  // Use transaction items or cart items
  const items =
    transaction?.items ||
    cartItems.map(item => ({
      productName: item.variantName
        ? `${item.productName} - ${item.variantName}`
        : item.productName,
      quantity: item.quantity,
      price: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
    }));

  const formatCurrency = (value: number) => {
    if (!value) return "0";
    const intPart = Math.floor(value).toString();
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  const subtotal = transaction
    ? transaction.totalAmount
    : items.reduce(
        (sum, item) => sum + (item.subtotal || item.price * item.quantity),
        0
      );

  const totalProduk = items.reduce((sum, item) => sum + item.quantity, 0);
  const dibayar = transaction?.totalAmount || subtotal;
  const kembalian = 0; // Calculate from transaction data if available

  const transactionDate = transaction?.createdAt
    ? new Date(transaction.createdAt).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const paymentMethod =
    transaction?.paymentMethod === "cash" ? "Tunai" : "Hutang";

  const handleShare = async () => {
    try {
      const receiptText = `STRUK PEMBAYARAN\n\nBasofi Rswt - Pusat\n\nNo. Struk: ${
        transaction?.invoiceNumber || "-"
      }\nWaktu: ${transactionDate}\nPembayaran: ${paymentMethod}\n\n--- DETAIL PEMBELIAN ---\n${items
        .map(
          (item, i) =>
            `${i + 1}. ${item.productName || "Item"}\n   ${formatCurrency(
              item.price || item.subtotal / item.quantity
            )} x ${item.quantity} = ${formatCurrency(
              item.subtotal || item.price * item.quantity
            )}`
        )
        .join("\n\n")}\n\n--- RINGKASAN ---\nSubtotal: Rp ${formatCurrency(
        subtotal
      )}\nTotal: Rp ${formatCurrency(subtotal)}\nBayar: Rp ${formatCurrency(
        dibayar
      )}\nKembali: Rp ${formatCurrency(
        kembalian
      )}\n\nPowered by Qasir\nwww.qasir.id`;

      await Share.share({
        message: receiptText,
      });
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  if (isLoading) {
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
          title="Pratinjau"
          withNotificationButton={false}
          onBackPress={() => router.back()}
        />
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          <Text style={{marginTop: 16, color: Colors[colorScheme].text}}>
            Memuat struk...
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
        showBack
        showHelp={false}
        title="Pratinjau"
        withNotificationButton={false}
        onBackPress={() => router.back()}
      />

      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.receiptCard}>
            <View style={styles.storeHeaderWrapper}>
              <Text style={styles.storeName}>Basofi Rswt</Text>
              <Text style={styles.storeBranch}>Pusat</Text>
            </View>

            <View style={styles.sectionDivider} />

            <View style={styles.infoGrid}>
              <View style={styles.infoGridRow}>
                <Text style={styles.infoLabel}>Kasir</Text>
                <Text style={styles.infoValue}>Basofi Rswt</Text>
              </View>
              <View style={styles.infoGridRow}>
                <Text style={styles.infoLabel}>Waktu</Text>
                <Text style={styles.infoValue}>{transactionDate}</Text>
              </View>
              <View style={styles.infoGridRow}>
                <Text style={styles.infoLabel}>No. Struk</Text>
                <Text style={styles.infoValue}>
                  #{transaction?.invoiceNumber || "-"}
                </Text>
              </View>
              <View style={styles.infoGridRow}>
                <Text style={styles.infoLabel}>Jenis Pembayaran</Text>
                <Text style={styles.infoValue}>{paymentMethod}</Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            <View style={styles.copyBannerWrapper}>
              <Text style={styles.copyBannerText}>### SALINAN ###</Text>
            </View>

            <View style={styles.itemsSection}>
              {items.map((item, index) => {
                const unitPrice =
                  item.price ||
                  (item.subtotal ? item.subtotal / item.quantity : 0);
                const lineTotal = item.subtotal || item.price * item.quantity;
                return (
                  <View key={item.id || index} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemName}>
                        {item.productName || "Item"}
                      </Text>
                      <Text style={styles.itemSubText}>
                        {formatCurrency(unitPrice)} x {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemAmount}>
                      {formatCurrency(lineTotal)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.sectionDivider} />

            <View style={styles.summarySection}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, styles.summaryLabelStrong]}>
                  Total ({totalProduk} Produk)
                </Text>
                <Text style={[styles.summaryValue, styles.summaryValueStrong]}>
                  {formatCurrency(subtotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Bayar</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(dibayar)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Kembali</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(kembalian)}
                </Text>
              </View>
            </View>

            <View style={styles.footerWrapper}>
              <Text style={styles.footerText}>Powered by Qasir</Text>
              <Text style={styles.footerText}>www.qasir.id</Text>
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.fabButton,
            {backgroundColor: Colors[colorScheme].primary},
          ]}
          activeOpacity={0.8}
          onPress={handleShare}
        >
          <Ionicons
            name="share-social-outline"
            size={22}
            color={Colors[colorScheme].secondary}
          />
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
    contentWrapper: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      paddingBottom: 32,
      alignItems: "center",
    },
    receiptCard: {
      width: "100%",
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].secondary,
      paddingVertical: 18,
      paddingHorizontal: 20,
    },
    storeHeaderWrapper: {
      alignItems: "center",
      marginBottom: 12,
    },
    storeName: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    storeBranch: {
      marginTop: 2,
      fontSize: 13,
      color: Colors[colorScheme].icon,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: Colors[colorScheme].border,
      marginVertical: 10,
    },
    infoGrid: {
      rowGap: 6,
    },
    infoGridRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    infoLabel: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
    },
    infoValue: {
      fontSize: 13,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    copyBannerWrapper: {
      alignItems: "center",
      marginVertical: 8,
    },
    copyBannerText: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    itemsSection: {
      marginTop: 4,
      rowGap: 6,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    itemLeft: {
      flexShrink: 1,
      paddingRight: 12,
    },
    itemName: {
      fontSize: 13,
      color: Colors[colorScheme].text,
      marginBottom: 2,
    },
    itemSubText: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
    },
    itemAmount: {
      fontSize: 13,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    summarySection: {
      marginTop: 10,
      rowGap: 4,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
    },
    summaryLabelStrong: {
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    summaryValue: {
      fontSize: 13,
      color: Colors[colorScheme].text,
    },
    summaryValueStrong: {
      fontWeight: "600",
    },
    footerWrapper: {
      marginTop: 16,
      alignItems: "center",
      rowGap: 2,
    },
    footerText: {
      fontSize: 11,
      color: Colors[colorScheme].icon,
    },
    fabButton: {
      position: "absolute",
      right: 24,
      bottom: 24,
      width: 52,
      height: 52,
      borderRadius: 26,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 6,
    },
  });
