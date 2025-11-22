import {Colors} from "@/constants/theme";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import React from "react";
import {StyleSheet, TouchableOpacity, useColorScheme, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {ThemedText} from "./themed-text";

interface HeaderProps {
  onBackPress?: () => void;
  onHelpPress?: () => void;
  title?: string;
  showBack?: boolean;
  showHelp?: boolean;
  left?: React.ReactNode;
  right?: React.ReactNode;
  center?: React.ReactNode;
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
    <View style={[styles.headerContainer, {paddingTop: insets.top + 12}]}>
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
        {right}
      </View>
      <View style={styles.shadowBar} />
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
      height: "13%",
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: Colors[colorScheme].background,
      position: "relative",
      shadowOffset: {width: 0, height: 2},
    },
    leftArea: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    centerArea: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      marginStart: 16,
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
      fontSize: 20,
      fontWeight: "bold",
    },
    shadowBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 2,
      backgroundColor: Colors[colorScheme].background,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 4,
      elevation: 6,
    },
  });

export default Header;
