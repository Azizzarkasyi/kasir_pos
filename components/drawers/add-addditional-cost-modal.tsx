import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type AddAdditionalCostModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (payload: { name: string; price: number }) => void;
};

const AddAdditionalCostModal: React.FC<AddAdditionalCostModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  const [name, setName] = React.useState<string>("");
  const [nominal, setNominal] = React.useState<string>("0");

  React.useEffect(() => {
    if (!visible) {
      setName("");
      setNominal("0");
    }
  }, [visible]);

  const handleConfirm = () => {
    const parsed = parseInt(nominal.replace(/\D/g, ""), 10);
    const value = Number.isNaN(parsed) ? 0 : parsed;
    onConfirm({
      name: name.trim() || "Fee",
      price: value,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.title}>COST MODULE</Text>

            <View style={styles.section}>
              <Text style={styles.label}>Fee Name (Ex: Wrap, Sticker, etc)</Text>
              <TextInput
                style={styles.input}
                placeholder="Fee Name (Ex: Wrap, Sticker, etc)"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Nominal</Text>
              <View style={styles.nominalRow}>
               
                <TextInput
                  style={[styles.input, styles.nominalInput]}
                  keyboardType="numeric"
                  value={nominal}
                  onChangeText={setNominal}
                />
                 <View style={styles.currencyPill}>
                  <Text style={styles.currencyText}>Rp</Text>
                </View>
              </View>
            </View>

            <View style={styles.footerRow}>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerButtonSecondary]}
                onPress={onClose}
              >
                <Text style={styles.footerButtonSecondaryText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.footerButtonPrimary]}
                onPress={handleConfirm}
              >
                <Text style={styles.footerButtonPrimaryText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
      borderRadius: 16,
      backgroundColor: Colors[colorScheme].secondary,
      overflow: "hidden",
    },
    cardContent: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      rowGap: 12,
    },
    title: {
      textAlign: "center",
      fontSize: 20,
      fontWeight: "600",
      marginBottom: 8,
      color: Colors[colorScheme].text,
    },
    section: {
      marginTop: 4,
    },
    label: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginBottom: 6,
    },
    input: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 15,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
    },
    nominalRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    nominalInput: {
      flex: 1,
    },
    currencyPill: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    currencyText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
    },
    footerRow: {
      flexDirection: "row",
      columnGap: 8,
      marginTop: 16,
    },
    footerButton: {
      flex: 1,
      height: 44,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    footerButtonSecondary: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
    },
    footerButtonSecondaryText: {
      color: Colors[colorScheme].text,
      fontWeight: "500",
      fontSize: 14,
    },
    footerButtonPrimary: {
      backgroundColor: Colors[colorScheme].primary,
    },
    footerButtonPrimaryText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: 16,
    },
  });

export default AddAdditionalCostModal;

