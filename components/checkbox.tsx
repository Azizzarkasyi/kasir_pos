import React from "react";
import {TouchableOpacity, StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Colors} from "@/constants/theme";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({checked, onChange}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity
      style={[styles.checkbox, checked ? styles.checked : styles.unchecked]}
      onPress={() => onChange(!checked)}
    >
      {checked && (
        <Ionicons
          name="checkmark"
          size={20}
          color={Colors[colorScheme].background}
        />
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 4,
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
