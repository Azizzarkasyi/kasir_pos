import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";

export type ShowConfirmationDialogParams = {
  title: string;
  message: string;
  onCancel?: () => void;
  onConfirm?: () => void;
};

export type ConfirmationDialogHandle = {
  showConfirmationDialog: (params: ShowConfirmationDialogParams) => void;
};

const ConfirmationDialog = forwardRef<ConfirmationDialogHandle>((_props, ref) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  const [visible, setVisible] = useState(false);
  const [params, setParams] = useState<ShowConfirmationDialogParams | null>(null);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const handleCancel = useCallback(() => {
    const current = params;
    close();
    current?.onCancel?.();
  }, [close, params]);

  const handleConfirm = useCallback(() => {
    const current = params;
    close();
    current?.onConfirm?.();
  }, [close, params]);

  useImperativeHandle(
    ref,
    () => ({
      showConfirmationDialog: (nextParams: ShowConfirmationDialogParams) => {
        setParams(nextParams);
        setVisible(true);
      },
    }),
    []
  );

  if (!visible || !params) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ThemedText style={styles.title}>{params.title}</ThemedText>
          <ThemedText style={styles.message}>{params.message}</ThemedText>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonSecondaryText}>Tetap di Sini</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.buttonPrimaryText}>Keluar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      borderRadius: 16,
      backgroundColor: Colors[colorScheme].secondary,
      paddingHorizontal: 24,
      paddingVertical: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      textAlign: "center",
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
      color: Colors[colorScheme].text,
    },
    message: {
      textAlign: "center",
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginBottom: 20,
    },
    actionsRow: {
      flexDirection: "row",
      columnGap: 8,
    },
    button: {
      flex: 1,
      height: 44,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonSecondary: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    buttonSecondaryText: {
      color: Colors[colorScheme].text,
      fontWeight: "500",
      fontSize: 14,
    },
    buttonPrimary: {
      backgroundColor: Colors[colorScheme].primary,
    },
    buttonPrimaryText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: 16,
    },
  });

export default ConfirmationDialog;

