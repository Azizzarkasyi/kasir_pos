import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TransactionHistoryItemProps {
  code: string;
  paymentMethod: string;
  amount: number;
  time: string;
  onPress?: () => void;
}

const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = ({
  code,
  paymentMethod,
  amount,
  time,
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

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
    router.push("/dashboard/transaction/show" as never);
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
            size={20}
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
        size={18}
        color={Colors[colorScheme].icon}
      />
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].tabBackground,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].secondary,
      columnGap: 12,
    },
    left: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: 12,
      flex: 1,
    },
    iconWrapper: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].background,
    },
    codeText: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 2,
    },
    subtitleText: {
      fontSize: 12,
    },
    right: {
      alignItems: "flex-end",
      marginRight: 4,
    },
    amountText: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 2,
    },
    timeText: {
      fontSize: 12,
    },
  });

export default TransactionHistoryItem;
