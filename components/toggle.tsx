import React from "react";
import {StyleSheet, Switch, View} from "react-native";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Colors} from "@/constants/theme";
import {ThemedText} from "./themed-text";

interface ToggleProps {
  label: string;
  description?: string;
  badgeText?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({
  label,
  description,
  badgeText,
  value,
  onValueChange,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.container}>
      <View style={{flex: 1}}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>{label}</ThemedText>
          {badgeText ? (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
            </View>
          ) : null}
        </View>
        {description ? (
          <ThemedText style={styles.desc}>{description}</ThemedText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{false: Colors[colorScheme].icon, true: Colors[colorScheme].primary}}
        thumbColor={Colors[colorScheme].background}
      />
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].icon,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    title: {
      fontWeight: "700",
    },
    badge: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    badgeText: {
      fontSize: 10,
      color: Colors[colorScheme].primary,
    },
    desc: {
      marginTop: 4,
      color: Colors[colorScheme].icon,
    },
  });

export default Toggle;