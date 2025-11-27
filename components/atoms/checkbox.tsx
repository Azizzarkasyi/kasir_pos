import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

export type CheckboxProps = {
  checked: boolean;
  label?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
};

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  label,
  onPress,
  containerStyle,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.row, containerStyle]}
      onPress={onPress}
    >
      <View
        style={[
          styles.box,
          checked && {
            backgroundColor: Colors[colorScheme].primary,
            borderColor: Colors[colorScheme].primary,
          },
        ]}
      >
        {checked && (
          <Ionicons
            name="checkmark"
            size={14}
            color={Colors[colorScheme].secondary}
          />
        )}
      </View>

      {label ? (
        <ThemedText style={styles.label}>{label}</ThemedText>
      ) : null}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    box: {
      width: 22,
      height: 22,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      marginRight: 12,
      backgroundColor: Colors[colorScheme].background,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: 14,
      color: Colors[colorScheme].text,
    },
  });

export default Checkbox;
