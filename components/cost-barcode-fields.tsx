import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedInput } from "./themed-input";

type Props = {
  capitalPrice: number;
  onCapitalPriceChange: (val: number) => void;
  barcode: string;
  onBarcodeChange: (val: string) => void;
  onPressScan?: () => void;
};

const CostBarcodeFields: React.FC<Props> = ({
  capitalPrice,
  onCapitalPriceChange,
  barcode,
  onBarcodeChange,
  onPressScan,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.card}>
      <ThemedInput
        label="Harga Modal"
        value={String(capitalPrice)}
        onChangeText={v =>
          onCapitalPriceChange(Number((v || "").replace(/[^0-9]/g, "")))
        }
        keyboardType="number-pad"
        showLabel={true}
        size="md"
        placeholder="Harga Modal"
        placeholderTextColor={Colors[colorScheme].icon}
        inputContainerStyle={{
          backgroundColor: colorScheme === "dark" ? "#1F1F1F" : "#FFFFFF",
        }}
        containerStyle={{ marginVertical: 0 }}
      />

      <View style={styles.inputRow}>
        <View style={{ flex: 1 }}>
          <ThemedInput
            label="Kode Produk / Barcode"
            value={barcode}
            onChangeText={onBarcodeChange}
            showLabel={false}
            size="md"
            placeholder="Kode Produk / Barcode"
            placeholderTextColor={Colors[colorScheme].icon}
            inputContainerStyle={{
              backgroundColor: colorScheme === "dark" ? "#1F1F1F" : "#ffffffff",
            }}
            containerStyle={{ marginVertical: 0 }}
          />
        </View>

        {onPressScan ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onPressScan}
            activeOpacity={0.8}
          >
            <Ionicons
              name="barcode-outline"
              size={22}
              color={Colors[colorScheme].primary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    card: {
      borderColor: Colors[colorScheme].border,
      borderRadius: 8,
      paddingTop: 12,
      gap: 12,
      paddingBottom: 32,
      backgroundColor: Colors[colorScheme].background,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    input: {},
    iconButton: {
      width: 50,
      height: 50,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default CostBarcodeFields;
