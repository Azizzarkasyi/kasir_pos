import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleProp,
    StyleSheet,
    Switch,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
    useWindowDimensions,
} from "react-native";
import { ThemedText } from "./themed-text";

type MenuRowProps = {
  title: string;
  subtitle?: string;
  variant?: "link" | "toggle";
  onPress?: () => void;
  rightText?: string;
  value?: boolean;
  onValueChange?: (val: boolean) => void;
  badgeText?: string;
  showTopBorder?: boolean;
  showBottomBorder?: boolean;
  leftIconName?: React.ComponentProps<typeof Ionicons>["name"];
  style?: StyleProp<TextStyle>;
  rowStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
};

const MenuRow: React.FC<MenuRowProps> = ({
  title,
  subtitle,
  variant = "link",
  onPress,
  rightText,
  value = false,
  rowStyle,
  style,
  onValueChange,
  badgeText,
  showTopBorder = true,
  showBottomBorder = true,
  leftIconName,
  disabled = false,
  rightComponent,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);
  const top =
    typeof StyleSheet.hairlineWidth === "number" ? StyleSheet.hairlineWidth : 1;
  const bottom =
    typeof StyleSheet.hairlineWidth === "number" ? StyleSheet.hairlineWidth : 1;

  if (variant === "link") {
    return (
      <TouchableOpacity
        style={[
          styles.row,
          {
            borderBottomWidth: showBottomBorder ? bottom : 0,
          },
          rowStyle,
          disabled && styles.disabledRow
        ]}
        onPress={onPress}
        activeOpacity={disabled ? 1 : 0.8}
        disabled={disabled}
      >
        <View style={[{flex: 1}]}>
          <View style={styles.titleRow}>
            {leftIconName ? (
              <Ionicons
                name={leftIconName}
                size={isTablet ? 26 : 20}
                color={disabled ? Colors[colorScheme].icon : Colors[colorScheme].primary}
              />
            ) : null}
            <ThemedText style={[styles.rowTitle, style, disabled && styles.disabledTitle]}>{title}</ThemedText>
            {badgeText ? (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <ThemedText style={[styles.rowSubtitle, disabled && styles.disabledSubtitle]}>{subtitle}</ThemedText>
          ) : null}
        </View>

        <View style={styles.rightRow}>
          {rightText ? (
            <ThemedText style={[styles.rightText, disabled && styles.disabledRightText]}>{rightText}</ThemedText>
          ) : null}
          {rightComponent || (
            <Ionicons
              name="chevron-forward-outline"
              size={isTablet ? 24 : 18}
              color={Colors[colorScheme].icon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.row, disabled && styles.disabledRow]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
    >
      <View style={[{ flex: 1 } ]}>
        <View style={styles.titleRow}>
          {leftIconName ? (
            <Ionicons
              name={leftIconName}
              size={isTablet ? 26 : 20}
              color={disabled ? Colors[colorScheme].icon : Colors[colorScheme].primary}
            />
          ) : null}
          <ThemedText style={[styles.rowTitle, disabled && styles.disabledTitle]}>{title}</ThemedText>
          {badgeText ? (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <ThemedText style={[styles.rowSubtitle, disabled && styles.disabledSubtitle]}>{subtitle}</ThemedText>
        ) : null}
      </View>

      {variant === "toggle" ? (
        <View style={styles.rightRow}>
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{
              false: Colors[colorScheme].border,
              true: Colors[colorScheme].primary,
            }}
            thumbColor={Colors[colorScheme].text}
            style={isTablet ? {transform: [{scaleX: 1.3}, {scaleY: 1.3}]} : undefined}
          />
        </View>
      ) : (
        <View style={styles.rightRow}>
          {rightText ? (
            <ThemedText style={[styles.rightText, disabled && styles.disabledRightText]}>{rightText}</ThemedText>
          ) : null}
          {rightComponent || (
            <Ionicons
              name="chevron-forward-outline"
              size={isTablet ? 24 : 18}
              color={Colors[colorScheme].icon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: isTablet ? 16 : 12,
      minHeight: isTablet ? 72 : 64,
      gap: isTablet ? 24 : 50,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    rowTitle: {
      fontWeight: "700",
      // phone: default 14; tablet: lebih besar
      fontSize: isTablet ? 20 : 14,
    },
    rowSubtitle: {
      marginTop: 2,
      color: Colors[colorScheme].icon,
      lineHeight: isTablet ? 24 : 18,
      fontSize: isTablet ? 18 : 12,
    },
    badge: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].primary,
      borderRadius: 10,
      paddingHorizontal: 8,
    },
    badgeText: {
      fontSize: isTablet ? 14 : 10,
      fontWeight: "700",
      color: Colors[colorScheme].primary,
    },
    rightRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      alignSelf: "center",
      gap: 10,
    },
    rightText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
    },
    disabledRow: {
      opacity: 0.5,
    },
    disabledTitle: {
      color: Colors[colorScheme].icon,
    },
    disabledSubtitle: {
      color: Colors[colorScheme].icon,
    },
    disabledRightText: {
      color: Colors[colorScheme].icon,
    },
  });

export default MenuRow;
