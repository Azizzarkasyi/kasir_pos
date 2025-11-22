import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {ThemedText} from "./themed-text";

type SettingListItemProps = {
  title: string;
  leftIconName: React.ComponentProps<typeof Ionicons>["name"];
  onPress?: () => void;
  showTopBorder?: boolean;
  showBottomBorder?: boolean;
};

const SettingListItem: React.FC<SettingListItemProps> = ({
  title,
  leftIconName,
  onPress,
  showTopBorder = true,
  showBottomBorder = true,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const top =
    typeof StyleSheet.hairlineWidth === "number" ? StyleSheet.hairlineWidth : 1;
  const bottom =
    typeof StyleSheet.hairlineWidth === "number" ? StyleSheet.hairlineWidth : 1;

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          borderTopWidth: showTopBorder ? top : 0,
          borderBottomWidth: showBottomBorder ? bottom : 0,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.titleRow}>
        <Ionicons
          name={leftIconName}
          size={24}
          color={Colors[colorScheme].primary}
        />
        <ThemedText style={styles.rowTitle}>{title}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      minHeight: 60,
      borderTopColor: Colors[colorScheme].icon,
      borderBottomColor: Colors[colorScheme].icon,
      paddingHorizontal: 4,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    rowTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default SettingListItem;