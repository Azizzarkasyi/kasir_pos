
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type StockProductItemProps = {
  name: string;
  variant?: string;
  quantity: number | string;
  onPress?: () => void;
  isTablet?: boolean;
};

const StockProductItem: React.FC<StockProductItemProps> = ({
  name,
  variant,
  quantity,
  onPress,
  isTablet = false,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, isTablet);

  const initials = (name || "-")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftBox}>
        <ThemedText style={styles.initials}>{initials}</ThemedText>
      </View>

      <View style={styles.middleColumn}>
        <ThemedText type="defaultSemiBold" style={styles.nameText} numberOfLines={1}>
          {name}
        </ThemedText>
        {!!variant && (
          <ThemedText
            style={styles.variantText}
            numberOfLines={1}
          >
            {variant}
          </ThemedText>
        )}
      </View>

      <View style={styles.qtyBox}>
        <ThemedText style={styles.qtyText}>{quantity}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: isTablet ? 32 : 16,
      paddingVertical: isTablet ? 18 : 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    leftBox: {
      width: isTablet ? 64 : 40,
      height: isTablet ? 64 : 40,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: isTablet ? 18 : 12,
    },
    initials: {
      fontWeight: "700",
      fontSize: isTablet ? 24 : 14,
      color: Colors[colorScheme].icon,
    },
    middleColumn: {
      flex: 1,
      justifyContent: "center",
    },
    nameText: {
      fontSize: isTablet ? 20 : 14,
    },
    variantText: {
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].icon,
      marginTop: isTablet ? 4 : 2,
    },
    qtyBox: {
      minWidth: isTablet ? 80 : 40,
      paddingHorizontal: isTablet ? 20 : 16,
      paddingVertical: isTablet ? 12 : 8,
      borderRadius: isTablet ? 10 : 6,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyText: {
      fontWeight: "600",
      fontSize: isTablet ? 20 : 12,
      color: Colors[colorScheme].text,
    },
  });

export default StockProductItem;

