import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React from "react";
import {StyleSheet, View} from "react-native";
import {ThemedInput} from "./themed-input";

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
        showLabel={false}
        placeholder="Harga Modal"
        placeholderTextColor={Colors[colorScheme].icon}
        inputContainerStyle={{
          backgroundColor: colorScheme === "dark" ? "#1F1F1F" : "#FFFFFF",
        }}
        containerStyle={{marginVertical: 0}}
      />

      <ThemedInput
        label="Kode Produk / Barcode"
        value={barcode}
        onChangeText={onBarcodeChange}
        showLabel={false}
        placeholder="Kode Produk / Barcode"
        placeholderTextColor={Colors[colorScheme].icon}
        rightIconName="barcode-outline"
        inputContainerStyle={{
          backgroundColor: colorScheme === "dark" ? "#1F1F1F" : "#ffffffff",
        }}
        containerStyle={{marginVertical: 0}}
      />
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    card: {
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      padding: 12,
      gap: 12,
      backgroundColor: Colors[colorScheme].background,
    },
    inputRow: {},
    input: {},
    iconButton: {},
  });

export default CostBarcodeFields;
