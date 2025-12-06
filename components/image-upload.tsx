import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ThemedText } from "./themed-text";

interface ImageUploadProps {
  uri?: string | null;
  initials?: string;
  onPress?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  uri,
  initials = "NP",
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  return (
    <View style={styles.container}>
      <View style={styles.square}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} />
        ) : (
          <ThemedText style={styles.initials}>{initials}</ThemedText>
        )}
        <TouchableOpacity style={styles.cameraBtn} onPress={onPress}>
          <Ionicons name="camera" size={isTablet ? 28 : 20} color={Colors[colorScheme].text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginTop: isTablet ? 20 : 12,
      marginBottom: isTablet ? 20 : 12,
    },
    square: {
      width: isTablet ? 140 : 104,
      height: isTablet ? 140 : 104,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: isTablet ? 12 : 8,
    },
    initials: {
      fontSize: isTablet ? 40 : 28,
      fontWeight: "700",
      color: Colors[colorScheme].background,
    },
    cameraBtn: {
      position: "absolute",
      bottom: isTablet ? -20 : -16,
      right: isTablet ? -24 : -20,
      width: isTablet ? 52 : 40,
      height: isTablet ? 52 : 40,
      borderRadius: isTablet ? 26 : 20,
      backgroundColor: Colors[colorScheme].background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      shadowColor: Colors[colorScheme].shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderColor: Colors[colorScheme].border,
    },
  });

export default ImageUpload;
