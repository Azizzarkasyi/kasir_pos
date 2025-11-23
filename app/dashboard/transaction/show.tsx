"use client";

import CheckoutItem from "@/components/atoms/checkout-item";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type DetailItem = {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    productImageUrl?: string;
};

export default function TransactionDetailPage() {
    const colorScheme = useColorScheme() ?? "light";
    const styles = createStyles(colorScheme);
    const [activeMenu, setActiveMenu] = React.useState("history");
    const router = useRouter();

    const items: DetailItem[] = [
        {
            id: "1",
            name: "Aqua gelas - sedang",
            quantity: 4,
            unitPrice: 5000,
        },
        {
            id: "2",
            name: "Aqua gelas - sedang",
            quantity: 4,
            unitPrice: 5000,
        },
        {
            id: "3",
            name: "Aqua gelas - sedang",
            quantity: 4,
            unitPrice: 5000,
        },
    ];

    const formatCurrency = (value: number) => {
        if (!value) return "0";
        const intPart = Math.floor(value).toString();
        const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return withDots;
    };

    const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
    );

    const totalProduk = items.reduce((sum, item) => sum + item.quantity, 0);

    const dibayar = subtotal;
    const kembalian = 0;

    const [isDetailOpen, setIsDetailOpen] = React.useState(true);



    return (
        <View
            style={[
                styles.container,
                { backgroundColor: Colors[colorScheme].background },
            ]}
        >
            <Header
                showBack={true}
                showHelp={false}
                title="#3240736L"
            />

            <ScrollView
                style={styles.contentWrapper}
                contentContainerStyle={styles.contentInner}
            >
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRowPrimary}>
                        <Text style={styles.sectionTitle}>Detail Transaksi</Text>
                        <Text style={styles.sectionCode}>#3240736L</Text>
                    </View>

                    <View style={styles.divider} />


                    <View style={styles.infoWrapper}>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tipe Pembayaran</Text>
                            <Text style={styles.infoValue}>Tunai</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Nama Pegawai</Text>
                            <Text style={styles.infoValue}>Basofi Bswt</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tanggal Transaksi</Text>
                            <Text style={styles.infoValue}>20 Nov 2025, 07:24</Text>
                        </View>
                        <View style={styles.buttonStack}>
                            <ThemedButton
                                title="Batalkan"
                                size="medium"
                                variant="secondary"
                            />
                            <ThemedButton
                                title="Kirim Struk"
                                size="medium"
                                variant="secondary"
                                onPress={() =>
                                    router.push(
                                        "/dashboard/transaction/share-struck" as never
                                    )
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
                                ? { borderBottomWidth: 1, borderBottomColor: Colors[colorScheme].border }
                                : {},
                        ]}
                        onPress={() => setIsDetailOpen(prev => !prev)}
                    >
                        <Text style={styles.sectionTitle}>Detail Pembelian</Text>
                        <Ionicons
                            name={isDetailOpen ? "chevron-up-outline" : "chevron-down-outline"}
                            size={18}
                            color={Colors[colorScheme].icon}
                        />
                    </TouchableOpacity>

                    {isDetailOpen && (
                        <>
                            <View style={styles.itemsWrapper}>
                                {items.map((item, index) => (
                                    <CheckoutItem
                                        key={item.id}
                                        index={index + 1}
                                        name={item.name}
                                        quantity={item.quantity}
                                        unitPrice={item.unitPrice}
                                        productImageUrl={item.productImageUrl}
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

