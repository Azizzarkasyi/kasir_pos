"use client";

import TransactionHistoryGroupHeader from "@/components/atoms/transaction-history-group-header";
import TransactionHistoryItem from "@/components/atoms/transaction-history-item";
import Header from "@/components/header";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { transactionApi } from "@/services/endpoints/transactions";
import { useBranchStore } from "@/stores/branch-store";
import { Transaction } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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

type TransactionHistoryGroupProps = {
  dateLabel: string;
  totalAmount: number;
  children: React.ReactNode;
  isTablet?: boolean;
};

const TransactionHistoryGroup: React.FC<TransactionHistoryGroupProps> = ({
  dateLabel,
  totalAmount,
  children,
  isTablet = false,
}) => {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View style={{marginBottom: isTablet ? 16 : 12}}>
      <TransactionHistoryGroupHeader
        dateLabel={dateLabel}
        totalAmount={totalAmount}
        isTablet={isTablet}
      />
      <View
        style={{
          marginTop: 4,
        }}
      >
        {children}
      </View>
    </View>
  );
};

type GroupedTransaction = {
  date: string;
  dateLabel: string;
  transactions: Transaction[];
  totalAmount: number;
};

export default function TransactionHistoryPage() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState("history");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [groupedTransactions, setGroupedTransactions] = useState<
    GroupedTransaction[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isFirstRender = useRef(true);

  // Get current branch from store
  const { currentBranchId } = useBranchStore();

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const formatCurrency = (value: number) => {
    if (!value) return "0";
    const intPart = Math.floor(value).toString();
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  // Group transactions by date
  const groupTransactionsByDate = useCallback((txns: Transaction[]) => {
    const grouped: {[key: string]: GroupedTransaction} = {};

    txns.forEach(txn => {
      try {
        // Validate and parse date
        const dateValue = txn.createdAt;
        if (!dateValue) {
          console.warn("Transaction missing createdAt:", txn.id);
          return;
        }

        const date = new Date(dateValue);

        // Check if date is valid
        if (isNaN(date.getTime())) {
          console.warn("Invalid date for transaction:", txn.id, dateValue);
          return;
        }

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
            transactions: [],
            totalAmount: 0,
          };
        }

        grouped[dateKey].transactions.push(txn);
        grouped[dateKey].totalAmount += txn.totalAmount;
      } catch (error) {
        console.error("Error grouping transaction:", txn.id, error);
      }
    });

    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, []);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {};

      if (searchQuery) {
        // Search by invoice number or other fields
        params.search = searchQuery;
      }

      // Filter by selected branch/outlet
      if (currentBranchId) {
        params.branch_id = currentBranchId;
      }

      const response = await transactionApi.getTransactions(params);

      if (response.data) {
        setTransactions(response.data);
        const grouped = groupTransactionsByDate(response.data);
        setGroupedTransactions(grouped);
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, groupTransactionsByDate]);

  // Initial load
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Debounced search - skip first render to avoid double fetch
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchTransactions();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: Colors[colorScheme].background},
      ]}
    >
      <Header
        showBack={false}
        showHelp={false}
        title="Riwayat Transaksi"
        withNotificationButton={false}
        left={
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.headerIconButton}
          >
            <Ionicons
              name="menu-outline"
              size={isTablet ? 28 : 24}
              color="white"
            />
          </TouchableOpacity>
        }
      />

      {/* Content */}
      <View style={styles.contentWrapper}>
        {/* Search */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchInner}>
            <Ionicons
              name="search-outline"
              size={isTablet ? 22 : 18}
              color={Colors[colorScheme].icon}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Cari No. Transaksi"
              placeholderTextColor={Colors[colorScheme].icon}
              style={[styles.searchInput, {color: Colors[colorScheme].text}]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {isLoading ? (
          <View
            style={{flex: 1, justifyContent: "center", alignItems: "center"}}
          >
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme].primary}
            />
            <Text
              style={[
                styles.footerText,
                {color: Colors[colorScheme].text, marginTop: 16},
              ]}
            >
              Memuat transaksi...
            </Text>
          </View>
        ) : groupedTransactions.length === 0 ? (
          <View
            style={{flex: 1, justifyContent: "center", alignItems: "center"}}
          >
            <Text
              style={[styles.footerText, {color: Colors[colorScheme].icon}]}
            >
              {searchQuery
                ? "Transaksi tidak ditemukan"
                : "Belum ada transaksi"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={groupedTransactions}
            renderItem={({item: group}) => (
              <TransactionHistoryGroup
                dateLabel={group.dateLabel}
                totalAmount={group.totalAmount}
              >
                {group.transactions.map(txn => {
                  let time = "-";
                  try {
                    const date = new Date(txn.createdAt);
                    if (!isNaN(date.getTime())) {
                      time = date.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    }
                  } catch (error) {
                    console.error(
                      "Error parsing time for transaction:",
                      txn.id
                    );
                  }

                  const paymentMethodStr = String(
                    txn.paymentMethod
                  ).toLowerCase();
                  const displayPaymentMethod =
                    paymentMethodStr === "cash"
                      ? "Tunai"
                      : paymentMethodStr === "card"
                      ? "Kartu"
                      : paymentMethodStr === "transfer"
                      ? "Transfer"
                      : paymentMethodStr === "debt"
                      ? "Hutang"
                      : "QRIS";

                  return (
                    <TransactionHistoryItem
                      key={txn.id}
                      code={`#${txn.invoiceNumber}`}
                      paymentMethod={displayPaymentMethod}
                      amount={txn.totalAmount}
                      time={time}
                      isTablet={isTablet}
                      onPress={() =>
                        router.push({
                          pathname: "/dashboard/transaction/show",
                          params: {id: String(txn.id)},
                        })
                      }
                    />
                  );
                })}
              </TransactionHistoryGroup>
            )}
            keyExtractor={item => item.date}
            contentContainerStyle={{paddingBottom: 100}}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors[colorScheme].primary]}
                tintColor={Colors[colorScheme].primary}
              />
            }
            ListFooterComponent={
              <View style={styles.footerSpacer}>
                <Text
                  style={[styles.footerText, {color: Colors[colorScheme].icon}]}
                >
                  Tidak ada data lagi.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <Sidebar
        activeKey={activeMenu}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onSelect={key => {
          setActiveMenu(key);
        }}
      />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerIconButton: {
      borderRadius: isTablet ? 22 : 18,
      alignItems: "center",
      justifyContent: "center",
    },
    contentWrapper: {
      flex: 1,
      paddingTop: isTablet ? 24 : 16,
    },
    searchWrapper: {
      marginBottom: isTablet ? 20 : 16,
      paddingHorizontal: isTablet ? 24 : 16,
    },
    searchInner: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: isTablet ? 16 : 12,
      backgroundColor: Colors[colorScheme].secondary,
      borderColor: Colors[colorScheme].border,
    },
    searchIcon: {
      marginRight: isTablet ? 12 : 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: isTablet ? 14 : 10,
      fontSize: isTablet ? 20 : 14,
    },
    footerSpacer: {
      paddingVertical: isTablet ? 20 : 16,
    },
    footerText: {
      fontSize: isTablet ? 20 : 13,
      textAlign: "center",
    },
  });
