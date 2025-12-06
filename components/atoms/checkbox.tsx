import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle, useWindowDimensions } from "react-native";

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
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const styles = createStyles(colorScheme, isTablet, isLandscape);

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
            size={isTablet ? 18 : 14}
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

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isLandscape: boolean) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    box: {
      width: isTablet && isLandscape ? 28 : 22,
      height: isTablet && isLandscape ? 28 : 22,
      borderRadius: isTablet && !isLandscape ? 6 : 4,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      marginRight: isTablet && !isLandscape ? 16 : 12,
      backgroundColor: Colors[colorScheme].background,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].text,
    },
  });

export default Checkbox;
