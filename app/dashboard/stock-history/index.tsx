import Header from "@/components/header";
import { DashboardMenuKey } from "@/components/layouts/dashboard/menu-config";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { productApi } from "@/services/endpoints/products";
import type { ProductStockHistory } from "@/types/api";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

// --- Components ---

// 1. Group Header (Similar to TransactionHistoryGroupHeader)
const StockHistoryGroupHeader = ({
  dateLabel,
  isTablet,
}: {
  dateLabel: string;
  isTablet: boolean;
}) => {
  const colorScheme = useColorScheme() ?? "light";
  return (
    <View style={[styles.groupHeaderContainer, { backgroundColor: Colors[colorScheme].tabBackground }]}>
      <Text style={[styles.groupDateText, { color: Colors[colorScheme].text, fontSize: isTablet ? 22 : 13 }]}>
        {dateLabel}
      </Text>
    </View>
  );
};

// 2. Item (Similar to TransactionHistoryItem)
const StockHistoryItem = ({
  item,
  isTablet,
  onPress,
}: {
  item: ProductStockHistory;
  isTablet: boolean;
  onPress: () => void;
}) => {
  const colorScheme = useColorScheme() ?? "light";

  // Determine icon and color based on type
  let iconName: keyof typeof MaterialCommunityIcons.glyphMap = "package-variant";
  let iconColor = Colors[colorScheme].text;
  let amountPrefix = "";
  let amountColor = Colors[colorScheme].text;

  // type: "add_stock" | "remove_stock" | "adjust_stock" | "sale" | "conversion"
  if (item.type === "add_stock") {
    iconName = "package-up";
    iconColor = Colors[colorScheme].primary; // Green-ish
    amountPrefix = "+";
    amountColor = Colors[colorScheme].primary;
  } else if (item.type === "remove_stock" || item.type === "sale") {
    iconName = "package-down";
    iconColor = Colors[colorScheme].danger; // Red
    amountPrefix = "-";
    amountColor = Colors[colorScheme].danger;
  } else if (item.type === "adjust_stock") {
    iconName = "clipboard-edit-outline";
    iconColor = Colors[colorScheme].warning; // Orange
    amountPrefix = item.amount > 0 ? "+" : "";
    amountColor = item.amount > 0 ? Colors[colorScheme].primary : Colors[colorScheme].danger;
  } else if (item.type === "conversion") {
    iconName = "swap-horizontal";
    iconColor = "#2196F3"; // Blue for conversion
    amountPrefix = "→";
    amountColor = "#2196F3";
  }

  // Format time
  let timeStr = "-";
  try {
    const date = new Date(item.created_at);
    timeStr = date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  } catch (e) { }

  return (
    <TouchableOpacity
      style={[styles.itemContainer, {
        backgroundColor: Colors[colorScheme].secondary,
        borderColor: Colors[colorScheme].tabBackground,
      }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconWrapper, { borderColor: Colors[colorScheme].border, backgroundColor: Colors[colorScheme].background }]}>
          <MaterialCommunityIcons name={iconName} size={isTablet ? 26 : 20} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.productName, { color: Colors[colorScheme].text, fontSize: isTablet ? 22 : 14 }]} numberOfLines={1}>
            {item.product.name}
          </Text>
          <Text style={[styles.variantName, { color: Colors[colorScheme].icon, fontSize: isTablet ? 18 : 12 }]} numberOfLines={1}>
            {item.variant.name}
          </Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <Text style={[styles.amountText, { color: amountColor, fontSize: isTablet ? 22 : 14 }]}>
          {item.type === "conversion"
            ? `${item.prev_stock} → ${item.curr_stock}`
            : `${amountPrefix}${Math.abs(item.amount)}`}
        </Text>
        <Text style={[styles.timeText, { color: Colors[colorScheme].icon, fontSize: isTablet ? 18 : 12 }]}>
          {timeStr}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={isTablet ? 24 : 18}
        color={Colors[colorScheme].icon}
      />
    </TouchableOpacity>
  );
};

// --- Main Screen ---

type GroupedStockHistory = {
  date: string;
  dateLabel: string;
  items: ProductStockHistory[];
};

const StockHistoryScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isPhone = !isTablet;
  const isLandscape = width > height;

  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [groupedHistory, setGroupedHistory] = React.useState<GroupedStockHistory[]>([]);
  const [activeMenu, setActiveMenu] = React.useState<DashboardMenuKey>("dashboard");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const router = useRouter();

  const openDrawer = React.useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = React.useCallback(() => setIsDrawerOpen(false), []);

  const groupHistoryByDate = (history: ProductStockHistory[]) => {
    const grouped: { [key: string]: GroupedStockHistory } = {};

    history.forEach((item) => {
      try {
        const date = new Date(item.created_at);
        if (isNaN(date.getTime())) return;

        const dateKey = date.toISOString().split("T")[0];
        if (!grouped[dateKey]) {
          const dateLabel = date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          grouped[dateKey] = {
            date: dateKey,
            dateLabel,
            items: [],
          };
        }
        grouped[dateKey].items.push(item);
      } catch (e) {
        console.error("Error grouping stock history:", e);
      }
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const fetchStockHistory = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await productApi.getStockHistory();
      const allHistory = (response.data as any || []).filter((item: ProductStockHistory) => item.type !== 'sale');

      // Filter by search query if needed
      const filtered = searchQuery
        ? allHistory.filter((item: ProductStockHistory) =>
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.variant.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allHistory;

      setGroupedHistory(groupHistoryByDate(filtered));
    } catch (error) {
      console.error("Error fetching stock history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  React.useEffect(() => {
    fetchStockHistory();
  }, [fetchStockHistory]);

  useFocusEffect(
    React.useCallback(() => {
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
        fromUnitId: item.from_unit_id || "",
        toUnitId: item.to_unit_id || "",
        createdAt: item.created_at,
        updatedAt: item.created_at,
      },
    } as never);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="archive-outline"
        size={isTablet ? 80 : 60}
        color={Colors[colorScheme].icon}
      />
      <Text style={[styles.emptyStateTitle, { color: Colors[colorScheme].text, fontSize: isTablet ? 24 : 20 }]}>
        Belum Ada Riwayat
      </Text>
      <Text style={[styles.emptyStateMessage, { color: Colors[colorScheme].icon, fontSize: isTablet ? 16 : 14 }]}>
        {searchQuery ? "Tidak ditemukan riwayat yang cocok" : "Riwayat perputaran stok akan muncul di sini"}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Header
        showBack={true}

        showHelp={false}
        title="Riwayat Stok"
        // left={
        //   !isPhone ? (
        //     <TouchableOpacity onPress={openDrawer} style={styles.headerIconButton}>
        //       <Ionicons name="menu-outline" size={isTablet ? 36 : 24} color="white" />
        //     </TouchableOpacity>
        //   ) : undefined
        // }
        onBackPress={() => router.back()}
      />

      <View style={[styles.contentWrapper, { paddingTop: isTablet ? 24 : 16 }]}>
        {/* Search Bar - Matching Transaction History Style */}
        <View style={[styles.searchWrapper, { paddingHorizontal: isTablet ? 60 : 16 }]}>
          <View style={[styles.searchInner, {
            backgroundColor: Colors[colorScheme].secondary,
            borderColor: Colors[colorScheme].border
          }]}>
            <Ionicons
              name="search-outline"
              size={isTablet ? 22 : 18}
              color={Colors[colorScheme].icon}
              style={{ marginRight: isTablet ? 12 : 8 }}
            />
            <TextInput
              placeholder="Cari Produk atau Varian"
              placeholderTextColor={Colors[colorScheme].icon}
              style={[styles.searchInput, { color: Colors[colorScheme].text, fontSize: isTablet ? 20 : 14 }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
            <Text style={{ marginTop: 16, color: Colors[colorScheme].text }}>Memuat data...</Text>
          </View>
        ) : (
          <FlatList
            data={groupedHistory}
            keyExtractor={(item) => item.date}
            renderItem={({ item: group }) => (
              <View style={{ marginBottom: isTablet ? 16 : 12 }}>
                {/* Group Header */}
                <StockHistoryGroupHeader dateLabel={group.dateLabel} isTablet={isTablet} />

                {/* Items in Group */}
                <View style={{ marginTop: 4 }}>
                  {group.items.map((historyItem) => (
                    <StockHistoryItem
                      key={historyItem.id}
                      item={historyItem}
                      isTablet={isTablet}
                      onPress={() => handleCardPress(historyItem)}
                    />
                  ))}
                </View>
              </View>
            )}
            contentContainerStyle={[styles.listContainer, { paddingHorizontal: isTablet ? 60 : 16 }]}
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
        )}
      </View>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
  headerIconButton: {
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    marginBottom: 16,
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
  },
  listContainer: {
    paddingBottom: 40,
  },
  // Group Header Styles
  groupHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  groupDateText: {
    fontWeight: "500",
  },
  // Item Styles
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderRadius: 8,
    columnGap: 12,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  productName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  variantName: {
  },
  itemRight: {
    alignItems: "flex-end",
    marginRight: 4,
  },
  amountText: {
    fontWeight: "600",
    marginBottom: 2,
  },
  timeText: {
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateMessage: {
    textAlign: "center",
  },
});

export default StockHistoryScreen;
