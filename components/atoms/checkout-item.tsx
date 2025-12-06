"use client";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

type CheckoutItemProps = {
  index: number;
  name: string;
  quantity: number;
  unitPrice: number;
  onRemove?: () => void;
  productImageUrl?: string;
  hideDeleteButton?: boolean;
  hideIndex?: boolean;
  withSummary?: boolean;
  isTablet?: boolean;
};

const CheckoutItem: React.FC<CheckoutItemProps> = ({
  index,
  name,
  quantity,
  unitPrice,
  onRemove,
  withSummary, 
  productImageUrl,
  hideDeleteButton,
  hideIndex,
  isTablet: isTabletProp,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = isTabletProp ?? Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  const initials = React.useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return "";
    const parts = trimmed.split(" ");
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [name]);

  const subtotal = quantity * unitPrice;

  const formatCurrency = (value: number) => {
    if (!value) return "0";
    const intPart = Math.floor(value).toString();
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  return (
    <View style={styles.container}>

      <View style={styles.avatarWrapper}>
        {productImageUrl ? (
          <Image
            source={{ uri: productImageUrl }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoWrapper}>
        <Text style={styles.nameText}>{name}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>
            Rp {formatCurrency(unitPrice)} x {quantity}
          </Text>
          {withSummary && <Text style={styles.totalText}>Rp {formatCurrency(subtotal)}</Text>}
        </View>
      </View>

      {!hideDeleteButton && onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="trash-outline"
            size={isTablet ? 26 : 20}
            color="#EF4444"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 20 : 16,
      columnGap: isTablet ? 16 : 12,
    },
    indexText: {
      width: isTablet ? 28 : 18,
      fontSize: isTablet ? 20 : 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    avatarWrapper: {
      marginRight: isTablet ? 12 : 8,
    },
    avatarCircle: {
      width: isTablet ? 52 : 40,
      height: isTablet ? 52 : 40,
      borderRadius: isTablet ? 26 : 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].border,
    },
    avatarImage: {
      width: isTablet ? 52 : 40,
      height: isTablet ? 52 : 40,
      borderRadius: isTablet ? 26 : 20,
      resizeMode: "cover",
    },
    avatarText: {
      fontSize: isTablet ? 20 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].icon,
      opacity: 0.7,
    },
    infoWrapper: {
      flex: 1,
    },
    nameText: {
      fontSize: isTablet ? 20 : 15,
      fontWeight: "500",
      color: Colors[colorScheme].text,
      marginBottom: isTablet ? 4 : 2,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    detailText: {
      fontSize: isTablet ? 18 : 13,
      color: Colors[colorScheme].icon,
    },
    totalText: {
      fontSize: isTablet ? 18 : 13,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    deleteButton: {
      paddingHorizontal: isTablet ? 8 : 4,
      paddingVertical: isTablet ? 8 : 4,
    },
  });

export default CheckoutItem;

