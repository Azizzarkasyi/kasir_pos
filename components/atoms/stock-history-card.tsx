import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDate } from "@/utils/date-utils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";

export type StockHistoryCardProps = {
  productName: string;
  variantName: string;
  actionType: "add_stock" | "remove_stock" | "adjust_stock" | "sale";
  amount: number;
  prevStock: number;
  currStock: number;
  note?: string;
  createdAt: string;
  onPress?: () => void;
};

const StockHistoryCard: React.FC<StockHistoryCardProps> = ({
  productName,
  variantName,
  actionType,
  amount,
  prevStock,
  currStock,
  note,
  createdAt,
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = useStockHistoryCardStyles(colorScheme);

  const getActionTypeConfig = () => {
    switch (actionType) {
      case "add_stock":
        return {
          icon: "add-circle-outline",
          color: "#10b981",
          label: "Masuk",
        };
      case "remove_stock":
        return {
          icon: "remove-circle-outline",
          color: "#ef4444",
          label: "Keluar",
        };
      case "adjust_stock":
        return {
          icon: "sync-outline",
          color: "#f59e0b",
          label: "Penyesuaian",
        };
      case "sale":
        return {
          icon: "cart-outline",
          color: "#8b5cf6",
          label: "Terjual",
        };
      default:
        return {
          icon: "help-circle-outline",
          color: Colors[colorScheme].icon,
          label: "Tidak Diketahui",
        };
    }
  };

  const actionConfig = getActionTypeConfig();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.mainContent}>
        <View style={styles.leftSection}>
          <View style={styles.productInfo}>
            <ThemedText style={styles.productName}>{productName}</ThemedText>
            <ThemedText style={styles.variantName}>{variantName}</ThemedText>
          </View>
          <View style={styles.stockChange}>
            <ThemedText style={styles.stockText}>{prevStock}</ThemedText>
            <Ionicons
              name="arrow-forward-outline"
              size={14}
              color={Colors[colorScheme].icon}
              style={styles.arrowIcon}
            />
            <ThemedText style={styles.stockText}>{currStock}</ThemedText>
            <View style={[styles.amountBadge, { backgroundColor: actionConfig.color + "20" }]}>
              <Ionicons name={actionConfig.icon as any} size={12} color={actionConfig.color} />
              <ThemedText style={[styles.amountText, { color: actionConfig.color }]}>
                {amount >= 0 ? "+" : ""}{amount}
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={[styles.actionBadge, { backgroundColor: actionConfig.color }]}>
            <Ionicons name={actionConfig.icon as any} size={14} color="white" />
            <ThemedText style={styles.actionLabel}>{actionConfig.label}</ThemedText>
          </View>
          <ThemedText style={styles.date}>{formatDate(createdAt)}</ThemedText>
        </View>
      </View>
      {note && (
        <View style={styles.noteContainer}>
          <View style={styles.noteIconContainer}>
            <Ionicons name="document-text-outline" size={12} color={Colors[colorScheme].icon} />
          </View>
          <ThemedText style={styles.note}>{note}</ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const useStockHistoryCardStyles = (colorScheme: "light" | "dark") => {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;

  return React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          backgroundColor: Colors[colorScheme].background,
          borderRadius: 12,
          padding: isTablet ? 18 : 14,
          marginBottom: isTablet ? 12 : 10,
          borderWidth: 1,
          borderColor: Colors[colorScheme].border,
          shadowColor: Colors[colorScheme].text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        },
        mainContent: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        },
        leftSection: {
          flex: 1,
          marginRight: 12,
        },
        rightSection: {
          alignItems: "flex-end",
          gap: isTablet ? 6 : 4,
        },
        productInfo: {
          marginBottom: isTablet ? 8 : 6,
        },
        productName: {
          fontSize: isTablet ? 17 : 15,
          fontWeight: "600",
          color: Colors[colorScheme].text,
          marginBottom: 2,
        },
        variantName: {
          fontSize: isTablet ? 13 : 12,
          color: Colors[colorScheme].icon,
        },
        stockChange: {
          flexDirection: "row",
          alignItems: "center",
          gap: isTablet ? 8 : 6,
        },
        stockText: {
          fontSize: isTablet ? 18 : 16,
          fontWeight: "600",
          color: Colors[colorScheme].text,
        },
        arrowIcon: {
          opacity: 0.5,
        },
        amountBadge: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: isTablet ? 8 : 6,
          paddingVertical: isTablet ? 4 : 3,
          borderRadius: 12,
          gap: 3,
          marginLeft: "auto",
        },
        amountText: {
          fontSize: isTablet ? 12 : 11,
          fontWeight: "600",
        },
        actionBadge: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: isTablet ? 11 : 9,
          paddingVertical: isTablet ? 6 : 5,
          borderRadius: 16,
          gap: 3,
        },
        actionLabel: {
          fontSize: isTablet ? 12 : 11,
          fontWeight: "600",
          color: "white",
        },
        date: {
          fontSize: isTablet ? 11 : 10,
          color: Colors[colorScheme].icon,
        },
        noteContainer: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 6,
          marginTop: isTablet ? 10 : 8,
          padding: isTablet ? 8 : 6,
          backgroundColor: colorScheme === "dark" ? "#1f2122" : Colors[colorScheme].secondary,
          borderRadius: 6,
        },
        noteIconContainer: {
          marginTop: isTablet ? 2 : 1,
        },
        note: {
          flex: 1,
          fontSize: isTablet ? 12 : 11,
          color: Colors[colorScheme].text,
          lineHeight: isTablet ? 16 : 14,
        },
      }),
    [colorScheme, width, height, isTablet]
  );
};

export default StockHistoryCard;
