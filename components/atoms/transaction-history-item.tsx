import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

interface TransactionHistoryItemProps {
  code: string;
  paymentMethod: string;
  amount: number;
  time: string;
  onPress?: () => void;
  isTablet?: boolean;
}

const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = ({
  code,
  paymentMethod,
  amount,
  time,
  onPress,
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

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    // router.push("/dashboard/transaction/show" as never);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          <MaterialIcons
            name="receipt-long"
            size={isTablet ? 26 : 20}
            color={Colors[colorScheme].icon}
          />
        </View>
        <View>
          <Text style={[styles.codeText, { color: Colors[colorScheme].text }]}>
            {code}
          </Text>
          <Text
            style={[styles.subtitleText, { color: Colors[colorScheme].icon }]}
          >
            {paymentMethod}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amountText, { color: Colors[colorScheme].text }]}>
          Rp{formatCurrency(amount)}
        </Text>
        <Text style={[styles.timeText, { color: Colors[colorScheme].icon }]}>
          {time}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={isTablet ? 24 : 18}
        color={Colors[colorScheme].icon}
      />
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 20 : 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].tabBackground,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].secondary,
      columnGap: isTablet ? 16 : 12,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: isTablet ? 16 : 12,
      flex: 1,
    },
    iconWrapper: {
      width: isTablet ? 44 : 32,
      height: isTablet ? 44 : 32,
      borderRadius: isTablet ? 12 : 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].background,
    },
    codeText: {
      fontSize: isTablet ? 20 : 14,
      fontWeight: "600",
      marginBottom: isTablet ? 4 : 2,
    },
    subtitleText: {
      fontSize: isTablet ? 18 : 12,
    },
    right: {
      alignItems: "flex-end",
      marginRight: isTablet ? 8 : 4,
    },
    amountText: {
      fontSize: isTablet ? 20 : 14,
      fontWeight: "600",
      marginBottom: isTablet ? 4 : 2,
    },
    timeText: {
      fontSize: isTablet ? 18 : 12,
    },
  });

export default TransactionHistoryItem;
