"use client";

import CheckoutItem from "@/components/atoms/checkout-item";
import AddAdditionalCostModal from "@/components/drawers/add-addditional-cost-modal";
import Header from "@/components/header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
      <Header title="Ringkasan Transaksi" showHelp={false}/>

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
      paddingTop: 12,
      flex: 1,
    },
    listContent: {
      paddingVertical: 8, 
    },
    itemContainer: {
      borderBottomWidth: 1,
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
