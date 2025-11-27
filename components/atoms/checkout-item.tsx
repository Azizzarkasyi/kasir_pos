"use client";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type CheckoutItemProps = {
  index: number;
  name: string;
  quantity: number;
  unitPrice: number;
  onRemove?: () => void;
  productImageUrl?: string;
  hideDeleteButton?: boolean;
  hideIndex?: boolean;
};

const CheckoutItem: React.FC<CheckoutItemProps> = ({
  index,
  name,
  quantity,
  unitPrice,
  onRemove,
  productImageUrl,
  hideDeleteButton,
  hideIndex,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

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
          <Text style={styles.totalText}>Rp {formatCurrency(subtotal)}</Text>
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
            size={20}
            color="#EF4444"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      columnGap: 12,
    },
    indexText: {
      width: 18,
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    avatarWrapper: {
      marginRight: 8,
    },
    avatarCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].border,
    },
    avatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      resizeMode: "cover",
    },
    avatarText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].icon,
      opacity: 0.7,
    },
    infoWrapper: {
      flex: 1,
    },
    nameText: {
      fontSize: 15,
      fontWeight: "500",
      color: Colors[colorScheme].text,
      marginBottom: 2,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    detailText: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
    },
    totalText: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    deleteButton: {
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
  });

export default CheckoutItem;

