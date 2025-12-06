import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
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
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

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

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 16 : 12,
      borderBottomColor: Colors[colorScheme].border,
      borderBottomWidth: 1,
      borderRadius: isTablet ? 14 : 12,
      paddingVertical: isTablet ? 14 : 10,
      marginTop: isTablet ? 16 : 12,
      backgroundColor: Colors[colorScheme].secondary,
    },
    avatar: {
      width: isTablet ? 60 : 48,
      height: isTablet ? 60 : 48,
      borderRadius: isTablet ? 14 : 12,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    name: {
      fontWeight: "700",
      fontSize: isTablet ? 20 : 16,
    },
    subtitle: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
      marginTop: isTablet ? 4 : 0,
    },
    rightText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
    },
    avatarText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "700",
      fontSize: isTablet ? 20 : 16,
    },
  });

export default RecipeItem;
