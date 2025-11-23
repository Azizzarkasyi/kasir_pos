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
}

const Header: React.FC<HeaderProps> = ({
  onBackPress,
  onHelpPress,
  title,
  showBack = true,
  showHelp = true,
  left,
  right,
  center,
  withNotificationButton = true,
}) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.headerContainer, {paddingTop: insets.top + 16}]}>
      <View style={styles.leftArea}>
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
      </View>
      <View style={styles.centerArea}>
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
              color={Colors[colorScheme].primary}
            />
          </TouchableOpacity>
        ) : null}
        {withNotificationButton ? right : null}
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      paddingVertical: 16,
      paddingHorizontal: 8,
      backgroundColor: Colors[colorScheme].background,
      position: "relative",
      shadowColor: "#000000",
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 6,
      zIndex: 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "rgba(0,0,0,0.06)",
    },
    leftArea: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    centerArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    rightArea: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    helpButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
    },
    helpButtonText: {
      marginRight: 4,
      color: Colors[colorScheme].text,
    },
    titleText: {
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
  });

export default Header;
