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
  useWindowDimensions,
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
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

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

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: isTablet ? 48 : 24,
    },
    card: {
      width: isTablet ? "70%" : "100%",
      maxWidth: isTablet ? 640 : undefined,
      borderRadius: isTablet ? 24 : 16,
      backgroundColor: Colors[colorScheme].secondary,
      overflow: "hidden",
    },
    cardContent: {
      paddingHorizontal: isTablet ? 28 : 20,
      paddingVertical: isTablet ? 24 : 16,
      rowGap: isTablet ? 18 : 12,
    },
    title: {
      textAlign: "center",
      fontSize: isTablet ? 24 : 20,
      fontWeight: "600",
      marginBottom: isTablet ? 12 : 8,
      color: Colors[colorScheme].text,
    },
    section: {
      marginTop: isTablet ? 8 : 4,
    },
    label: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].icon,
      marginBottom: isTablet ? 10 : 6,
    },
    input: {
      minHeight: isTablet ? 52 : 44,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 8,
      paddingHorizontal: isTablet ? 14 : 10,
      paddingVertical: isTablet ? 10 : 8,
      fontSize: isTablet ? 18 : 15,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
    },
    nominalRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 12 : 8,
    },
    nominalInput: {
      flex: 1,
    },
    currencyPill: {
      paddingHorizontal: isTablet ? 18 : 14,
      paddingVertical: isTablet ? 12 : 10,
      borderRadius: isTablet ? 10 : 8,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    currencyText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: isTablet ? 18 : 16,
    },
    footerRow: {
      flexDirection: "row",
      columnGap: 8,
      marginTop: isTablet ? 20 : 16,
    },
    footerButton: {
      flex: 1,
      height: isTablet ? 52 : 44,
      borderRadius: isTablet ? 10 : 8,
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
      fontSize: isTablet ? 18 : 14,
    },
    footerButtonPrimary: {
      backgroundColor: Colors[colorScheme].primary,
    },
    footerButtonPrimaryText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: isTablet ? 20 : 16,
    },
  });

export default AddAdditionalCostModal;

