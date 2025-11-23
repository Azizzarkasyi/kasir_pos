
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
};

const StockProductItem: React.FC<StockProductItemProps> = ({
  name,
  variant,
  quantity,
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

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
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
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

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    leftBox: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    initials: {
      fontWeight: "700",
      fontSize: 18,
      color: Colors[colorScheme].icon,
    },
    middleColumn: {
      flex: 1,
      justifyContent: "center",
    },
    variantText: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
    qtyBox: {
      minWidth: 60,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyText: {
      fontWeight: "600",
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
  });

export default StockProductItem;

