import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
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
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  return (
    <View style={styles.card}>
      <ThemedInput
        label="Harga Modal"
        value={capitalPrice ? String(capitalPrice) : ""}
        onChangeText={v => onCapitalPriceChange(v ? Number(v) : 0)}
        numericOnly
        showLabel={true}
        size="md"

        placeholderTextColor={Colors[colorScheme].icon}
        inputContainerStyle={{
          backgroundColor: colorScheme === "dark" ? "#1F1F1F" : "#FFFFFF",
        }}
        containerStyle={{marginVertical: 0}}
      />

      <View style={styles.inputRow}>
        <View style={{flex: 1}}>
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
            containerStyle={{marginVertical: 0}}
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
              size={isTablet ? 28 : 22}
              color={Colors[colorScheme].primary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    card: {
      borderColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 10 : 8,
      paddingTop: isTablet ? 16 : 12,
      gap: isTablet ? 16 : 12,
      paddingBottom: isTablet ? 36 : 32,
      backgroundColor: Colors[colorScheme].background,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 12 : 8,
    },
    input: {},
    iconButton: {
      width: isTablet ? 60 : 50,
      height: isTablet ? 60 : 50,
      borderRadius: isTablet ? 10 : 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default CostBarcodeFields;
