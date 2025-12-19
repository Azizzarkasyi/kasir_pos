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
  onPress?: () => void;
};

export default function EmployeeCard({
  initials,
  name,
  phone,
  role,
  isTablet = false,
  onPress,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, isTablet);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>{initials}</ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.nameText}>{name}</ThemedText>
        {phone && <ThemedText style={styles.subText}>{phone}</ThemedText>}
      </View>
      <ThemedText style={styles.subText}>{role}</ThemedText>
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
  });
