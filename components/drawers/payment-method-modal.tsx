"use client";

import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";

type PaymentMethod = 
  | "cash" 
  | "debt" 
  | "qris" 
  | "grab" 
  | "shopee_food" 
  | "bank_transfer" 
  | "e_wallet" 
  | "credit_card" 
  | "debit_card";

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
  selectedMethod: PaymentMethod;
  colorScheme?: "light" | "dark";
}

const paymentMethods: { value: PaymentMethod; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "cash", label: "Tunai", icon: "cash-outline" },
  { value: "debt", label: "Utang", icon: "document-text-outline" },
  { value: "qris", label: "QRIS", icon: "qr-code-outline" },
  { value: "grab", label: "Grab", icon: "car-outline" },
  { value: "shopee_food", label: "ShopeeFood", icon: "fast-food-outline" },
  { value: "bank_transfer", label: "Transfer Bank", icon: "swap-horizontal-outline" },
  { value: "e_wallet", label: "E-Wallet", icon: "wallet-outline" },
  { value: "credit_card", label: "Kartu Kredit", icon: "card-outline" },
  { value: "debit_card", label: "Kartu Debit", icon: "card-outline" },
];

export default function PaymentMethodModal({
  visible,
  onClose,
  onSelect,
  selectedMethod,
  colorScheme = "light",
}: PaymentMethodModalProps) {
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  const handleSelect = (method: PaymentMethod) => {
    onSelect(method);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Pilih Metode Pembayaran</Text>
          
          <View style={styles.methodsContainer}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.value}
                style={[
                  styles.methodItem,
                  selectedMethod === method.value && styles.selectedMethod,
                ]}
                onPress={() => handleSelect(method.value)}
              >
                <View style={styles.methodIcon}>
                  <Ionicons
                    name={method.icon}
                    size={isTablet ? 24 : 20}
                    color={selectedMethod === method.value ? Colors[colorScheme].secondary : Colors[colorScheme].text}
                  />
                </View>
                <Text
                  style={[
                    styles.methodLabel,
                    selectedMethod === method.value && styles.selectedLabel,
                  ]}
                >
                  {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 16,
      padding: isTablet ? 32 : 24,
      width: "90%",
      maxWidth: 500,
      maxHeight: "80%",
    },
    title: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 24,
      textAlign: "center",
    },
    methodsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 24,
    },
    methodItem: {
      width: "48%",
      flexDirection: "row",
      alignItems: "center",
      padding: isTablet ? 16 : 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
      marginBottom: 12,
      minHeight: isTablet ? 72 : 60,
    },
    selectedMethod: {
      backgroundColor: Colors[colorScheme].primary,
      borderColor: Colors[colorScheme].primary,
    },
    methodIcon: {
      marginRight: 12,
    },
    methodLabel: {
      fontSize: isTablet ? 16 : 14,
      color: Colors[colorScheme].text,
      fontWeight: "500",
      flex: 1,
      flexWrap: "wrap",
    },
    selectedLabel: {
      color: Colors[colorScheme].secondary,
    },
    closeButton: {
      padding: isTablet ? 16 : 12,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].secondary,
      alignItems: "center",
    },
    closeButtonText: {
      fontSize: isTablet ? 16 : 14,
      color: Colors[colorScheme].icon,
      fontWeight: "500",
    },
  });
