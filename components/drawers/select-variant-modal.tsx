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
  useWindowDimensions,
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
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

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
            <Ionicons name="chevron-forward" style={styles.chevron} size={isTablet ? 20 : 16} color={Colors[colorScheme].icon} />
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
      width: "100%",
      maxWidth: isTablet ? 500 : undefined,
      borderRadius: isTablet ? 20 : 16,
      backgroundColor: Colors[colorScheme].secondary,
      overflow: "hidden",
    },
    cardContent: {
      paddingHorizontal: isTablet ? 28 : 20,
      paddingVertical: isTablet ? 24 : 16,
      rowGap: isTablet ? 16 : 12,
    },
    title: {
      textAlign: "center",
      fontSize: isTablet ? 24 : 20,
      fontWeight: "600",
      marginBottom: isTablet ? 12 : 8,
      color: Colors[colorScheme].text,
    },
    variantRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: isTablet ? 14 : 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    variantName: {
      fontSize: isTablet ? 20 : 16,
      color: Colors[colorScheme].text,
      fontWeight: "500",
    },
    variantSubtitlePill: {
      marginTop: isTablet ? 6 : 4,
      alignSelf: "flex-start",
      paddingHorizontal: isTablet ? 14 : 10,
      paddingVertical: isTablet ? 6 : 4,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].background,
    },
    variantSubtitleText: {
      fontSize: isTablet ? 16 : 13,
      color: Colors[colorScheme].icon,
    },
    chevron: {
      fontSize: isTablet ? 22 : 18,
      color: Colors[colorScheme].icon,
      marginLeft: isTablet ? 12 : 8,
    },
    cancelButton: {
      marginTop: isTablet ? 16 : 12,
      height: isTablet ? 56 : 44,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButtonText: {
      color: Colors[colorScheme].secondary,
      fontWeight: "600",
      fontSize: isTablet ? 20 : 16,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: isTablet ? 16 : 12,
    },
    variantProductName: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].icon,
      marginTop: isTablet ? 4 : 2,
    },
    priceText: {
      fontSize: isTablet ? 22 : 18,
      color: Colors[colorScheme].text,
      fontWeight: "600",
    },
    quantityWrapper: {
      marginBottom: isTablet ? 20 : 16,
      borderRadius: isTablet ? 10 : 8,
    },
    quantityRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: isTablet ? 6 : 4,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 10 : 8,
      overflow: "hidden",
    },
    qtyButton: {
      width: isTablet ? 64 : 50,
      height: isTablet ? 64 : 50,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyButtonText: {
      fontSize: isTablet ? 26 : 20,
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
      fontSize: isTablet ? 26 : 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    section: {
      marginBottom: isTablet ? 20 : 16,
    },
    sectionLabel: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].icon,
      marginBottom: isTablet ? 10 : 6,
    },
    noteInput: {
      minHeight: isTablet ? 120 : 100,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 10 : 8,
      paddingHorizontal: isTablet ? 14 : 10,
      paddingVertical: isTablet ? 12 : 8,
      fontSize: isTablet ? 18 : 15,
      textAlignVertical: "top",
      color: Colors[colorScheme].text,
    },
    footerRow: {
      flexDirection: "row",
      columnGap: isTablet ? 12 : 8,
    },
    footerButton: {
      flex: 1,
      height: isTablet ? 56 : 44,
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

export default SelectVariantModal;

