import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {ThemedText} from "../themed-text";

export type DeviceItem = {name: string; mac: string};

type Props = {
  devices: DeviceItem[];
  onConnect: (device: DeviceItem) => void;
  onRefresh?: () => void;
};

const DeviceList: React.FC<Props> = ({devices, onConnect}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <View style={{marginTop: 12}}>
      {devices.map(d => (
        <View key={d.mac} style={styles.itemRow}>
          <View style={styles.itemLeft}>
            <Ionicons
              name="bluetooth-outline"
              size={20}
              color={Colors[colorScheme].icon}
            />
            <View style={{marginLeft: 8}}>
              <ThemedText style={{fontWeight: "600"}}>{d.name}</ThemedText>
              <ThemedText style={{color: Colors[colorScheme].icon}}>
                {d.mac}
              </ThemedText>
            </View>
          </View>

          <TouchableOpacity onPress={() => onConnect(d)}>
            <ThemedText style={{color: Colors[colorScheme].primary}}>
              Hubungkan
            </ThemedText>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].icon,
    },
    itemLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

export default DeviceList;
