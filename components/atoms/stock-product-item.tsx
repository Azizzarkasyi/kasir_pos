
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type StockProductItemProps = {
  name: string;
  variant?: string;
  quantity: number | string;
  unit?: string;
  onPress?: () => void;
  isTablet?: boolean;
  isDisabled?: boolean;
};

const StockProductItem: React.FC<StockProductItemProps> = ({
  name,
  variant,
  quantity,
  unit,
  onPress,
  isTablet = false,
  isDisabled = false,
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
      style={[styles.container, isDisabled && styles.disabledContainer]}
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={isDisabled ? 1 : 0.8}
      disabled={isDisabled}
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

      {isDisabled ? (
        <View style={styles.disabledBadge}>
          <ThemedText style={styles.disabledBadgeText}>Nonaktif</ThemedText>
        </View>
      ) : (
        <View style={styles.qtyBox}>
          <View style={styles.qtyRow}>
            <ThemedText style={styles.qtyText}>{quantity}</ThemedText>
            {unit && (
              <ThemedText style={styles.unitText}> {unit}</ThemedText>
            )}
          </View>
        </View>
      )}
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
    disabledContainer: {
      opacity: 0.5,
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
    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 4 : 2,
    },
    qtyText: {
      fontWeight: "600",
      fontSize: isTablet ? 20 : 12,
      color: Colors[colorScheme].text,
    },
    unitText: {
      fontSize: isTablet ? 14 : 10,
      color: Colors[colorScheme].icon,
      marginTop: 0,
    },
    disabledBadge: {
      backgroundColor: Colors[colorScheme].border,
      paddingHorizontal: isTablet ? 12 : 8,
      paddingVertical: isTablet ? 6 : 4,
      borderRadius: isTablet ? 6 : 4,
    },
    disabledBadgeText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 14 : 10,
      fontWeight: "600",
    },
  });

export default StockProductItem;

