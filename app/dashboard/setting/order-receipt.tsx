import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, Switch, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function OrderReceiptSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  const [displayRunningNumbers, setDisplayRunningNumbers] = React.useState(true);
  const [displayUnitNextToQty, setDisplayUnitNextToQty] = React.useState(true);
  const [showTransactionNote, setShowTransactionNote] = React.useState(true);
  const [displayQuantityTotal, setDisplayQuantityTotal] = React.useState(true);
  const [hideTaxPercentage, setHideTaxPercentage] = React.useState(false);

  const [headerDesc, setHeaderDesc] = React.useState("");
  const [footerDesc, setFooterDesc] = React.useState("");

  return (
    <View style={styles.container}>
      <Header title="Pengaturan Struk" showHelp={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
    
          <SettingRow
            label="Tampilkan penomoran"
            value={displayRunningNumbers}
            onValueChange={setDisplayRunningNumbers}
          />
          <SettingRow
            label="Tampilkan satuan di samping QTY"
            value={displayUnitNextToQty}
            onValueChange={setDisplayUnitNextToQty}
          />
          <SettingRow
            label="Tampilkan Catatan Transaksi"
            value={showTransactionNote}
            onValueChange={setShowTransactionNote}
          />
          <SettingRow
            label="Tampilkan jumlah kuantitas"
            value={displayQuantityTotal}
            onValueChange={setDisplayQuantityTotal}
          />
          <SettingRow
            label="Sembunyikan persentase pajak"
            value={hideTaxPercentage}
            onValueChange={setHideTaxPercentage}
          />
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2" style={{ marginBottom: 8 }}>
            Keterangan Struk
          </ThemedText>
          <ThemedInput
            label="Keterangan Tambahan"
            value={headerDesc}
            onChangeText={setHeaderDesc}
          />
          <ThemedInput
            label="Pesan"
            value={footerDesc}
            onChangeText={setFooterDesc}
          />
        </View>

        <View style={styles.bottomButtonWrapper}>
          <ThemedButton title="Simpan" onPress={() => {}} />
        </View>
      </ScrollView>
    </View>
  );
}

type RowProps = {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
};

const SettingRow: React.FC<RowProps> = ({ label, value, onValueChange }) => {
  const colorScheme = useColorScheme() ?? "light";
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
      }}
    >
      <ThemedText>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: Colors[colorScheme].icon,
          true: Colors[colorScheme].primary,
        }}
        thumbColor={Colors[colorScheme].secondary}
      />
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 80,
    },
    sectionCard: {
      marginTop: 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    bottomButtonWrapper: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
    },
  });