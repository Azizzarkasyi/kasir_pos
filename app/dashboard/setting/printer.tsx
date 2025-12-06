import DeviceList from "@/components/atoms/device-list";
import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useBluetoothDevices } from "@/hooks/use-bluetooth-devices";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";

export default function PrinterScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
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
    <>
      <Header title="Printer" showHelp={false} />
      <View style={styles.container}>
        <View style={styles.contentWrapper}>
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
              <View style={{ marginTop: isTablet ? 24 : 16 }}>
                <ThemedButton
                  title="Tambah Printer"
                  size={isTablet ? "base" : "medium"}
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
              <View style={{ paddingVertical: isTablet ? 24 : 16 }}>
                <ThemedText style={{ color: Colors[colorScheme].icon, fontSize: isTablet ? 18 : 14 }}>
                  Tidak ada perangkat ditemukan.
                </ThemedText>
                {error ? (
                  <ThemedText style={{ color: Colors[colorScheme].danger, fontSize: isTablet ? 18 : 14 }}>
                    {error}
                  </ThemedText>
                ) : null}
              </View>
            ) : null}

            {devices.length > 0 ? (
              <DeviceList devices={devices} onConnect={connect} />
            ) : null}
            {isScanning ? (
              <View style={{ paddingVertical: isTablet ? 24 : 16, alignItems: "center" }}>
                <ActivityIndicator color={Colors[colorScheme].primary} size={isTablet ? "large" : "small"} />
                <ThemedText style={{ marginTop: isTablet ? 16 : 8, fontSize: isTablet ? 18 : 14 }}>
                  Memindai perangkat Bluetooth...
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}

        {connected ? (
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2">Printer Terhubung</ThemedText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: isTablet ? 16 : 8 }}>
              <Ionicons
                name="bluetooth"
                size={isTablet ? 28 : 18}
                color={Colors[colorScheme].primary}
              />
              <ThemedText style={{ fontWeight: "600", fontSize: isTablet ? 20 : 16 }}>
                {connected.name}
              </ThemedText>
            </View>
            <ThemedText style={{ color: Colors[colorScheme].icon, fontSize: isTablet ? 18 : 14 }}>
              {connected.mac}
            </ThemedText>
          </View>
        ) : null}
        </View>
      </View>
    </>

  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: isTablet ? 60 : 20,
      backgroundColor: Colors[colorScheme].background,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
      flex: 1,
    },
    sectionCard: {
      marginTop: isTablet ? 20 : 12,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: isTablet ? 16 : 8,
      paddingVertical: isTablet ? 16 : 8,
    },
    emptyStateWrapper: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: isTablet ? -60 : -40,
      flexDirection: "row",
      height: "100%",
    },
    emptyImage: {
      width: isTablet ? 400 : 300,
      height: isTablet ? 320 : 240,
      borderRadius: isTablet ? 16 : 10,
      resizeMode: "contain",
    },
    emptyTitle: {
      marginTop: isTablet ? 20 : 12,
      fontWeight: "700",
      fontSize: isTablet ? 22 : 16,
    },
    emptySubtitle: {
      marginTop: isTablet ? 8 : 4,
      textAlign: "center",
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 18 : 14,
    },
  });
