import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({checked, onChange}) => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  return (
    <TouchableOpacity
      style={[styles.checkbox, checked ? styles.checked : styles.unchecked]}
      onPress={() => onChange(!checked)}
    >
      {checked && (
        <Ionicons
          name="checkmark"
          size={isTablet ? 26 : 20}
          color={Colors[colorScheme].background}
        />
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    checkbox: {
      width: isTablet ? 32 : 24,
      height: isTablet ? 32 : 24,
      borderWidth: isTablet ? 2 : 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: isTablet ? 6 : 4,
      justifyContent: "center",
      alignItems: "center",
    },
    checked: {
      backgroundColor: Colors[colorScheme].primary,
    },
    unchecked: {
      backgroundColor: Colors[colorScheme].background,
    },
  });

export default Checkbox;
