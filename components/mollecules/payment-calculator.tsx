"use client";

import CalculatorInput from "@/components/mollecules/calculator-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type PaymentCalculatorProps = {
  value?: string;
  onChangeValue?: (value: string) => void;
};

export type PaymentCalculatorMode = "auto" | "nominal";

const QUICK_AMOUNTS = [
  { label: "Uang Pas", value: "exact" },
  { label: "5.000", value: "5000" },
  { label: "10.000", value: "10000" },
  { label: "20.000", value: "20000" },
  { label: "50.000", value: "50000" },
  { label: "100.000", value: "100000" },
  // { label: "Nominal Lain", value: "others" },
];

const PaymentCalculator: React.FC<PaymentCalculatorProps> = ({
  value,
  onChangeValue,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const [mode, setMode] = React.useState<PaymentCalculatorMode>("auto");

  const handleQuickAmount = (val: string) => {
    if (!onChangeValue) return;

    if (val === "exact" || val === "others") {
      // Biarkan parent yang handle behaviour khusus.
      onChangeValue(val);
      return;
    }

    onChangeValue(val);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.typeNominalBadge}
          onPress={() => setMode(mode === "auto" ? "nominal" : "auto")}
        >
          <Ionicons
            name="card-outline"
            size={isTablet ? 20 : 16}
            color={Colors[colorScheme].primary}
          />
          <Text style={styles.typeNominalText}>
            {mode === "auto" ? "Pilih Nominal" : "Mode Otomatis"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={isTablet ? 20 : 16}
            color={Colors[colorScheme].primary}
          />
        </TouchableOpacity>
      </View>

      {mode === "auto" ? (
        <View style={styles.autoWrapper}>
          <CalculatorInput value={value} onChangeValue={onChangeValue} />
        </View>
      ) : (
        <View style={styles.nominalWrapper}>
          <View style={styles.quickGrid}>
            {QUICK_AMOUNTS.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.quickButton, {
                  backgroundColor: Colors[colorScheme].primary,
                }]}
                onPress={() => handleQuickAmount(item.value)}
              >
                <Text
                  style={[
                    styles.quickButtonText,
                    { color: Colors[colorScheme].secondary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      borderTopWidth: isTabletLandscape ? 0 : 1,
      borderTopColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].secondary,
      paddingTop: isTablet ? 12 : 6,
    },
    topRow: {
      paddingHorizontal: isTablet ? 24 : 16,
      paddingTop: isTablet ? 12 : 6,
      paddingBottom: isTablet ? 6 : 4,
    },
    typeNominalBadge: {
      flexDirection: "row",
      alignItems: "center",
      columnGap: isTablet ? 6 : 4,
      paddingHorizontal: isTablet ? 16 : 12,
      paddingVertical: isTablet ? 10 : 6,
      borderRadius: 999,
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].primary,
    },
    typeNominalText: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].primary,
      fontWeight: "600",
    },
    autoWrapper: {
      backgroundColor: Colors[colorScheme].secondary,
    },
    nominalWrapper: {
      paddingHorizontal: isTablet ? 24 : 16,
      paddingVertical: isTablet ? 16 : 12,
      backgroundColor: Colors[colorScheme].secondary,
    },
    quickGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: isTablet ? 12 : 8,
    },
    quickButton: {
      width: "48%",
      height: isTablet ? 60 : 48,
      borderRadius: isTablet ? 10 : 8,
      alignItems: "center",
      justifyContent: "center",
    },
    quickButtonText: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "600",
    },
  });

export default PaymentCalculator;
