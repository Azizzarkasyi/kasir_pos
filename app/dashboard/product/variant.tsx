import CostBarcodeFields from "@/components/cost-barcode-fields";
import MenuRow from "@/components/menu-row";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useRouter} from "expo-router";
import React, {useState} from "react";
import {StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function VariantScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [enableCostBarcode, setEnableCostBarcode] = useState(false);
  const [capitalPrice, setCapitalPrice] = useState(0);
  const [barcode, setBarcode] = useState("");

  const handleSave = () => {
    const priceNum = Number((price || "").replace(/[^0-9]/g, ""));
    router.replace({
      pathname: "/dashboard/product/add-product",
      params: {
        variant_name: name,
        variant_price: String(priceNum),
      },
    } as never);
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 80,
        }}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedInput label="Nama Variasi" value={name} onChangeText={setName} />
        <ThemedInput
          label="Harga Jual"
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
        />

        <View style={styles.sectionDivider} />

        <MenuRow
          title="Atur Harga Modal dan Barcode"
          variant="toggle"
          value={enableCostBarcode}
          onValueChange={setEnableCostBarcode}
          showBottomBorder={!enableCostBarcode}
        />

        {enableCostBarcode ? (
          <CostBarcodeFields
            capitalPrice={capitalPrice}
            onCapitalPriceChange={setCapitalPrice}
            barcode={barcode}
            onBarcodeChange={setBarcode}
          />
        ) : null}

        <MenuRow
          title="Kelola Stok"
          rightText="Stok Tidak Aktif"
          variant="link"
          onPress={() => {}}
        />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <ThemedButton title="Simpan" onPress={handleSave} />
      </View>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    sectionDivider: {
      height: 1,
      backgroundColor: Colors[colorScheme].icon,
      marginVertical: 12,
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingBottom: 16,
      paddingTop: 8,
      backgroundColor: Colors[colorScheme].background,
    },
  });
