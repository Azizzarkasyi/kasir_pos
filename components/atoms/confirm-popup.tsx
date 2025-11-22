import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {Modal, StyleSheet, TouchableOpacity, View} from "react-native";
import {ThemedText} from "../themed-text";

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmPopup: React.FC<Props> = ({visible, title = "WARNING", message, onConfirm, onCancel}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <View style={styles.separator} />
          <View style={styles.iconCircle}>
            <Ionicons name="alert-outline" size={28} color={Colors[colorScheme].primary} />
          </View>
          <ThemedText style={styles.message}>
            {message}
          </ThemedText>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.btnGhost} onPress={onCancel} activeOpacity={0.8}>
              <ThemedText style={styles.btnGhostText}>NO</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={onConfirm} activeOpacity={0.8}>
              <ThemedText style={styles.btnPrimaryText}>YES</ThemedText>
            </TouchableOpacity>
          </View>
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
      maxWidth: 360,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 18,
      elevation: 6,
    },
    title: {
      textAlign: "center",
      fontWeight: "700",
      fontSize: 16,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: Colors[colorScheme].icon,
      marginTop: 10,
      marginBottom: 12,
      opacity: 0.4,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
    },
    message: {
      textAlign: "center",
      marginTop: 12,
      color: Colors[colorScheme].text,
    },
    actionsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      marginTop: 16,
    },
    btnGhost: {
      flex: 1,
      backgroundColor: Colors[colorScheme].secondary,
      paddingVertical: 12,
      borderRadius: 999,
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
    },
    btnGhostText: {
      color: Colors[colorScheme].text,
      fontWeight: "600",
    },
    btnPrimary: {
      flex: 1,
      backgroundColor: Colors[colorScheme].primary,
      paddingVertical: 12,
      borderRadius: 999,
      alignItems: "center",
    },
    btnPrimaryText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "700",
    },
  });

export default ConfirmPopup;