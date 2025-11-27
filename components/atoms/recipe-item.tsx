import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";

export type RecipeItemProps = {
  initials: string;
  name: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
};

const RecipeItem: React.FC<RecipeItemProps> = ({
  initials,
  name,
  subtitle,
  rightText,
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>{initials}</ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={styles.name}>{name}</ThemedText>
        {!!subtitle && (
          <ThemedText style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {!!rightText && (
        <ThemedText style={styles.rightText}>
          {rightText}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderBottomColor: Colors[colorScheme].border,
      borderBottomWidth: 1,
      borderRadius: 12,
      paddingVertical: 10,

      marginTop: 12,
      backgroundColor: Colors[colorScheme].secondary,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      fontWeight: "700",
      fontSize: 16,
    },
    subtitle: {
      color: Colors[colorScheme].icon,
      fontSize: 14,
    },
    rightText: {
      color: Colors[colorScheme].icon,
    },
    avatarText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "700",
    },
  });

export default RecipeItem;
