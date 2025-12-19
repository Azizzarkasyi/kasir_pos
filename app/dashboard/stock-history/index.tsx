import StockHistoryCard from "@/components/atoms/stock-history-card";
import Header from "@/components/header";
import { DashboardMenuKey } from "@/components/layouts/dashboard/menu-config";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { productApi } from "@/services/endpoints/products";
import type { ProductStockHistory } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

const StockHistoryScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isPhone = !isTablet;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [stockHistory, setStockHistory] = React.useState<ProductStockHistory[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [activeMenu, setActiveMenu] = React.useState<DashboardMenuKey>("dashboard");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const router = useRouter();

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const fetchStockHistory = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await productApi.getStockHistory();
      setStockHistory((response.data as any || []).filter((item: ProductStockHistory) => item.type !== 'sale'));
    } catch (error) {
      console.error("Error fetching stock history:", error);
      setErrorMessage("Gagal memuat riwayat stok. Coba tarik untuk refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchStockHistory();
  }, [fetchStockHistory]);

  useFocusEffect(
    React.useCallback(() => {
      console.log("Stock history screen focused, refreshing data...");
      fetchStockHistory();
    }, [fetchStockHistory])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchStockHistory();
    setRefreshing(false);
  }, [fetchStockHistory]);

  const handleCardPress = (item: ProductStockHistory) => {
    router.push({
      pathname: "/dashboard/stock-history/detail",
      params: {
        id: item.id,
        productName: item.product.name,
        variantName: item.variant.name,
        actionType: item.action_type,
        amount: item.amount.toString(),
        prevStock: item.prev_stock.toString(),
        currStock: item.curr_stock.toString(),
        note: item.note || "",
        createdAt: item.created_at,
        updatedAt: item.created_at,
      },
    } as never);
  };

  const renderStockHistoryItem = ({ item }: { item: ProductStockHistory }) => (
    <StockHistoryCard
      productName={item.product.name}
      variantName={item.variant.name}
      actionType={item.type}
      amount={item.amount}
      prevStock={item.prev_stock}
      currStock={item.curr_stock}
      note={item.note || undefined}
      createdAt={item.created_at}
      onPress={() => handleCardPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="archive-outline"
        size={isTablet ? 80 : 60}
        color={Colors[colorScheme].icon}
      />
      <ThemedText style={styles.emptyStateTitle}>Belum Ada Riwayat</ThemedText>
      <ThemedText style={styles.emptyStateMessage}>
        Riwayat perputaran stok akan muncul di sini
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header
          showBack={true}
          showHelp={false}
          title="Perputaran Stock"
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
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ThemedText>Memuat data...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showHelp={false}
        title="Perputaran Stock"
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
        onBackPress={() => router.back()}
      />
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={Colors[colorScheme].danger} />
          <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
        </View>
      )}
      <FlatList
        data={stockHistory}
        renderItem={renderStockHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors[colorScheme].primary}
            colors={[Colors[colorScheme].primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: isTablet ? 16 : 12,
      marginHorizontal: isTablet ? 24 : 16,
      marginTop: isTablet ? 16 : 12,
      backgroundColor: colorScheme === "dark" ? "#3a1010" : Colors[colorScheme].danger + "20",
      borderRadius: 10,
      gap: 8,
    },
    errorText: {
      fontSize: isTablet ? 14 : 12,
      color: Colors[colorScheme].danger,
    },
    listContainer: {
      paddingHorizontal: isTablet ? 24 : 8,
      paddingVertical: isTablet ? 16 : 12,
    },
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: isTablet ? 40 : 20,
      paddingVertical: isTablet ? 80 : 60,
    },
    emptyStateTitle: {
      fontSize: isTablet ? 24 : 20,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginTop: isTablet ? 24 : 20,
      marginBottom: isTablet ? 12 : 8,
    },
    emptyStateMessage: {
      fontSize: isTablet ? 16 : 14,
      color: Colors[colorScheme].icon,
      textAlign: "center",
      lineHeight: isTablet ? 24 : 20,
    },
  });

export default StockHistoryScreen;
