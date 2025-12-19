"use client";

import Header from "@/components/header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { settingsApi, StoreInfo } from "@/services";
import { transactionApi } from "@/services/endpoints/transactions";
import { shareReceiptAsPDF } from "@/services/receipt";
import { useCartStore } from "@/stores/cart-store";
import { Transaction } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

export default function ShareStruckPage() {
    const colorScheme = useColorScheme() ?? "light";
    const { width, height } = useWindowDimensions();
    const isTablet = Math.min(width, height) >= 600;
    const styles = createStyles(colorScheme, isTablet);
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const { items: cartItems, getTotalAmount, additionalFees } = useCartStore();

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [store, setStore] = useState<StoreInfo | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTransaction = async () => {
            if (id) {
                try {
                    setIsLoading(true);
                    const response = await transactionApi.getTransaction(id);
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

        const fetchStore = async () => {
            try {
                const response = await settingsApi.getStoreInfo();
                if (response.data) {
                    setStore(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch store info:", error);
            }
        };

        fetchTransaction();
        fetchStore();
    }, [id]);

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
    const dibayar = transaction?.paidAmount ?? subtotal;
    const kembalian = transaction?.changeAmount ?? 0;

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

    const storeName = store?.owner_name || "Basofi Rswt";
    const storeBranch = store?.province?.name || "Pusat";
    const storeAddress = store?.address || "";
    const storePhone = store?.owner_phone || "";

    const additionalFeesList =
        transaction?.additional_fees && transaction.additional_fees.length > 0
            ? transaction.additional_fees
            : additionalFees || [];

    const handleShare = async () => {
        try {
            const storeLine = `${storeName}${storeBranch ? " - " + storeBranch : ""}`;
            const addressLine = storeAddress ? `\n${storeAddress}` : "";

            const additionalFeesText =
                additionalFeesList && additionalFeesList.length > 0
                    ? `\n\n--- BIAYA TAMBAHAN ---\n${additionalFeesList
                        .map(
                            fee => `${fee.name}: Rp ${formatCurrency(fee.amount || 0)}`
                        )
                        .join("\n")}`
                    : "";

            const receiptText = `STRUK PEMBAYARAN\n\n${storeLine}${addressLine}\n\nNo. Struk: ${transaction?.invoiceNumber || "-"
                }\nWaktu: ${transactionDate}\nPembayaran: ${paymentMethod}\n\n--- DETAIL PEMBELIAN ---\n${items
                    .map(
                        (item, i) =>
                            `${i + 1}. ${item.productName || "Item"}\n   ${formatCurrency(
                                item.price || item.subtotal / item.quantity
                            )} x ${item.quantity} = ${formatCurrency(
                                item.subtotal || item.price * item.quantity
                            )}`
                    )
                    .join("\n\n")}${additionalFeesText}\n\n--- RINGKASAN ---\nSubtotal: Rp ${formatCurrency(
                        subtotal
                    )}\nTotal: Rp ${formatCurrency(subtotal)}\nBayar: Rp ${formatCurrency(
                        dibayar
                    )}\nKembali: Rp ${formatCurrency(
                        kembalian
                    )}\n\nPowered by ELBIC\nwww.qasir.id`;

            await Share.share({
                message: receiptText,
            });
        } catch (error) {
            console.error("Share failed:", error);
        }
    };

    const handleSharePDF = async () => {
        try {
            const receiptItems = items.map(item => ({
                productName: item.productName || "Item",
                quantity: item.quantity,
                price: item.price || (item.subtotal ? item.subtotal / item.quantity : 0),
                subtotal: item.subtotal || item.price * item.quantity,
            }));

            await shareReceiptAsPDF({
                transaction,
                store,
                items: receiptItems,
                subtotal,
                dibayar,
                kembalian,
                transactionDate,
                paymentMethod,
                additionalFees: additionalFeesList,
                formatCurrency,
            });
        } catch (error) {
            console.error("Share PDF failed:", error);
            Alert.alert("Error", "Gagal membuat PDF struk");
        }
    };

    if (isLoading) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: Colors[colorScheme].background },
                ]}
            >
                <Header
                    showBack
                    showHelp={false}
                    title="Pratinjau"
                    withNotificationButton={false}
                    onBackPress={() => router.back()}
                />
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
                    <Text style={{ marginTop: 16, color: Colors[colorScheme].text }}>
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
                { backgroundColor: Colors[colorScheme].background },
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
                            <Text style={styles.storeName}>{storeName} ({storeBranch})</Text>
                        </View>

                        {storeAddress ? (
                            <>
                                <View
                                    style={{ marginBottom: isTablet ? 8 : 4, alignItems: "center" }}
                                >
                                    <Text style={styles.storeBranch}>{storeAddress}</Text>
                                </View>
                                <View
                                    style={{ marginBottom: isTablet ? 8 : 4, alignItems: "center" }}
                                >
                                    <Text style={styles.storeBranch}>{storePhone}</Text>
                                </View>
                            </>
                        ) : null}

                        <View style={styles.sectionDivider} />

                        <View style={styles.infoGrid}>
                            <View style={styles.infoGridRow}>
                                <Text style={styles.infoLabel}>Kasir</Text>
                                <Text style={styles.infoValue}>{transaction?.cashier.name}</Text>
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
                        <View style={styles.sectionDivider} />

                        <View style={styles.itemsSection}>
                            {items.map((item, index) => {
                                const unitPrice =
                                    item.price ||
                                    (item.subtotal ? item.subtotal / item.quantity : 0);
                                const lineTotal = item.subtotal || item.price * item.quantity;
                                return (
                                    <View key={index} style={styles.itemRow}>
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

                        {additionalFeesList && additionalFeesList.length > 0 && (
                            <View style={[styles.itemsSection, { marginTop: isTablet ? 12 : 8 }]}>
                                {additionalFeesList.map((fee, index) => (
                                    <View key={`fee-${index}`} style={styles.itemRow}>
                                        <View style={styles.itemLeft}>
                                            <Text style={styles.itemName}>{fee.name}</Text>
                                        </View>
                                        <Text style={styles.itemAmount}>
                                            {formatCurrency(fee.amount || 0)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

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
                            <Text style={styles.footerText}>Powered by ELBIC</Text>
                            <Text style={styles.footerText}>www.elbic.id</Text>
                        </View>
                    </View>
                </ScrollView>

                <TouchableOpacity
                    style={[
                        styles.fabButton,
                        { backgroundColor: Colors[colorScheme].primary },
                    ]}
                    activeOpacity={0.8}
                    onPress={handleSharePDF}
                >
                    <Ionicons
                        name="share-social-outline"
                        size={isTablet ? 24 : 20}
                        color={Colors[colorScheme].secondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
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
            paddingHorizontal: isTablet ? 40 : 24,
            paddingVertical: isTablet ? 24 : 16,
            paddingBottom: isTablet ? 48 : 32,
            alignItems: "center",
        },
        receiptCard: {
            width: "100%",
            maxWidth: isTablet ? 600 : undefined,
            borderRadius: isTablet ? 16 : 12,
            backgroundColor: Colors[colorScheme].secondary,
            paddingVertical: isTablet ? 24 : 18,
            paddingHorizontal: isTablet ? 28 : 20,
        },
        storeHeaderWrapper: {
            alignItems: "center",
            marginBottom: isTablet ? 16 : 12,
        },
        storeName: {
            fontSize: isTablet ? 24 : 16,
            fontWeight: "600",
            color: Colors[colorScheme].text,
        },
        storeBranch: {
            marginTop: isTablet ? 4 : 2,
            fontSize: isTablet ? 20 : 13,
            color: Colors[colorScheme].icon,
        },
        sectionDivider: {
            height: 1,
            backgroundColor: Colors[colorScheme].border,
            marginVertical: isTablet ? 14 : 10,
        },
        infoGrid: {
            rowGap: isTablet ? 10 : 6,
        },
        infoGridRow: {
            flexDirection: "row",
            justifyContent: "space-between",
        },
        infoLabel: {
            fontSize: isTablet ? 20 : 13,
            color: Colors[colorScheme].icon,
        },
        infoValue: {
            fontSize: isTablet ? 20 : 13,
            color: Colors[colorScheme].text,
            fontWeight: "500",
        },
        copyBannerWrapper: {
            alignItems: "center",
            marginVertical: isTablet ? 12 : 6,
        },
        copyBannerText: {
            fontSize: isTablet ? 20 : 13,
            fontWeight: "600",
            color: Colors[colorScheme].text,
        },
        itemsSection: {
            marginTop: isTablet ? 8 : 4,
            rowGap: isTablet ? 10 : 6,
        },
        itemRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        itemLeft: {
            flexShrink: 1,
            paddingRight: isTablet ? 16 : 12,
        },
        itemName: {
            fontSize: isTablet ? 20 : 13,
            color: Colors[colorScheme].text,
            marginBottom: isTablet ? 4 : 2,
        },
        itemSubText: {
            fontSize: isTablet ? 18 : 12,
            color: Colors[colorScheme].icon,
        },
        itemAmount: {
            fontSize: isTablet ? 20 : 13,
            color: Colors[colorScheme].text,
            fontWeight: "500",
        },
        summarySection: {
            marginTop: isTablet ? 14 : 10,
            rowGap: isTablet ? 8 : 4,
        },
        summaryRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        summaryLabel: {
            fontSize: isTablet ? 20 : 13,
            color: Colors[colorScheme].icon,
        },
        summaryLabelStrong: {
            fontWeight: "600",
            color: Colors[colorScheme].text,
        },
        summaryValue: {
            fontSize: isTablet ? 20 : 13,
            color: Colors[colorScheme].text,
        },
        summaryValueStrong: {
            fontWeight: "600",
        },
        footerWrapper: {
            marginTop: isTablet ? 24 : 16,
            alignItems: "center",
            rowGap: isTablet ? 4 : 2,
        },
        footerText: {
            fontSize: isTablet ? 16 : 11,
            color: Colors[colorScheme].icon,
        },
        fabButton: {
            position: "absolute",
            right: isTablet ? 32 : 24,
            bottom: isTablet ? 32 : 24,
            width: isTablet ? 56 : 48,
            height: isTablet ? 56 : 48,
            borderRadius: isTablet ? 28 : 24,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 6,
        },
    });
