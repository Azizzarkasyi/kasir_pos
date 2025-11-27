import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";

interface HeaderProps {
  onBackPress?: () => void;
  onHelpPress?: () => void;
  title?: string;
  showBack?: boolean;
  showHelp?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  center?: React.ReactNode;
  withNotificationButton?: boolean;
  withShadow?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onBackPress,
  onHelpPress,
  title,
  showBack = true,
  showHelp = true,
  withShadow = true,
  left,
  right,
  center,
  withNotificationButton = true,
}) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, withShadow);
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerContent}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme].text}
            />
          </TouchableOpacity>
        ) : null}
        {left}

        {center ? (
          center
        ) : title ? (
          <ThemedText style={styles.titleText}>{title}</ThemedText>
        ) : null}
      </View>
      <View style={styles.rightArea}>
        {showHelp ? (
          <TouchableOpacity style={styles.helpButton} onPress={onHelpPress}>
            <ThemedText style={styles.helpButtonText}>Bantuan</ThemedText>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        ) : null}
        {withNotificationButton ? right : null}
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", withShadow: boolean) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: Colors[colorScheme].background,
      position: "relative",
      ...(withShadow ? {
        shadowColor: Colors[colorScheme].icon,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
      } : {}),
      zIndex: 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "rgba(0,0,0,0.06)",
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 32,
    },
    leftArea: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    rightArea: {
      flexDirection: "row",

      alignItems: "center",
      gap: 12,
    },
    helpButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    helpButtonText: {
      marginRight: 4,
      color: Colors[colorScheme].text,
      fontSize: 14,
      fontWeight: "500",
    },
    titleText: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
  });

export default Header;
