"use client";

import CheckoutItem from "@/components/atoms/checkout-item";
import AddAdditionalCostModal from "@/components/drawers/add-addditional-cost-modal";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SummaryItem = {
  id: string;
  index: number;
  name: string;
  quantity: number;
  unitPrice: number;
};

export default function TransactionSummaryPage() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

  const [items, setItems] = React.useState<SummaryItem[]>([
    {
      id: "1",
      index: 1,
      name: "Burger",
      quantity: 2,
      unitPrice: 1000,
    },
    {
      id: "2",
      index: 2,
      name: "Roti",
      quantity: 1,
      unitPrice: 0,
    },
    {
      id: "3",
      index: 3,
      name: "Admin",
      quantity: 1,
      unitPrice: 2000,
    },
  ]);

  const [isCostModalVisible, setIsCostModalVisible] = React.useState(false);

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleAddFee = (payload: { name: string; price: number }) => {
    setItems((prev) => {
      const nextIndex = prev.length + 1;
      const newItem: SummaryItem = {
        id: `${Date.now()}`,
        index: nextIndex,
        name: payload.name,
        quantity: 1,
        unitPrice: payload.price,
      };
      return [...prev, newItem];
    });
    setIsCostModalVisible(false);
  };

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
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={Colors[colorScheme].text}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.totalText}>Rp {formatCurrency(totalAmount)}</Text>
          </View>

          <TouchableOpacity
            style={styles.feeButton}
            onPress={() => setIsCostModalVisible(true)}
          >
            <Ionicons
              name="add"
              size={16}
              color={Colors[colorScheme].secondary}
            />
            <Text style={styles.feeButtonText}>Fee</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.listWrapper}
        contentContainerStyle={styles.listContent}
      >
        {items.map((item) => (
          <View
            key={item.id}
            style={styles.itemContainer}
          >
            <CheckoutItem
              index={item.index}
              name={item.name}
              quantity={item.quantity}
              unitPrice={item.unitPrice}
              onRemove={() => { }}
            />
          </View>
        ))}
      </ScrollView>

      <AddAdditionalCostModal
        visible={isCostModalVisible}
        onClose={() => setIsCostModalVisible(false)}
        onConfirm={({ name, price }) => handleAddFee({ name, price })}
      />

      <View style={styles.bottomWrapper}>
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: Colors[colorScheme].primary }]}
          onPress={() => router.push("/dashboard/transaction/payment" as never)}
        >
          <Text
            style={[styles.payButtonText, { color: Colors[colorScheme].secondary }]}
          >
            Lanjutkan Pembayaran
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
    feeButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].primary,
      columnGap: 4,
    },
    feeButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].secondary,
    },
    listWrapper: {
      flex: 1,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      rowGap: 12,
    },
    itemContainer: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    bottomWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    payButton: {
      width: "100%",
      height: 54,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    payButtonText: {
      fontSize: 18,
      fontWeight: "600",
    },
  });
