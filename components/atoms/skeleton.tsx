import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type SkeletonType = "rect" | "circle";

type SkeletonProps = {
  width: number;
  height: number;
  type?: SkeletonType;
  style?: ViewStyle;
};

const Skeleton: React.FC<SkeletonProps> = ({width, height, type = "rect", style}) => {
  const colorScheme = useColorScheme() ?? "light";
  const baseStyle = styles(Colors[colorScheme].icon, type);

  return (
    <View
      style={[
        baseStyle.base,
        type === "circle" ? baseStyle.circle : null,
        {width, height},
        style,
      ]}
    />
  );
};

const styles = (color: string, type: SkeletonType) =>
  StyleSheet.create({
    base: {
      backgroundColor: color,
      opacity: 0.16,
      borderRadius: type === "circle" ? 999 : 6,
    },
    circle: {
      borderRadius: 999,
    },
  });

export default Skeleton;

