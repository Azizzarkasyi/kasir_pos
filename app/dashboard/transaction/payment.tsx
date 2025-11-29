"use client";

import Header from "@/components/header";
import PaymentCalculator from "@/components/mollecules/payment-calculator";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PaymentPage() {
    const colorScheme = useColorScheme() ?? "light";
    const styles = createStyles(colorScheme);
    const router = useRouter();

    const [amount, setAmount] = React.useState<string>("0");
    const [note, setNote] = React.useState<string>("");

    const formatCurrency = (value: string | number) => {
        if (!value) return "0";
        const stringValue = String(value);
        const [intPart] = stringValue.split(".");
        const cleaned = intPart.replace(/\D/g, "");
        if (!cleaned) return "0";
        const withDots = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return withDots;
    };

    const totalAmount = amount === "0" ? 0 : Number(amount.replace(/\D/g, ""));

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
                title={undefined}
                center={
                    <Text style={styles.totalText}>
                        Rp {formatCurrency(totalAmount)}
                    </Text>
                }
            />

            {/* Content */}
            <View style={styles.mainWrapper}>
                <View style={styles.contentWrapper}>
                    <View style={styles.amountWrapper}>
                        <Text style={styles.amountValue}>Rp {formatCurrency(totalAmount)}</Text>
                    </View>

                    {/* Input catatan (seperti Receipt Desc.) */}
                    <View style={styles.noteWrapper}>
                        <TextInput
                            value={note}
                            onChangeText={setNote}
                            placeholder="Catatan struk"
                            placeholderTextColor={Colors[colorScheme].icon}
                            style={styles.noteInput}
                        />
                    </View>

                    {/* Badge untuk Diskon, Pajak, dan Metode (Tunai) */}
                    <View style={styles.methodRow}>
                        <View style={styles.methodBadge}>
                            <Text style={styles.methodBadgeText}>Diskon : 0%</Text>
                        </View>
                        <View style={styles.methodBadge}>
                            <Text style={styles.methodBadgeText}>Pajak : 0%</Text>
                        </View>
                        <View style={styles.methodBadge}>
                            <Text style={styles.methodBadgeText}>Metode : Tunai</Text>
                        </View>
                    </View>

                    {/* Calculator */}
                    <PaymentCalculator value={amount} onChangeValue={setAmount} />
                </View>

                {/* Bottom continue button */}
                <View style={styles.bottomWrapper}>
                    <TouchableOpacity
                        style={[styles.continueButton, { backgroundColor: Colors[colorScheme].primary }]}
                        onPress={() => {
                            router.push("/dashboard/transaction/settlement" as never);
                        }}
                    >
                        <Text
                            style={[styles.continueButtonText, { color: Colors[colorScheme].text }]}
                        >
                            Lanjutkan Pembayaran
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
            paddingHorizontal: 16,
            paddingTop: 16,
            flexDirection: "column",
        },
        amountWrapper: {
            alignItems: "center",
            flex: 1,
            justifyContent: "center",
            flexDirection: "column",
        },
        amountLabel: {
            fontSize: 16,
            color: Colors[colorScheme].icon,
            marginBottom: 4,
        },
        amountValue: {
            fontSize: 32,
            fontWeight: "700",
            color: Colors[colorScheme].text,
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
            justifyContent: "center",
            marginBottom: 16,
        },
        methodBadge: {
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: Colors[colorScheme].secondary,
            borderWidth: 1,
            borderColor: Colors[colorScheme].border,
        },
        methodBadgeText: {
            fontSize: 13,
            color: Colors[colorScheme].text,
            fontWeight: "500",
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
