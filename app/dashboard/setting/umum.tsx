import MenuRow from "@/components/menu-row";
import {ThemedButton} from "@/components/themed-button";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React from "react";
import {StyleSheet, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";

export default function GeneralSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCardHighlight}>
          <ThemedText type="subtitle-2">Sinkronisasi Data Qasir</ThemedText>
          <ThemedText style={{color: Colors[colorScheme].icon}}>
            Lakukan sinkronisasi untuk perbarui data Qasir
          </ThemedText>
          <View style={styles.syncRow}>
            <View>
              <ThemedText style={{color: Colors[colorScheme].icon}}>
                Terakhir Disinkronkan
              </ThemedText>
              <ThemedText>20 Nov 2025 07:24</ThemedText>
            </View>
            <ThemedButton title="Sinkronisasi" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Umum</ThemedText>
          <MenuRow
            title="Bahasa"
            rightText="Indonesia"
            variant="link"
            showTopBorder={false}
            onPress={() => {}}
          />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="subtitle-2">Perangkat Tambahan</ThemedText>
            <ThemedText style={{color: Colors[colorScheme].primary}}>
              Beli Sekarang
            </ThemedText>
          </View>
          <MenuRow
            title="Printer"
            rightText="Belum Terhubung"
            variant="link"
            showTopBorder={false}
            onPress={() => {}}
          />
          <MenuRow title="Atur Struk" variant="link" onPress={() => {}} />
        </View>
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
    sectionCardHighlight: {
      marginTop: 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].secondary,
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 8,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    syncRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
  });
