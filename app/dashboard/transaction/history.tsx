"use client";

import TransactionHistoryGroupHeader from "@/components/atoms/transaction-history-group-header";
import TransactionHistoryItem from "@/components/atoms/transaction-history-item";
import Header from "@/components/header";
import Sidebar from "@/components/layouts/dashboard/sidebar";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type TransactionHistoryGroupProps = {
  dateLabel: string;
  totalAmount: number;
  children: React.ReactNode;
};

const TransactionHistoryGroup: React.FC<TransactionHistoryGroupProps> = ({
  dateLabel,
  totalAmount,
  children,
}) => {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <View style={{ marginBottom: 12 }}>
      <TransactionHistoryGroupHeader
        dateLabel={dateLabel}
        totalAmount={totalAmount}
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

export default function TransactionHistoryPage() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();

  const [activeMenu, setActiveMenu] = React.useState("history");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const openDrawer = React.useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = React.useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const formatCurrency = (value: number) => {
    if (!value) return "0";
    const intPart = Math.floor(value).toString();
    const withDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return withDots;
  };

  const totalHariIni = 20000;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
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
              size={24}
              color={Colors[colorScheme].icon}
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
              size={18}
              color={Colors[colorScheme].icon}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Cari No. Transaksi"
              placeholderTextColor={Colors[colorScheme].icon}
              style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            />
          </View>
        </View>

        <TransactionHistoryGroup
          dateLabel="Kamis, 20 Nov 2025"
          totalAmount={totalHariIni}
        >
          <TransactionHistoryItem
            code="#3240736L"
            paymentMethod="Tunai"
            amount={20000}
            time="07:24"

          />
          <TransactionHistoryItem
            code="#3240736L"
            paymentMethod="Tunai"
            amount={20000}
            time="07:24"

          />
          <TransactionHistoryItem
            code="#3240736L"
            paymentMethod="Tunai"
            amount={20000}
            time="07:24"
          />
        </TransactionHistoryGroup>

        {/* Footer text */}
        <View style={styles.footerSpacer} />
        <Text
          style={[styles.footerText, { color: Colors[colorScheme].icon }]}
        >
          Tidak ada data lagi.
        </Text>
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

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerIconButton: {
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    contentWrapper: {
      flex: 1,

      paddingTop: 16,
    },
    searchWrapper: {
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    searchInner: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 12,
      backgroundColor: Colors[colorScheme].secondary,
      borderColor: Colors[colorScheme].border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
    },
    footerSpacer: {
      paddingVertical: 16,
    },
    footerText: {
      fontSize: 13,
      textAlign: "center",
    },
  });

