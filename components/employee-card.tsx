import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./themed-text";

type Props = {
  initials: string;
  name: string;
  phone?: string;
  role?: string;
  isTablet?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
};

export default function EmployeeCard({
  initials,
  name,
  phone,
  role,
  isTablet = false,
  isDisabled = false,
  onPress,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, isTablet);

  return (
    <TouchableOpacity
      style={[styles.card, isDisabled && styles.disabledCard]}
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={isDisabled ? 1 : 0.8}
      disabled={isDisabled}
    >
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>{initials}</ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.nameText}>{name}</ThemedText>
        {phone && <ThemedText style={styles.subText}>{phone}</ThemedText>}
      </View>
      {isDisabled ? (
        <View style={styles.disabledBadge}>
          <ThemedText style={styles.disabledBadgeText}>Nonaktif</ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.subText}>{role}</ThemedText>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 40 : 20,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 12 : 8,
      paddingVertical: isTablet ? 20 : 14,
      backgroundColor: Colors[colorScheme].background,
    },
    disabledCard: {
      opacity: 0.5,
    },
    avatar: {
      width: isTablet ? 64 : 42,
      height: isTablet ? 64 : 42,
      borderRadius: isTablet ? 32 : 24, // Circular avatar
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: Colors[colorScheme].background,
      fontWeight: "700",
      fontSize: isTablet ? 22 : 16,
    },
    nameText: {
      color: Colors[colorScheme].text,
      fontSize: isTablet ? 20 : 14,
      lineHeight: isTablet ? 28 : 20,
      fontWeight: "700",
    },
    subText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
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
