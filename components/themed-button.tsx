import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";

interface ThemedButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "primary" | "secondary" | "danger" | "cancel";
  size?: "base" | "sm" | "medium";
}

export function ThemedButton({
  title,
  variant = "primary",
  size = "base",
  style,
  ...rest
}: ThemedButtonProps) {
  const colorScheme = useColorScheme() ?? "light";

  const disabled = Boolean((rest as any).disabled);
  let backgroundColor: string;
  let textColor: string;
  let borderColor: string;

  if (disabled) {
    backgroundColor = Colors[colorScheme].border;
    textColor = Colors[colorScheme].icon;
    borderColor = Colors[colorScheme].border;
  } else {
    switch (variant) {
      case "secondary": {
        backgroundColor = "transparent";
        textColor = Colors[colorScheme].primary;
        borderColor = Colors[colorScheme].primary;
        break;
      }
      case "danger": {
        backgroundColor = "#ff3b30";
        textColor = Colors[colorScheme].secondary;
        borderColor = "#ff3b30";
        break;
      }
      case "cancel": {
        backgroundColor = Colors[colorScheme].background;
        textColor = Colors[colorScheme].icon;
        borderColor = Colors[colorScheme].border ?? Colors[colorScheme].icon;
        break;
      }
      case "primary":
      default: {
        backgroundColor = Colors[colorScheme].primary;
        textColor = "#fff";
        borderColor = Colors[colorScheme].primary;
        break;
      }
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.buttonBase,
        size === "sm" && styles.buttonSm,
        size === "medium" && styles.buttonMd,
        { backgroundColor, borderColor },
        variant === "secondary" && styles.secondaryButton,
        style,
      ]}
      {...rest}
    >
      <Text
        style={[
          styles.textBase,
          size === "sm" && styles.textSm,
          size === "medium" && styles.textMd,
          { color: textColor },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonSm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonMd: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  secondaryButton: {
    borderWidth: 1,
  },
  textBase: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textSm: {
    fontSize: 14,
  },
  textMd: {
    fontSize: 15,
  },
});
