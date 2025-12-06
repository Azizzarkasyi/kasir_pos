import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { ThemedText } from "../themed-text";

export type DeviceItem = {name: string; mac: string};

type Props = {
  devices: DeviceItem[];
  onConnect: (device: DeviceItem) => void;
  onRefresh?: () => void;
};

const DeviceList: React.FC<Props> = ({devices, onConnect}) => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  return (
    <View style={{marginTop: isTablet ? 20 : 12}}>
      {devices.map(d => (
        <View key={d.mac} style={styles.itemRow}>
          <View style={styles.itemLeft}>
            <Ionicons
              name="bluetooth-outline"
              size={isTablet ? 28 : 20}
              color={Colors[colorScheme].icon}
            />
            <View style={{marginLeft: isTablet ? 16 : 8}}>
              <ThemedText style={{fontWeight: "500", fontSize: isTablet ? 20 : 16}}>{d.name}</ThemedText>
              <ThemedText style={{color: Colors[colorScheme].icon, fontSize: isTablet ? 18 : 14}}>
                {d.mac}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity onPress={() => onConnect(d)}>
            <ThemedText style={{color: Colors[colorScheme].primary, fontWeight: "500", fontSize: isTablet ? 18 : 14}}>
              Hubungkan
            </ThemedText>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: isTablet ? 20 : 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

export default DeviceList;
