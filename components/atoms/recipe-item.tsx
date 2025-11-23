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
        <ThemedText style={{ fontWeight: "700" }}>{name}</ThemedText>
        {!!subtitle && (
          <ThemedText style={{ color: Colors[colorScheme].icon }}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {!!rightText && (
        <ThemedText style={{ color: Colors[colorScheme].icon }}>
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
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      backgroundColor: Colors[colorScheme].background,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].icon,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      color: Colors[colorScheme].background,
      fontWeight: "700",
    },
  });

export default RecipeItem;
