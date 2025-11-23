import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";
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
};

const MenuRow: React.FC<MenuRowProps> = ({
  title,
  subtitle,
  variant = "link",
  onPress,
  rightText,
  value = false,
  onValueChange,
  badgeText,
  showTopBorder = true,
  showBottomBorder = true,
  leftIconName,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
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
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={{flex: 1}}>
          <View style={styles.titleRow}>
            {leftIconName ? (
              <Ionicons
                name={leftIconName}
                size={20}
                color={Colors[colorScheme].primary}
              />
            ) : null}
            <ThemedText style={styles.rowTitle}>{title}</ThemedText>
            {badgeText ? (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
              </View>
            ) : null}
          </View>
          {subtitle ? (
            <ThemedText style={styles.rowSubtitle}>{subtitle}</ThemedText>
          ) : null}
        </View>

        <View style={styles.rightRow}>
          {rightText ? (
            <ThemedText style={styles.rightText}>{rightText}</ThemedText>
          ) : null}
          <Ionicons
            name="chevron-forward-outline"
            size={18}
            color={Colors[colorScheme].icon}
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={{ flex: 1 }}>
        <View style={styles.titleRow}>
          {leftIconName ? (
            <Ionicons
              name={leftIconName}
              size={20}
              color={Colors[colorScheme].primary}
            />
          ) : null}
          <ThemedText style={styles.rowTitle}>{title}</ThemedText>
          {badgeText ? (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <ThemedText style={styles.rowSubtitle}>{subtitle}</ThemedText>
        ) : null}
      </View>

      {variant === "toggle" ? (
        <View style={styles.rightRow}>
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{
              false: Colors[colorScheme].icon,
              true: Colors[colorScheme].primary,
            }}
            thumbColor={Colors[colorScheme].background}
          />
        </View>
      ) : (
        <View style={styles.rightRow}>
          {rightText ? (
            <ThemedText style={styles.rightText}>{rightText}</ThemedText>
          ) : null}
          <Ionicons
            name="chevron-forward-outline"
            size={18}
            color={Colors[colorScheme].icon}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      minHeight: 64,
      borderTopColor: Colors[colorScheme].icon,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors[colorScheme].icon,
      gap: 50,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    rowTitle: {
      fontWeight: "700",
    },
    rowSubtitle: {
      marginTop: 2,
      color: Colors[colorScheme].icon,
      fontSize: 12,
    },
    badge: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].primary,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeText: {
      fontSize: 10,
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
    },
  });

export default MenuRow;
