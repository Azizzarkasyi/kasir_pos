import Header from "@/components/header";
import { DashboardMenuKey } from "@/components/layouts/dashboard/menu-config";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDetailDate } from "@/utils/date-utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const StockHistoryDetailScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isPhone = !isTablet;
  const isLandscape = width > height;
  const styles = createStyles(colorScheme, isTablet);

  const [activeMenu, setActiveMenu] = React.useState<DashboardMenuKey>("dashboard");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse parameters
  const productName = params.productName as string || "Produk Tidak Diketahui";
  const variantName = params.variantName as string || "Varian";
  const actionType = (params.actionType as "add_stock" | "remove_stock" | "adjust_stock" | "sale") || "add_stock";
  const amount = parseInt(params.amount as string) || 0;
  const prevStock = parseInt(params.prevStock as string) || 0;
  const currStock = parseInt(params.currStock as string) || 0;
  const note = params.note as string;
  const createdAt = params.createdAt as string || "";

  const openDrawer = React.useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsDrawerOpen(false), []);
  const handleBack = () => router.back();

  // Configuration for display
  const getActionConfig = () => {
    switch (actionType) {
      case "add_stock":
        return { label: "Stok Masuk", color: Colors[colorScheme].primary, icon: "arrow-down-circle-outline" };
      case "remove_stock":
        return { label: "Stok Keluar", color: Colors[colorScheme].danger, icon: "arrow-up-circle-outline" };
      case "adjust_stock":
        return { label: "Penyesuaian", color: Colors[colorScheme].warning, icon: "create-outline" };
      case "sale":
        return { label: "Terjual", color: "#8b5cf6", icon: "cart-outline" };
      default:
        return { label: "Lainnya", color: Colors[colorScheme].icon, icon: "help-circle-outline" };
    }
  };

  const config = getActionConfig();
  const formattedDate = createdAt ? formatDetailDate(createdAt) : "-";

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showHelp={false}
        title="Detail Riwayat"
        // left={
        //   !isPhone ? (
        //     <TouchableOpacity onPress={openDrawer} style={styles.headerIconButton}>
        //       <Ionicons name="menu-outline" size={isTablet ? 36 : 24} color="white" />
        //     </TouchableOpacity>
        //   ) : undefined
        // }
        onBackPress={handleBack}
      />

      <ScrollView style={styles.contentWrapper} contentContainerStyle={styles.contentInner}>

        {/* Card 1: Informasi Produk (Similar to Transaction Detail section) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Informasi Produk</Text>
            {/* Badge for Action Type */}
            <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
              <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoWrapper}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nama Produk</Text>
              <Text style={styles.infoValue}>{productName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Varian</Text>
              <Text style={styles.infoValue}>{variantName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jumlah</Text>
              <Text style={[styles.infoValue, { color: config.color, fontWeight: 'bold' }]}>
                {actionType === 'add_stock' ? '+' : ''}{actionType === 'remove_stock' || actionType === 'sale' ? '-' : ''}{Math.abs(amount)} pcs
              </Text>
            </View>
          </View>
        </View>

        {/* Card 2: Detail Stok */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: isTablet ? 20 : 16, paddingTop: isTablet ? 20 : 16 }]}>
            Rincian Perubahan
          </Text>
          <View style={[styles.divider, { marginTop: isTablet ? 16 : 12 }]} />

          <View style={styles.infoWrapper}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stok Awal</Text>
              <Text style={styles.infoValue}>{prevStock}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stok Akhir</Text>
              <Text style={styles.infoValue}>{currStock}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Waktu</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* Card 3: Catatan (Optional) */}
        {note ? (
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: isTablet ? 20 : 16, paddingTop: isTablet ? 20 : 16 }]}>
              Catatan
            </Text>
            <View style={[styles.divider, { marginTop: isTablet ? 16 : 12 }]} />
            <View style={styles.infoWrapper}>
              <Text style={[styles.infoValue, { textAlign: 'left' }]}>{note}</Text>
            </View>
          </View>
        ) : null}

      </ScrollView>

      {!isPhone && (
        <Sidebar
          activeKey={activeMenu}
          isOpen={isDrawerOpen}
          onClose={closeDrawer}
          onSelect={key => setActiveMenu(key as DashboardMenuKey)}
        />
      )}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    headerIconButton: {
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    contentWrapper: {
      flex: 1,
    },
    contentInner: {
      paddingHorizontal: isTablet ? 60 : 16,
      paddingVertical: isTablet ? 24 : 16,
      rowGap: isTablet ? 20 : 16,
    },
    // Card Styles matching Transaction Detail
    sectionCard: {
      borderRadius: isTablet ? 16 : 12,
      backgroundColor: Colors[colorScheme].secondary, // Using secondary for card bg
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      // paddingVertical: isTablet ? 20 : 16, // Padding handled inside
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 20 : 16,
      paddingTop: isTablet ? 20 : 16,
      paddingBottom: isTablet ? 16 : 12,
    },
    sectionTitle: {
      fontSize: isTablet ? 22 : 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    divider: {
      height: 1,
      backgroundColor: Colors[colorScheme].border,
    },
    infoWrapper: {
      padding: isTablet ? 20 : 16,
      rowGap: isTablet ? 12 : 10,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    infoLabel: {
      fontSize: isTablet ? 20 : 14,
      color: Colors[colorScheme].icon,
    },
    infoValue: {
      fontSize: isTablet ? 20 : 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
      textAlign: 'right',
      flex: 1,
      marginLeft: 16,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: isTablet ? 14 : 12,
      fontWeight: "600",
    }
  });

export default StockHistoryDetailScreen;
