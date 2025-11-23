"use client";

import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type CalculatorInputProps = {
  value?: string;
  onChangeValue?: (value: string) => void;
};

const DIGIT_BUTTONS: string[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["0", "000", "."],
];

export function CalculatorInput({ value, onChangeValue }: CalculatorInputProps) {
  const [internalValue, setInternalValue] = React.useState<string>(value ?? "0");
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  const currentValue = value ?? internalValue;

  const updateValue = (next: string) => {
    if (next.length === 0) {
      next = "0";
    }
    if (onChangeValue) {
      onChangeValue(next);
    } else {
      setInternalValue(next);
    }
  };

  const handleDigit = (digit: string) => {
    if (digit === "000") {
      const next = currentValue === "0" ? "000" : currentValue + "000";
      updateValue(next);
      return;
    }

    // Optional: support decimal point
    if (digit === ".") {
      const hasDot = currentValue.includes(".");
      const base = currentValue === "0" ? "0" : currentValue;
      updateValue(hasDot ? base : base + ".");
      return;
    }

    if (!/^[0-9]$/.test(digit)) return;

    const base = currentValue === "0" ? "" : currentValue;
    updateValue(base + digit);
  };

  const handleBackspace = () => {
    if (!currentValue || currentValue.length <= 1) {
      updateValue("0");
      return;
    }
    updateValue(currentValue.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      {/* Keypad */}
      <View style={styles.keypadRow}>
        {/* Left side: numbers grid */}
        <View style={styles.digitsGrid}>
          {DIGIT_BUTTONS.map((row, rowIndex) =>
            row.map((label) => (
              <TouchableOpacity
                key={`${rowIndex}-${label}`}
                onPress={() => handleDigit(label)}
                style={styles.digitButton}
              >
                <Text style={styles.digitButtonText}>{label}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Right side: actions */}
        <View style={styles.actionsColumn}>
          <TouchableOpacity onPress={handleBackspace} style={styles.backspaceButton}>
            <Ionicons name="backspace-outline" size={24} color={Colors[colorScheme].icon} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => updateValue("0")}
            style={styles.clearButton}
          >
            <Text style={styles.clearText}>C</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") => StyleSheet.create({
  container: {
    backgroundColor: Colors[colorScheme].background,
  },
  displayRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  displayText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  keypadRow: {
    flexDirection: "row",
    padding: 12,
  },
  digitsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  digitButton: {
    width: "30%",
    height: 55,
    borderWidth: 1,
    borderColor: Colors[colorScheme].border,
    borderRadius: 8,
    backgroundColor: Colors[colorScheme].background,
    alignItems: "center",
    justifyContent: "center",
  },
  digitButtonText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors[colorScheme].icon,
  },
  actionsColumn: {
    width: 72,
    rowGap: 8,
    backgroundColor: Colors[colorScheme].background,
  },
  backspaceButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors[colorScheme].border,
    backgroundColor: Colors[colorScheme].background,
    alignItems: "center",
    justifyContent: "center",
  },

  clearButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors[colorScheme].border,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors[colorScheme].icon,
  },

});

export default CalculatorInput;

