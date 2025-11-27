import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./../themed-text";

type Props = {
  initials: string;
  name: string;
  variantName: string;
  count?: number;
  unitName?: string;
  onPress?: () => void;
};

export default function RecipeIngredientItem({
  initials,
  name,
  variantName,
  count,
  unitName,
  onPress,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>{initials}</ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.nameText}>{name}</ThemedText>
        <ThemedText style={styles.variantText}> Varian : {variantName}</ThemedText>
      </View>
      <View >
        <ThemedText style={styles.stockText}>Jumlah</ThemedText>
        <ThemedText style={styles.stockCountText}>{count} {unitName}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
      borderRadius: 8,
      paddingVertical: 12,
      backgroundColor: Colors[colorScheme].background,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: Colors[colorScheme].background,
      fontWeight: "700",
    },
    nameText: {
      color: Colors[colorScheme].text,
      fontSize: 16,
      lineHeight:20,
      fontWeight: "700",
    },
    variantText: {
      color: Colors[colorScheme].icon,
      fontSize: 14,
    },
    stockText: {
      color: Colors[colorScheme].icon,
      fontSize: 14,
      fontWeight: "700",
    },
    stockCountText: {
      color: Colors[colorScheme].icon,
      fontSize: 14,
    },

  });