import {
  DASHBOARD_MENU_ITEMS,
  DashboardMenuKey,
  getDashboardRouteForKey,
} from "@/components/layouts/dashboard/menu-config";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePermissions } from "@/hooks/usePermissions";
import { AntDesign } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DashboardBottomNav: React.FC = () => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isPhone = !isTablet;
  const insets = useSafeAreaInsets();
  const styles = createStyles(colorScheme, insets.bottom);
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  if (!isPhone) return null;
  if (!pathname?.startsWith("/dashboard")) return null;
  if (pathname.startsWith("/dashboard/transaction")) return null;

  const PRIMARY_MENU_KEYS: DashboardMenuKey[] = [
    "dashboard",
    "transaction",
    "history",
    "settings",
  ];

  const primaryMenus = React.useMemo(
    () =>
      DASHBOARD_MENU_ITEMS.filter(item => {
        // Only filter by primary menu keys
        // Don't check permissions for bottom nav - show all menus
        return PRIMARY_MENU_KEYS.includes(item.key);
      }),
    []
  );

  const getActiveKeyFromPath = React.useCallback((): DashboardMenuKey => {
    if (!pathname) return "dashboard";

    if (pathname.startsWith("/dashboard/transaction/history")) return "transaction";
    if (pathname.startsWith("/dashboard/transaction")) return "transaction";
    if (pathname.startsWith("/dashboard/reports")) return "reports";
    if (pathname.startsWith("/dashboard/setting")) return "settings";
    if (
      pathname.startsWith("/dashboard/select-branch") ||
      pathname.startsWith("/dashboard/outlet")
    )
      return "outlets";
    if (pathname.startsWith("/dashboard/employee")) return "employees";
    if (pathname.startsWith("/dashboard/product")) return "products";
    if (pathname.startsWith("/dashboard/category")) return "categories";
    if (pathname.startsWith("/dashboard/customer")) return "customers";
    if (pathname.startsWith("/dashboard/supplier")) return "suppliers";
    if (pathname.startsWith("/dashboard/help")) return "help";

    return "dashboard";
  }, [pathname]);

  const activeKey = getActiveKeyFromPath();

  const handlePressMenu = React.useCallback(
    (key: DashboardMenuKey) => {
      const route = getDashboardRouteForKey(key);
      if (!route) return;

      if (route === pathname) return;

      router.push(route as never);
    },
    [router, pathname]
  );

  return (
    <View style={styles.bottomNavContainer}>
      <View style={styles.bottomNavShadowStrip} />
      {primaryMenus.map(item => {
        const isActive = activeKey === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.bottomNavItem}
            activeOpacity={0.8}
            onPress={() => handlePressMenu(item.key)}
          >
            <AntDesign
              name={item.icon}
              size={22}
              color={Colors[colorScheme].icon}
            />
            <ThemedText
              style={[
                styles.bottomNavLabel,
                isActive && styles.bottomNavLabelActive,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", bottomInset: number) =>
  StyleSheet.create({
    bottomNavContainer: {
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: Platform.OS === "android" ? Math.max(bottomInset, 12) : 12,
      position: "relative",
      backgroundColor: Colors[colorScheme].secondary,
      borderTopWidth: 1,
      borderTopColor: Colors[colorScheme].border2,
      elevation: 0,
      zIndex: 10,
    },
    bottomNavShadowStrip: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: Colors[colorScheme].border2,
    },
    bottomNavItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    bottomNavLabel: {
      fontSize: 11,
      color: Colors[colorScheme].text,
    },
    bottomNavLabelActive: {
      color: Colors[colorScheme].primary,
      fontWeight: "600",
    },
  });

export default DashboardBottomNav;
