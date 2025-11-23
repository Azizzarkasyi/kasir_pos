import { ReportCard, ReportCardSkeleton } from "@/components/atoms/report-card";
import Header from "@/components/header";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

const DashboardScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState("home");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
      setRefreshing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Header
        showBack={false}
        showHelp={false}
        title="Beranda"
        left={
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.headerIconButton}
          >
            <Ionicons
              name="menu-outline"
              size={24}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        }
        right={
          <TouchableOpacity
            onPress={() => router.push("/dashboard/notification" as never)}
            style={styles.headerIconButton}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].primary}
            colors={[Colors[colorScheme].primary]}
          />
        }
      >
        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Paket Berlangganan</ThemedText>
          <Image
            source={require("@/assets/banners/subscription.jpg")}
            style={styles.bannerImage}
          />
        </View>
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle-2">Laporan</ThemedText>
            <View style={styles.linkContainer}>
              <ThemedText style={styles.link}>Lihat Semua</ThemedText>
              <Ionicons
                name="chevron-forward-outline"
                size={18}
                color={Colors[colorScheme].icon}
              />
            </View>
          </View>
          <ScrollView
            horizontal
            contentContainerStyle={styles.reportCardContainer}
            showsHorizontalScrollIndicator={false}
          >
            {isLoading ? (
              <>
                <ReportCardSkeleton />
                <ReportCardSkeleton />
                <ReportCardSkeleton />
              </>
            ) : (
              <>
                <ReportCard
                  title="Penjualan Nov 2025"
                  amount="Rp0"
                  subtitle="0,00% vs bulan lalu"
                />
                <ReportCard
                  title="Penjualan hari ini"
                  amount="Rp0"
                  subtitle="0,00% vs kemarin"
                />
                <ReportCard
                  title="Pengeluaran hari ini"
                  amount="Rp0"
                  subtitle="0,00% vs kemarin"
                />
              </>
            )}
          </ScrollView>
        </View>
        <View style={styles.quickActionRow}>
          <MenuItem label="Kelola Produk" icon="bag-outline" />
          <MenuItem label="Pegawai" icon="id-card-outline" />
          <MenuItem label="Outlet" icon="storefront-outline" />
          <MenuItem label="Bantuan" icon="help-circle-outline" />
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Perangkat Tambahan</ThemedText>
          <Image
            source={require("@/assets/banners/device-offer.jpg")}
            style={styles.bannerImage}
          />
        </View>
      </ScrollView>

      <View style={styles.bottomButtonWrapper}>
        <ThemedButton title="Transaksi" onPress={() => {
          router.push("/dashboard/transaction" as never);
        }} />
      </View>

      <Sidebar
        activeKey={activeMenu}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onSelect={key => setActiveMenu(key)}
      />
    </View>
  );
};

const MenuItem = ({label, icon}: {label: string; icon: any}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = menuItemStyles(colorScheme);

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.wrapper}>
      <View style={styles.iconWrapper}>
        <Ionicons
          name={icon}
          size={icon == "help-circle-outline" ? 28 : 24}
          color={Colors[colorScheme].primary}
        />
      </View>
      <ThemedText style={styles.label} numberOfLines={2}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingHorizontal: 8,
      paddingBottom: 96,
    },
    headerIconButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginBottom: 8,
      fontSize: 18,
      fontWeight: "bold",
    },
    amountText: {
      fontSize: 14,
      fontWeight: "bold",
    },

    skeletonSubtitle: {
      width: 110,
      height: 12,
      borderRadius: 6,
      backgroundColor: Colors[colorScheme].icon,
      opacity: 0.16,
    },
    reportCardContainer: {
      gap: 12,
      flexDirection: "row",
    },
    reportCardTitle: {
      fontSize: 12,
      fontWeight: "regular",
    },
    menuRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      flexWrap: "wrap",
      marginBottom: 16,
    },
    sectionCard: {
      backgroundColor: Colors[colorScheme].secondary,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    bannerImage: {
      width: "100%",
      borderRadius: 12,
      marginTop: 8,
      height: 120,
      resizeMode: "cover",
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    linkContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    link: {
      color: Colors[colorScheme].primary,
      fontSize: 14,
    },
    quickActionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      justifyContent: "space-around",
    },
    reportCard: {
      width: "38%", // kira-kira 2 item per layar
      minHeight: 90,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 10,
      borderColor: "#E5E5E5",
      borderWidth: 1,
      padding: 10,
    },
    mutedText: {
      color: Colors[colorScheme].icon,
      marginTop: 4,
      fontSize: 12,
    },
    subscriptionBanner: {
      marginTop: 8,
      padding: 12,
      borderRadius: 10,
      backgroundColor: Colors[colorScheme].tint,
    },
    deviceBanner: {
      marginTop: 8,
      padding: 12,
      borderRadius: 10,
      backgroundColor: Colors[colorScheme].secondary,
    },
    bottomButtonWrapper: {
      position: "absolute",
      left: 16,
      right: 16,
      bottom: 16,
    },
    drawerOverlay: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
      backgroundColor: "rgba(0,0,0,0.3)",
      zIndex: 3,
    },
    drawerBackdrop: {
      flex: 1,
    },
    drawer: {
      width: 260,
      backgroundColor: "#FFFFFF",
    },
  });

const menuItemStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    wrapper: {
      alignItems: "center",
      marginBottom: 12,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    iconWrapper: {
      borderRadius: 20,
      backgroundColor: Colors[colorScheme].secondary,
      marginBottom: 4,
      padding: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: "semibold",
      textAlign: "center",
      color: Colors[colorScheme].text,
    },
  });

export default DashboardScreen;
