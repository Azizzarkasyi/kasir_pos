import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View, useWindowDimensions,
} from "react-native";

type NotificationType = "info" | "promo";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Mock data - ganti dengan API call nanti
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "info",
    title: "Stok Produk Rendah",
    message: "Stok Kopi Susu Gula Aren tinggal 5 unit. Segera lakukan restock.",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    type: "info",
    title: "Transaksi Berhasil",
    message: "Transaksi #TRX001 sebesar Rp 50.000 berhasil diproses.",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "3",
    type: "promo",
    title: "Promo Diskon 20%",
    message: "Dapatkan diskon 20% untuk semua menu minuman hari ini!",
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const NotificationScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<NotificationType>("info");
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  // Filter notifikasi berdasarkan tab aktif
  const filteredNotifications = notifications.filter(n => n.type === activeTab);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch dari API
    // const response = await notificationApi.getNotifications();
    // setNotifications(response.data);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (hours < 1) {
      return `${minutes} menit yang lalu`;
    } else if (hours < 24) {
      return `${hours} jam yang lalu`;
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.isRead && styles.notificationCardUnread,
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={item.type === "promo" ? "pricetag" : "notifications"}
          size={20}
          color={Colors[colorScheme].primary}
        />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <ThemedText style={styles.notificationMessage}>
          {item.message}
        </ThemedText>
        <ThemedText style={styles.notificationTime}>
          {formatTime(item.createdAt)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Notifikasi" showHelp={false} />

      <View style={styles.contentWrapper}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "info" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("info")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "info" && styles.tabTextActive,
              ]}
            >
              Informasi
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "promo" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("promo")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "promo" && styles.tabTextActive,
              ]}
            >
              Promo
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors[colorScheme].primary]}
              tintColor={Colors[colorScheme].primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyStateWrapper}>
          <Image
            source={require("@/assets/ilustrations/empty-notif.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <ThemedText style={styles.emptyText}>Belum Ada Notifikasi</ThemedText>
        </View>
      )}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean, isTabletLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors[colorScheme].border,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
    },
    headerSpacer: {
      width: 32,
      height: 32,
    },
    tabRow: {
      flexDirection: "row",
      paddingHorizontal: isTablet ? 24 : 16,
      paddingTop: isTablet ? 20 : 16,
      paddingBottom: isTablet ? 12 : 8,
      gap: isTablet ? 12 : 8,
    },
    tabButton: {
      flex: 0,
      minWidth: isTablet ? 130 : 110,
      paddingVertical: isTablet ? 10 : 6,
      paddingHorizontal: isTablet ? 16 : 12,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].secondary,
    },
    tabButtonActive: {
      borderColor: Colors[colorScheme].primary,
      backgroundColor: Colors[colorScheme].background,
    },
    tabText: {
      fontSize: isTablet ? 15 : 13,
      color: Colors[colorScheme].text,
    },
    tabTextActive: {
      fontSize: isTablet ? 15 : 13,
      color: Colors[colorScheme].primary,
      fontWeight: "600",
    },
    emptyStateWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: isTablet ? 32 : 24,
      marginTop: isTablet ? -20 : -40,
    },
    emptyImage: {
      width: isTablet ? "70%" : "90%",
      height: isTablet ? 480 : 400,
      borderRadius: 16,
      marginBottom: isTablet ? 20 : 16,
    },
    emptyText: {
      fontSize: isTablet ? 18 : 16,
      color: Colors[colorScheme].icon,
    },
    listContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    notificationCard: {
      flexDirection: "row",
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      gap: 12,
    },
    notificationCardUnread: {
      backgroundColor: Colors[colorScheme].secondary,
      borderColor: Colors[colorScheme].primary,
      borderWidth: 1.5,
    },
    notificationIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors[colorScheme].secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationContent: {
      flex: 1,
      gap: 4,
    },
    notificationHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    notificationTitle: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: Colors[colorScheme].primary,
    },
    notificationMessage: {
      fontSize: 13,
      color: Colors[colorScheme].icon,
      lineHeight: 18,
    },
    notificationTime: {
      fontSize: 11,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
  });

export default NotificationScreen;
