import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Variant = {
  id: string;
  name: string;
  price: number;
  stock?: number;
};

type SelectVariantModalProps = {
  visible: boolean;
  productName: string;
  variants: Variant[];
  onClose: () => void;
  onConfirm: (payload: {
    productId: string;
    variantId: string;
    quantity: number;
    note: string;
  }) => void;
  productId: string;
};

const SelectVariantModal: React.FC<SelectVariantModalProps> = ({
  visible,
  productName,
  variants,
  onClose,
  onConfirm,
  productId,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  const [step, setStep] = React.useState<1 | 2>(1);
  const [selectedVariant, setSelectedVariant] = React.useState<Variant | null>(
    null
  );
  const [quantity, setQuantity] = React.useState<number>(1);
  const [note, setNote] = React.useState<string>("");

  React.useEffect(() => {
    if (!visible) {
      setStep(1);
      setSelectedVariant(null);
      setQuantity(1);
      setNote("");
    }
  }, [visible]);

  const handleSelectVariant = (variant: Variant) => {
    setSelectedVariant(variant);
    setStep(2);
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleConfirm = () => {
    if (!selectedVariant) return;
    onConfirm({
      productId,
      variantId: selectedVariant.id,
      quantity,
      note,
    });
  };

  const renderStepOne = () => {
    return (
      <View style={styles.cardContent}>
        <Text style={styles.title}>SELECT VARIATION</Text>
        {variants.map((variant) => (
          <TouchableOpacity
            key={variant.id}
            style={styles.variantRow}
            onPress={() => handleSelectVariant(variant)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.variantName}>{variant.name}</Text>
              <View style={styles.variantSubtitlePill}>
                <Text style={styles.variantSubtitleText}>
                  {`remaining ${variant.stock ?? "-"} - Rp ${variant.price.toLocaleString("id-ID")}`}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" style={styles.chevron} size={16} color={Colors[colorScheme].icon} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>CANCEL</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStepTwo = () => {
    if (!selectedVariant) return null;

    return (
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.variantName}>{selectedVariant.name}</Text>
            <Text style={styles.variantProductName}>{productName}</Text>
          </View>
          <Text style={styles.priceText}>
            Rp {selectedVariant.price.toLocaleString("id-ID")}
          </Text>
        </View>

        <View style={styles.quantityWrapper}>
          <View style={styles.quantityRow}>
            <TouchableOpacity style={styles.qtyButton} onPress={handleDecrease}>
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>

            <View style={styles.qtyValueContainer}>
              <Text style={styles.qtyValue}>{quantity}</Text>
            </View>

            <TouchableOpacity style={styles.qtyButton} onPress={handleIncrease}>
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Add short notes</Text>
          <TextInput
            placeholder="Tuliskan catatan singkat"
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            multiline
          />
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
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>{step === 1 ? renderStepOne() : renderStepTwo()}</View>
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
    variantRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    variantName: {
      fontSize: 16,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    variantSubtitlePill: {
      marginTop: 4,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].background,
    },
    variantSubtitleText: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
    },
    chevron: {
      fontSize: 18,
      color: Colors[colorScheme].icon,
      marginLeft: 8,
    },
    cancelButton: {
      marginTop: 12,
      height: 44,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: 16,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    variantProductName: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
    priceText: {
      fontSize: 18,
      color: Colors[colorScheme].text,
      fontWeight: "600",
    },
    quantityWrapper: {
      marginBottom: 16,
      borderRadius: 8,
    },
    quantityRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 8,
      overflow: "hidden",
    },
    qtyButton: {
      width: 50,
      height: 50,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyButtonText: {
      fontSize: 20,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    qtyValueContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].secondary,
    },
    qtyValue: {
      fontSize: 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    section: {
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      marginBottom: 6,
    },
    noteInput: {
      minHeight: 100,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      fontSize: 15,
      textAlignVertical: "top",
      color: Colors[colorScheme].text,
    },
    footerRow: {
      flexDirection: "row",
      columnGap: 8,
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

export default SelectVariantModal;

