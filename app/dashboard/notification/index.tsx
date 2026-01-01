import Header from "@/components/header";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { notificationApi } from "@/services";
import { Notification, NotificationCategory } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type TabType = "all" | "info" | "system";

const NotificationScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Map tab to API category filter
  const getCategoryFilter = (tab: TabType): NotificationCategory | undefined => {
    if (tab === "info") return "INFO";
    if (tab === "system") return "SYSTEM";
    // For "all" tab, no category filter
    return undefined;
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const params: any = { limit: 50 };
      const categoryFilter = getCategoryFilter(activeTab);
      if (categoryFilter) {
        params.category = categoryFilter;
      }

      const response = await notificationApi.getNotifications(params);

      let data = response.data || [];

      setNotifications(data);
      setUnreadCount(response.unread_count || 0);
    } catch (error: any) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [activeTab]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      if (response.data) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []);

  // Fetch on screen focus
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchNotifications().finally(() => setIsLoading(false));
    }, [fetchNotifications])
  );

  // Refetch when tab changes
  React.useEffect(() => {
    setIsLoading(true);
    fetchNotifications().finally(() => setIsLoading(false));
  }, [activeTab, fetchNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      // Mark as read via API
      if (!notification.is_read) {
        await notificationApi.markAsRead(notification.id);
        // Update local state
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to CTA if exists
      if (notification.cta_url) {
        // Check if it's an internal route or external URL
        if (notification.cta_url.startsWith("http")) {
          await Linking.openURL(notification.cta_url);
        } else {
          // Internal route - use router
          router.push(notification.cta_url as never);
        }
      }
    } catch (error: any) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      Alert.alert("Sukses", "Semua notifikasi telah ditandai sudah dibaca");
    } catch (error: any) {
      console.error("Failed to mark all as read:", error);
      Alert.alert("Error", "Gagal menandai semua notifikasi");
    }
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

  const getCategoryIcon = (category: NotificationCategory): string => {
    switch (category) {
      case "PROMO":
        return "pricetag";
      case "ALERT":
        return "warning";
      case "SYSTEM":
        return "cog";
      default:
        return "notifications";
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const hasCtaUrl = !!item.cta_url;

    const content = (
      <>
        <View style={styles.notificationIcon}>
          <Ionicons
            name={getCategoryIcon(item.category) as any}
            size={isTablet ? 24 : 20}
            color={Colors[colorScheme].primary}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <ThemedText style={styles.notificationTitle} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>
          <ThemedText style={styles.notificationMessage} numberOfLines={2}>
            {item.description}
          </ThemedText>
          <View style={styles.notificationFooter}>
            <ThemedText style={styles.notificationTime}>
              {formatTime(item.created_at)}
            </ThemedText>
            {hasCtaUrl && (
              <View style={styles.ctaIndicator}>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={Colors[colorScheme].primary}
                />
              </View>
            )}
          </View>
        </View>
      </>
    );

    if (hasCtaUrl) {
      return (
        <TouchableOpacity
          style={[
            styles.notificationCard,
            !item.is_read && styles.notificationCardUnread,
          ]}
          onPress={() => handleMarkAsRead(item)}
          activeOpacity={0.7}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[
          styles.notificationCard,
          !item.is_read && styles.notificationCardUnread,
        ]}
      >
        {content}
      </View>
    );
  };

  const hasUnreadNotifications = notifications.some(n => !n.is_read);

  return (
    <View style={styles.container}>
      <Header
        title="Notifikasi"
        showHelp={false}
        right={
          hasUnreadNotifications ? (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
            >
              <Ionicons
                name="checkmark-done"
                size={isTablet ? 24 : 20}
                color="white"
              />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.contentWrapper}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "all" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("all")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "all" && styles.tabTextActive,
              ]}
            >
              Semua
            </ThemedText>
          </TouchableOpacity>
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
              Info
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "system" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("system")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "system" && styles.tabTextActive,
              ]}
            >
              System
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme].primary}
          />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
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
    markAllButton: {
      padding: 8,
      borderRadius: 8,
    },
    tabRow: {
      flexDirection: "row",
      paddingHorizontal: isTablet ? 60 : 16,
      paddingTop: isTablet ? 16 : 12,
      paddingBottom: isTablet ? 10 : 6,
      gap: isTablet ? 8 : 6,
    },
    tabButton: {
      flex: 0,
      minWidth: isTablet ? 80 : 65,
      paddingVertical: isTablet ? 6 : 4,
      paddingHorizontal: isTablet ? 12 : 10,
      borderRadius: 12,
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
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].text,
    },
    tabTextActive: {
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].primary,
      fontWeight: "600",
    },
    loadingWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
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
      paddingHorizontal: isTablet ? 60 : 12,
      paddingTop: isTablet ? 20 : 12,
      paddingBottom: 100,
    },
    notificationCard: {
      flexDirection: "row",
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: isTablet ? 10 : 8,
      padding: isTablet ? 12 : 10,
      marginBottom: isTablet ? 10 : 8,
      gap: isTablet ? 10 : 8,
    },
    notificationCardUnread: {
      backgroundColor: colorScheme === "dark" ? "#1a2525" : "#f0f9f9",
      borderColor: Colors[colorScheme].primary,
      borderWidth: 1.5,
    },
    notificationIcon: {
      width: isTablet ? 36 : 30,
      height: isTablet ? 36 : 30,
      borderRadius: isTablet ? 18 : 15,
      backgroundColor: colorScheme === "dark" ? "#1f2122" : Colors[colorScheme].secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationContent: {
      flex: 1,
      gap: 2,
    },
    notificationHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    notificationTitle: {
      fontSize: isTablet ? 20 : 13,
      fontWeight: "600",
      flex: 1,
    },
    unreadDot: {
      width: isTablet ? 8 : 6,
      height: isTablet ? 8 : 6,
      borderRadius: isTablet ? 4 : 3,
      backgroundColor: Colors[colorScheme].primary,
    },
    notificationMessage: {
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].icon,
      lineHeight: isTablet ? 24 : 16,
    },
    notificationFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
    },
    notificationTime: {
      fontSize: isTablet ? 16 : 10,
      color: Colors[colorScheme].icon,
    },
    ctaIndicator: {
      flexDirection: "row",
      alignItems: "center",
    },
  });

export default NotificationScreen;
