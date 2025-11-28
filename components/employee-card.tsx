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
  onPress?: () => void;
};

export default function EmployeeCard({
  initials,
  name,
  phone,
  role,
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
        {phone && <ThemedText style={styles.subText}>{phone}</ThemedText>}
        {role && <ThemedText style={styles.subText}>{role}</ThemedText>}
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
      borderRadius: 24, // Circular avatar
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: Colors[colorScheme].background,
      fontWeight: "700",
      fontSize: 18,
    },
    nameText: {
      color: Colors[colorScheme].text,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "700",
    },
    subText: {
      color: Colors[colorScheme].icon,
      fontSize: 14,
    },
  });
