import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TransactionHistoryGroupHeaderProps {
  dateLabel: string;
  totalAmount: number;
}

const TransactionHistoryGroupHeader: React.FC<TransactionHistoryGroupHeaderProps> = ({
  dateLabel,
  totalAmount,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  const formatCurrency = (value: number) => {
    if (!value) return "0";
    const intPart = Math.floor(value).toString();
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.dateText, { color: Colors[colorScheme].text }]}>
        {dateLabel}
      </Text>
      <Text style={[styles.amountText, { color: Colors[colorScheme].primary }]}>
        Rp{formatCurrency(totalAmount)}
      </Text>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      backgroundColor: Colors[colorScheme].tabBackground,
      marginBottom: 8,
    },
    dateText: {
      fontSize: 13,
      fontWeight: "500",
    },
    amountText: {
      fontSize: 13,
      fontWeight: "600",
    },
  });

export default TransactionHistoryGroupHeader;
