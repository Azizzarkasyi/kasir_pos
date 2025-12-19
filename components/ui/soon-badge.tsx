import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type SoonBadgeProps = {
  size?: "small" | "medium";
};

const SoonBadge: React.FC<SoonBadgeProps> = ({ size = "small" }) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, size);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>SOON</Text>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", size: "small" | "medium") =>
  StyleSheet.create({
    container: {
      backgroundColor: Colors[colorScheme].border,
      borderRadius: size === "small" ? 8 : 10,
      paddingHorizontal: size === "small" ? 6 : 8,
      paddingVertical: size === "small" ? 2 : 3,
    },
    text: {
      color: Colors[colorScheme].icon,
      fontSize: size === "small" ? 8 : 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
  });

export default SoonBadge;
