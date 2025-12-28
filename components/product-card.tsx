import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { ThemedText } from "./themed-text";

type Props = {
  initials: string;
  name: string;
  variantCount?: number;
  stockCount?: number;
  photoUrl?: string | null;
  isDisabled?: boolean;
  onPress?: () => void;
};

export default function ProductCard({
  initials,
  name,
  variantCount,
  stockCount,
  photoUrl,
  isDisabled = false,
  onPress,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  return (
    <TouchableOpacity
      style={[styles.card, isDisabled && styles.disabledCard]}
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={isDisabled ? 1 : 0.8}
      disabled={isDisabled}
    >
      <View style={styles.avatar}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
        ) : (
          <ThemedText style={styles.avatarText}>{initials}</ThemedText>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.nameText}>{name}</ThemedText>
        <ThemedText style={styles.variantText}>
          {variantCount} Varian
        </ThemedText>
      </View>
      <View style={styles.rightColumn}>
        {isDisabled ? (
          <View style={styles.disabledBadge}>
            <ThemedText style={styles.disabledBadgeText}>Nonaktif</ThemedText>
          </View>
        ) : (
          <>
            <ThemedText style={styles.stockText}>Stok</ThemedText>
            <ThemedText style={styles.stockCountText}>{stockCount}</ThemedText>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 16 : 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 10 : 8,
      paddingVertical: isTablet ? 16 : 12,
      backgroundColor: Colors[colorScheme].background,
    },
    disabledCard: {
      opacity: 0.5,
    },
    avatar: {
      width: isTablet ? 60 : 40,
      height: isTablet ? 60 : 40,
      borderRadius: isTablet ? 10 : 8,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    avatarText: {
      color: Colors[colorScheme].background,
      fontWeight: "700",
      fontSize: isTablet ? 20 : 14,
    },
    nameText: {
      color: Colors[colorScheme].text,
      fontSize: isTablet ? 20 : 14,
      lineHeight: isTablet ? 26 : 20,
      fontWeight: "700",
    },
    variantText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 12,
      marginTop: isTablet ? 4 : 0,
    },
    rightColumn: {
      alignItems: "flex-end",
    },
    stockText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 12,
      fontWeight: "700",
    },
    stockCountText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 12,
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
