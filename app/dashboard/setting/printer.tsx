import DeviceList from "@/components/atoms/device-list";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useBluetoothDevices } from "@/hooks/use-bluetooth-devices";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from "react-native";

export default function PrinterScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const navigation = useNavigation();
  const { devices, startScan, stopScan, isScanning, error } = useBluetoothDevices();

  const [connected, setConnected] = React.useState<
    { name: string; mac: string } | null
  >(null);
  const [showScan, setShowScan] = React.useState(false);

  const refresh = React.useCallback(() => {
    startScan();
  }, [startScan]);

  const connect = (d: { name: string; mac: string }) => {
    setConnected(d);
    setShowScan(false);
    stopScan();
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        showScan ? (
          <TouchableOpacity onPress={refresh} style={{ paddingHorizontal: 8 }}>
            <Ionicons
              name="refresh"
              size={22}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, showScan, colorScheme, refresh]);

  return (
    <View style={styles.container}>

      {!connected && !showScan ? (
        <View style={styles.emptyStateWrapper}>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <Image
              source={require("@/assets/ilustrations/printer-disconnected.png")}
              style={styles.emptyImage}
            />
            <ThemedText style={styles.emptyTitle}>
              Tidak Ada Printer Terhubung
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Pilih Tambah Printer untuk menghubungkan Printer.
            </ThemedText>
            <View style={{ marginTop: 16 }}>
              <ThemedButton
                title="Tambah Printer"
                size="medium"
                onPress={() => {
                  setShowScan(true);
                  startScan();
                }}
              />
            </View>
          </View>
        </View>
      ) : null}

      {showScan ? (
        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Perangkat Tersedia</ThemedText>

          {!isScanning && devices.length === 0 ? (
            <View style={{ paddingVertical: 16 }}>
              <ThemedText style={{ color: Colors[colorScheme].icon }}>
                Tidak ada perangkat ditemukan.
              </ThemedText>
              {error ? (
                <ThemedText style={{ color: Colors[colorScheme].danger }}>
                  {error}
                </ThemedText>
              ) : null}
            </View>
          ) : null}

          {devices.length > 0 ? (
            <DeviceList devices={devices} onConnect={connect} />
          ) : null}
          {isScanning ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator color={Colors[colorScheme].primary} />
              <ThemedText style={{ marginTop: 8 }}>
                Memindai perangkat Bluetooth...
              </ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}

      {connected ? (
        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Printer Terhubung</ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons
              name="bluetooth"
              size={18}
              color={Colors[colorScheme].primary}
            />
            <ThemedText style={{ fontWeight: "600" }}>
              {connected.name}
            </ThemedText>
          </View>
          <ThemedText style={{ color: Colors[colorScheme].icon }}>
            {connected.mac}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      backgroundColor: Colors[colorScheme].background,
    },
    sectionCard: {
      marginTop: 12,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    emptyStateWrapper: {
      alignItems: "center",
      marginTop: -40,
      flexDirection: "row",
      height: "100%",
    },
    emptyImage: {
      width: 300,
      height: 240,
      borderRadius: 10,
      resizeMode: "contain",
    },
    emptyTitle: {
      marginTop: 12,
      fontWeight: "700",
    },
    emptySubtitle: {
      marginTop: 4,
      textAlign: "center",
      color: Colors[colorScheme].icon,
    },
  });
