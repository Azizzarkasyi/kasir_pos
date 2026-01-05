import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ThemedText } from "../themed-text";

type SettingListItemProps = {
  title: string;
  leftIconName: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  showTopBorder?: boolean;
  showBottomBorder?: boolean;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
};

const SettingListItem: React.FC<SettingListItemProps> = ({
  title,
  leftIconName,
  onPress,
  showTopBorder = true,
  showBottomBorder = true,
  disabled = false,
  rightComponent,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);
  const top =
    typeof StyleSheet.hairlineWidth === "number" ? StyleSheet.hairlineWidth : 1;
  const bottom = 1;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          borderTopWidth: showTopBorder ? top : 0,
          borderBottomWidth: showBottomBorder ? bottom : 0,
        },
        disabled && styles.disabledRow,
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
    >
      <View style={styles.titleRow}>
        <Ionicons
          name={leftIconName}
          size={isTablet ? 32 : 24}
          color={disabled ? Colors[colorScheme].icon : Colors[colorScheme].primary}
        />
        <ThemedText style={[styles.rowTitle, disabled && styles.disabledTitle]}>
          {title}
        </ThemedText>
      </View>
      {rightComponent && <View>{rightComponent}</View>}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: isTablet ? 20 : 14,
      minHeight: isTablet ? 80 : 60,
      borderBottomWidth: 2,
      borderBottomColor: Colors[colorScheme].border2,
      paddingHorizontal: isTablet ? 32 : 24,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 20 : 12,
    },
    rowTitle: {
      fontSize: isTablet ? 20 : 14,
      fontWeight: "500",
      color: Colors[colorScheme].icon,
    },
    disabledRow: {
      opacity: 0.5,
    },
    disabledTitle: {
      color: Colors[colorScheme].icon,
    },
  });

export default SettingListItem;