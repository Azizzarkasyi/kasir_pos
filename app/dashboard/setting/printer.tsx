import DeviceList, {DeviceItem} from "@/components/atoms/device-list";
import {ThemedButton} from "@/components/themed-button";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";
import React from "react";
import {Image, StyleSheet, TouchableOpacity, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";

export default function PrinterScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const navigation = useNavigation();

  const [connected, setConnected] = React.useState<DeviceItem | null>(null);
  const [showScan, setShowScan] = React.useState(false);
  const [devices, setDevices] = React.useState<DeviceItem[]>([
    {name: "Monster Airmars XKT22", mac: "C1:BD:7A:D2:4B:02"},
    {name: "HAYLOU RSS", mac: "78:D2:B7:CF:89:19"},
    {name: "BJ_LED", mac: "A3:01:01:01:53:18"},
    {name: "Bqss Airpods", mac: "39:89:FD:99:64:81"},
    {name: "PAS 8FF22", mac: "4F:2B:86:46:12:58"},
    {name: "QuietBuds", mac: "D4:2D:BB:52:1E:E4"},
    {name: "M180BT", mac: "00:83:0E:BA:6E:37"},
  ]);

  const refresh = React.useCallback(() => {
    setDevices([...devices]);
  }, [devices]);

  const connect = (d: DeviceItem) => {
    setConnected(d);
    setShowScan(false);
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        showScan ? (
          <TouchableOpacity onPress={refresh} style={{paddingHorizontal: 8}}>
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {!connected && !showScan ? (
          <View style={styles.emptyStateWrapper}>
            <Image
              source={require("@/assets/ilustrations/empty.jpg")}
              style={styles.emptyImage}
            />
            <ThemedText style={styles.emptyTitle}>
              Tidak Ada Printer Terhubung
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Pilih Tambah Printer untuk menghubungkan Printer.
            </ThemedText>
            <View style={{marginTop: 16}}>
              <ThemedButton
                title="Tambah Printer"
                onPress={() => setShowScan(true)}
              />
            </View>
          </View>
        ) : null}

        {showScan ? (
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2">Perangkat Tersedia</ThemedText>
            <DeviceList devices={devices} onConnect={connect} />
          </View>
        ) : null}

        {connected ? (
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2">Printer Terhubung</ThemedText>
            <View style={{flexDirection: "row", alignItems: "center", gap: 8}}>
              <Ionicons
                name="bluetooth"
                size={18}
                color={Colors[colorScheme].primary}
              />
              <ThemedText style={{fontWeight: "600"}}>
                {connected.name}
              </ThemedText>
            </View>
            <ThemedText style={{color: Colors[colorScheme].icon}}>
              {connected.mac}
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    sectionCard: {
      marginTop: 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    emptyStateWrapper: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyImage: {
      width: 240,
      height: 140,
      borderRadius: 10,
    },
    emptyTitle: {
      marginTop: 12,
      fontWeight: "700",
    },
    emptySubtitle: {
      marginTop: 4,
      color: Colors[colorScheme].icon,
    },
  });
