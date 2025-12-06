import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";

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
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

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

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: isTablet ? 32 : 24,
    },
    card: {
      width: "100%",
      maxWidth: isTablet ? 520 : 420,
      borderRadius: isTablet ? 20 : 16,
      backgroundColor: Colors[colorScheme].secondary,
      paddingHorizontal: isTablet ? 28 : 24,
      paddingVertical: isTablet ? 24 : 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      textAlign: "center",
      fontSize: isTablet ? 26 : 18,
      fontWeight: "700",
      marginBottom: isTablet ? 18 : 8,
      color: Colors[colorScheme].text,
    },
    message: {
      textAlign: "center",
      fontSize: isTablet ? 20 : 14,
      color: Colors[colorScheme].icon,
      marginBottom: isTablet ? 24 : 20,
    },
    actionsRow: {
      flexDirection: "row",
      columnGap: isTablet ? 12 : 8,
    },
    button: {
      flex: 1,
      height: isTablet ? 52 : 44,
      borderRadius: isTablet ? 10 : 8,
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
      fontSize: isTablet ? 18 : 14,
    },
    buttonPrimary: {
      backgroundColor: Colors[colorScheme].primary,
    },
    buttonPrimaryText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: isTablet ? 20 : 16,
    },
  });

export default ConfirmationDialog;

