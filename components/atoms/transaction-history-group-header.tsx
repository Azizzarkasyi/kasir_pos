import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

interface TransactionHistoryGroupHeaderProps {
  dateLabel: string;
  totalAmount: number;
  isTablet?: boolean;
}

const TransactionHistoryGroupHeader: React.FC<TransactionHistoryGroupHeaderProps> = ({
  dateLabel,
  totalAmount,
  isTablet: isTabletProp,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = isTabletProp ?? Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

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

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 20 : 12,
      backgroundColor: Colors[colorScheme].tabBackground,
      marginBottom: isTablet ? 12 : 8,
    },
    dateText: {
      fontSize: isTablet ? 20 : 13,
      fontWeight: "500",
    },
    amountText: {
      fontSize: isTablet ? 20 : 13,
      fontWeight: "600",
    },
  });

export default TransactionHistoryGroupHeader;
