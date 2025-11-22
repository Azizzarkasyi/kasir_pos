import React from "react";
import {Image, StyleSheet, TouchableOpacity, View} from "react-native";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Colors} from "@/constants/theme";
import {Ionicons} from "@expo/vector-icons";
import {ThemedText} from "./themed-text";

interface ImageUploadProps {
  uri?: string | null;
  initials?: string;
  onPress?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({uri, initials = "NP", onPress}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.container}>
      <View style={styles.square}>
        {uri ? (
          <Image source={{uri}} style={styles.image} />
        ) : (
          <ThemedText style={styles.initials}>{initials}</ThemedText>
        )}
        <TouchableOpacity style={styles.cameraBtn} onPress={onPress}>
          <Ionicons name="camera" size={20} color={Colors[colorScheme].text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginTop: 12,
    },
    square: {
      width: 104,
      height: 104,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].icon,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
    },
    initials: {
      fontSize: 28,
      fontWeight: "700",
      color: Colors[colorScheme].background,
    },
    cameraBtn: {
      position: "absolute",
      bottom: -16,
      alignSelf: "center",
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme].background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
    },
  });

export default ImageUpload;