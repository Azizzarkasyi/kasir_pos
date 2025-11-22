import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {Modal, StyleSheet, TouchableOpacity, View, Image} from "react-native";
import {ThemedText} from "../themed-text";

type Props = {
  visible: boolean;
  title: string;
  description: string;
  imageUri?: string;
  onClose: () => void;
};

const HelpPopup: React.FC<Props> = ({visible, title, description, imageUri, onClose}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={Colors[colorScheme].icon} />
          </TouchableOpacity>
          <View style={styles.imageCircle}>
            {imageUri ? (
              <Image source={{uri: imageUri}} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
          </View>
          <ThemedText style={styles.popupTitle}>{title}</ThemedText>
          <ThemedText style={styles.popupDesc}>{description}</ThemedText>
          <TouchableOpacity style={styles.closeTextBtn} onPress={onClose}>
            <ThemedText style={styles.closeText}>Tutup</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    card: {
      width: "100%",
      maxWidth: 380,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    closeBtn: {
      position: "absolute",
      right: 12,
      top: 12,
      zIndex: 2,
    },
    imageCircle: {
      alignSelf: "center",
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: Colors[colorScheme].secondary,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    image: {width: "100%", height: "100%"},
    imagePlaceholder: {width: "60%", height: "60%", borderRadius: 999, backgroundColor: Colors[colorScheme].icon, opacity: 0.2},
    popupTitle: {textAlign: "center", marginTop: 16, fontWeight: "700"},
    popupDesc: {textAlign: "center", marginTop: 8, color: Colors[colorScheme].icon},
    closeTextBtn: {alignSelf: "center", marginTop: 16},
    closeText: {color: "#FF5722", fontWeight: "700"},
  });

export default HelpPopup;