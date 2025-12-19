import StockHistoryDetail from "@/components/atoms/stock-history-detail";
import Header from "@/components/header";
import { DashboardMenuKey } from "@/components/layouts/dashboard/menu-config";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";

const StockHistoryDetailScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isPhone = !isTablet;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const [activeMenu, setActiveMenu] = React.useState<DashboardMenuKey>("dashboard");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse parameters from navigation
  const stockHistoryData = {
    productName: params.productName as string || "Produk Tidak Diketahui",
    variantName: params.variantName as string || "Varian",
    actionType: (params.actionType as "add_stock" | "remove_stock" | "adjust_stock" | "sale") || "add_stock",
    amount: parseInt(params.amount as string) || 0,
    prevStock: parseInt(params.prevStock as string) || 0,
    currStock: parseInt(params.currStock as string) || 0,
    note: params.note as string,
    createdAt: params.createdAt as string || "",
    updatedAt: params.updatedAt as string,
  };

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showHelp={false}
        title="Detail Perputaran Stock"
        left={
          !isPhone ? (
            <TouchableOpacity
              onPress={openDrawer}
              style={styles.headerIconButton}
            >
              <Ionicons
                name="menu-outline"
                size={isTablet ? 36 : 24}
                color="white"
              />
            </TouchableOpacity>
          ) : undefined
        }
        onBackPress={handleBack}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <StockHistoryDetail {...stockHistoryData} />
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

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      paddingBottom: isTabletLandscape ? 80 : 20,
    },
    headerIconButton: {
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
  });

export default StockHistoryDetailScreen;
