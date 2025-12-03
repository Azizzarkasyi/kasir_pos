import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  Image, 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const styles = createStyles(colorScheme);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<NotificationType>("info");
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  // Filter notifikasi berdasarkan tab aktif
  const filteredNotifications = notifications.filter((n) => n.type === activeTab);

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
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
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
        <ThemedText style={styles.notificationMessage}>{item.message}</ThemedText>
        <ThemedText style={styles.notificationTime}>{formatTime(item.createdAt)}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Notifikasi" showHelp={false} />

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

      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
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
            resizeMode="cover"
          />
          <ThemedText style={styles.emptyText}>Belum Ada Notifikasi</ThemedText>
        </View>
      )}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
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
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 8,
    },
    tabButton: {
      flex: 0,
      minWidth: 110,
      paddingVertical: 6,
      paddingHorizontal: 12,
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
      fontSize: 13,
      color: Colors[colorScheme].text,
    },
    tabTextActive: {
      fontSize: 13,
      color: Colors[colorScheme].primary,
      fontWeight: "600",
    },
    emptyStateWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      marginTop: -40,
    },
    emptyImage: {
      width: "90%",
      height: 220,
      borderRadius: 16,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
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
