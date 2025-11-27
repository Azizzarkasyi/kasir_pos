import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type SidebarItemProps = {
  label: string;
  icon: React.ComponentProps<typeof AntDesign>["name"];
  active?: boolean;
  
  onPress?: () => void;
  styles: ReturnType<typeof createStyles>;
};

const SidebarItem: React.FC<SidebarItemProps> = ({ label, icon, active, onPress, styles }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.itemContainer, active && styles.itemActive]}>
      <View style={styles.itemContent}>
        <AntDesign
          name={icon}
          size={20}
          color={active ? styles.itemActiveIcon.color : styles.itemIcon.color}
        />
        <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

type SidebarProps = {
  activeKey?: string;
  isOpen: boolean;
  onClose?: () => void;
  onSelect?: (key: string) => void;
};

const MENU_ITEMS: { key: string; label: string; icon: React.ComponentProps<typeof AntDesign>["name"] }[] = [
  { key: "home", label: "Beranda", icon: "home" },
  { key: "products", label: "Kelola Produk", icon: "appstore" },
  { key: "transactions", label: "Transaksi", icon: "swap" },
  { key: "history", label: "Riwayat Transaksi", icon: "profile" },
  { key: "outlet", label: "Outlet", icon: "shop" },
  { key: "employees", label: "Pegawai", icon: "team" },
  { key: "settings", label: "Pengaturan", icon: "setting" },
  { key: "help", label: "Bantuan", icon: "question-circle" },
];

const Sidebar: React.FC<SidebarProps> = ({ activeKey, isOpen, onClose, onSelect }) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const pathname = usePathname();

  const getRouteForKey = (key: string): string | null => {
    switch (key) {
      case "home":
        return "/dashboard/home";
      case "products":
        return "/dashboard/product/manage";
      case "transactions":
        return "/dashboard/transaction";
      case "settings":
        return "/dashboard/setting";
      case "history":
        return "/dashboard/transaction/history";
      default:
        return null;
    }
  };

  const handleSelectItem = (key: string) => {
    onSelect?.(key);

    if (key === "outlet") {
      const outletRoute = "/dashboard/select-branch";
      if (pathname !== outletRoute) {
        router.push(outletRoute as never);
      }
      onClose?.();
      return;
    }

    const route = getRouteForKey(key);
    if (route) {
      if (pathname !== route) {
        router.push(route as never);
      }
    }

    onClose?.();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.drawer}>
        <View style={styles.container}>
          <View style={styles.topSection}>
            <TouchableOpacity
              onPress={() => {
                const profileRoute = "/dashboard/setting/profile";
                if (pathname !== profileRoute) {
                  router.push(profileRoute as never);
                }
              }}
              style={styles.profileRow}
            >
              <View style={styles.avatarCircle}>
                <AntDesign name="user" size={28} color={Colors[colorScheme].primary} />
                <View style={styles.badgeFree}>
                  <Text style={styles.badgeFreeText}>FREE</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>Basofi Rswt</Text>
                <Text style={styles.profileRole}>Pemilik</Text>
              </View>
              <AntDesign name="right" size={16} color="#B0B0B0" />
            </TouchableOpacity>

            <View style={styles.outletRow}>
              <View>
                <Text style={styles.outletName}>Basofi Rswt</Text>
                <Text style={styles.outletLocation}>Pusat</Text>
              </View>
              <TouchableOpacity
                style={styles.outletButton}
                onPress={() => {
                  const outletRoute = "/dashboard/select-branch";
                  if (pathname !== outletRoute) {
                    router.push(outletRoute as never);
                  }
                  onClose?.();
                }}
              >
                <Text style={styles.outletButtonText}>Pilih Outlet</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {MENU_ITEMS.map((item) => (
              <SidebarItem
                key={item.key}
                label={item.label}
                icon={item.icon}
                active={activeKey === item.key}
                onPress={() => handleSelectItem(item.key)}
                styles={styles}
              />
            ))}
          </ScrollView>

          <View style={styles.bottomSection}>
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>Bantu kami jadi lebih baik</Text>
              <View style={styles.feedbackRow}>
                <Text style={styles.feedbackSubtitle}>Beri masukan untuk </Text>
                <Text style={styles.feedbackLink}>Qasir</Text>
                <AntDesign name="right" size={14} color={Colors[colorScheme].primary} />
              </View>
            </View>

            <View style={styles.versionWrapper}>
              <Text style={styles.versionBrand}>Qasir</Text>
              <Text style={styles.versionText}>Versi 4.99.0-build.4</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
    </View>
  );
}

export default Sidebar;

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 30,
  },
  drawer: {
    width: 260,
    maxWidth: "80%",
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    backgroundColor: Colors[colorScheme].background,
  },
  topSection: {
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  bottomSection: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  itemContainer: {
   
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12,
  },
  itemIcon: {
    color: Colors[colorScheme].icon,
  },
  itemActiveIcon: {
    color: Colors[colorScheme].primary,
  },
  itemLabel: {
    fontSize: 14,
    color: Colors[colorScheme].text,
  },
  itemLabelActive: {
    color: Colors[colorScheme].primary,
    fontWeight: "600",
  },
  itemActive: {
    borderLeftWidth: 2,
    backgroundColor: "#d6fcd868",
    borderLeftColor: Colors[colorScheme].primary,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors[colorScheme].primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeFree: {
    position: "absolute",
    bottom: -6,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: Colors[colorScheme].primary,
  },
  badgeFreeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  profileName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  profileRole: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  outletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  outletName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  outletLocation: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  outletButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors[colorScheme].primary,
  },
  outletButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors[colorScheme].background,
  },
  feedbackCard: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F5F7FB",
    marginBottom: 8,
  },
  feedbackTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 4,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  feedbackSubtitle: {
    fontSize: 12,
    color: "#777777",
  },
  feedbackLink: {
    fontSize: 12,
    color: Colors[colorScheme].primary,
    fontWeight: "600",
  },
  versionWrapper: {
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  versionBrand: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors[colorScheme].primary,
  },
  versionText: {
    fontSize: 11,
    color: "#999999",
    marginTop: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
