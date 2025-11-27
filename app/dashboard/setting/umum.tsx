import SectionDivider from "@/components/atoms/section-divider";
import SelectLanguageModal, { LanguageValue } from "@/components/drawers/select-language-modal";
import MenuRow from "@/components/menu-row";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function GeneralSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const [language, setLanguage] = React.useState<LanguageValue>("id");
  const [showLanguageModal, setShowLanguageModal] = React.useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.sectionCardHighlight}>
          <ThemedText type="subtitle-2" style={styles.syncTitle}>Sinkronisasi Data </ThemedText>
          <ThemedText style={styles.syncSubtitle}>
            Lakukan sinkronisasi untuk perbarui data Qasir
          </ThemedText>
          <View style={styles.syncRow}>
            <View>
              <ThemedText style={styles.syncLastLabel}>
                Terakhir Disinkronkan
              </ThemedText>
              <ThemedText style={styles.syncLastTime}>20 Nov 2025 07:24</ThemedText>
            </View>
            <ThemedButton title="Sinkronisasi" size="sm" onPress={() => { }} />
          </View>
        </View>
        <SectionDivider/>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2" style={styles.sectionTitle}>Umum</ThemedText>
          <MenuRow
            title="Bahasa"
            rightText={language === "en" ? "English" : "Indonesia"}
            variant="link"
            style={styles.menuRowTitle}
            showTopBorder={false}
            showBottomBorder={false}
            onPress={() => setShowLanguageModal(true)}
          />
        </View>
        <SectionDivider/>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>Perangkat Tambahan</ThemedText>
            <TouchableOpacity>
              <Text style={styles.buyNowText}>Beli Sekarang</Text>
            </TouchableOpacity>
          </View>
          <MenuRow
            title="Printer"
            rightText="Belum Terhubung"
            variant="link"
            rowStyle={styles.printerRow}
            style={styles.menuRowTitle}
            showTopBorder={false}
            showBottomBorder={false}
            onPress={() => router.push("/dashboard/setting/printer" as never)}
          />
          <MenuRow
            title="Scanner"
            rightText="Belum Terhubung"
            variant="link"
            rowStyle={styles.scannerRow}
            style={styles.menuRowTitle}
            showTopBorder={false}
            showBottomBorder={false}
            onPress={() => router.push("/dashboard/setting/scanner" as never)}
          />
          <MenuRow
            title="Atur Struk"
            variant="link"
            rowStyle={styles.receiptRow}
            style={styles.menuRowTitle}
            showTopBorder={false}
            showBottomBorder={false}
            onPress={() => router.push("/dashboard/setting/receipt" as never)}
          />
        </View>
      </ScrollView>

      <SelectLanguageModal
        visible={showLanguageModal}
        value={language}
        onChange={(next) => {
          setLanguage(next);
          setShowLanguageModal(false);
        }}
        onClose={() => setShowLanguageModal(false)}
      />
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
      paddingBottom: 20,
    },
    sectionCard: {
      marginTop: 12,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 24,
      paddingVertical: 8,
    },
    sectionCardHighlight: {
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].secondary,
      paddingHorizontal: 24,
      paddingVertical: 24,
      gap: 4,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    syncRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 10,
    },
    syncTitle: {
      lineHeight: 20,
      fontSize: 16,
    },
    syncSubtitle: {
      color: Colors[colorScheme].icon,
      fontSize: 14,
    },
    syncLastLabel: {
      color: Colors[colorScheme].text,
      fontSize: 16,
      fontWeight: "600",
    },
    syncLastTime: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
    },
    sectionTitle: {
      fontWeight: "600",
      fontSize: 16,
    },
    menuRowTitle: {
      fontWeight: "400",
      fontSize: 16,
    },
    buyNowText: {
      color: Colors[colorScheme].primary,
    },
    printerRow: {
      marginTop: 24,
      minHeight: 0,
      paddingVertical: 12,
    },
    scannerRow: {
      minHeight: 0,
      paddingVertical: 12,
    },
    receiptRow: {
      minHeight: 0,
      paddingVertical: 12,
    },
  });
