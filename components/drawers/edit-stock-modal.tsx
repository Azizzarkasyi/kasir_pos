
import ComboInput from "@/components/combo-input";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

type EditStockModalProps = {
  visible: boolean;
  productLabel: string;
  initialQuantity: number;
  previousQuantity?: number;
  onClose: () => void;
  onSubmit: (params: { quantity: number; mode: string }) => void;
};

const STOCK_MODES = [
  { label: "Stok Disesuaikan", value: "adjust" },
  { label: "Stok Bertambah", value: "increase" },
  { label: "Stok Berkurang", value: "decrease" },
];

const EditStockModal: React.FC<EditStockModalProps> = ({
  visible,
  productLabel,
  initialQuantity,
  previousQuantity,
  onClose,
  onSubmit,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  const [internalVisible, setInternalVisible] = useState(visible);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [mode, setMode] = useState(STOCK_MODES[0].label);

  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      setQuantity(initialQuantity);
      opacity.setValue(1);
    } else {
      setInternalVisible(false);
    }
  }, [visible, initialQuantity, opacity]);

  const handleChangeQty = (delta: number) => {
    setQuantity(q => {
      const next = q + delta;
      if (next < 0) return 0;
      return next;
    });
  };

  const handleSave = () => {
    onSubmit({ quantity, mode });
  };

  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.root}> 
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity }]} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.centerWrapper}
        >
          <Animated.View style={[styles.card, { transform: [{ scale }] }]}> 
            <ThemedText type="subtitle-2" style={styles.title}>
              {productLabel}
            </ThemedText>

            <View style={{ marginTop: 16 }}>
              <ComboInput
                label="Stok Disesuaikan"
                value={mode}
                onChangeText={setMode}
                items={STOCK_MODES}
                disableAutoComplete
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <ThemedText type="defaultSemiBold">Stok saat ini</ThemedText>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => handleChangeQty(-1)}
                >
                  <ThemedText style={styles.qtyButtonText}>-</ThemedText>
                </TouchableOpacity>

                <View style={styles.qtyValueContainer}>
                  <ThemedText style={styles.qtyValue}>{quantity}</ThemedText>
                </View>

                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => handleChangeQty(1)}
                >
                  <ThemedText style={styles.qtyButtonText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.previousRow}>
              <ThemedText style={styles.previousLabel}>Stok Sebelumnya</ThemedText>
              <ThemedText style={styles.previousValue}>
                {previousQuantity ?? initialQuantity}
              </ThemedText>
            </View>

            <View style={styles.actionsRow}>
              <ThemedButton onPress={onClose} variant="cancel" title="Batal" />
              <ThemedButton onPress={handleSave} title="Simpan" />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      zIndex: 20,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    centerWrapper: {
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      width: "90%",
      maxWidth: 420,
      paddingHorizontal: 20,
      paddingVertical: 24,
      borderRadius: 12,
      backgroundColor: Colors[colorScheme].background,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      marginBottom: 4,
    },
    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 8,
      overflow: "hidden",
    },
    qtyButton: {
      width: 48,
      height: 40,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyButtonText: {
      fontSize: 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    qtyValue: {
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    qtyValueContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].background,
    },
    previousRow: {
      marginTop: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    previousLabel: {
      color: Colors[colorScheme].icon,
    },
    previousValue: {
      color: Colors[colorScheme].icon,
      fontWeight: "500",
    },
    actionsRow: {
      marginTop: 24,
      flexDirection: "row",
      justifyContent: "space-between",
    },
  });

export default EditStockModal;

