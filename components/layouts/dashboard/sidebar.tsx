import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authApi, settingsApi, UserProfile } from "@/services";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { DASHBOARD_MENU_ITEMS, getDashboardRouteForKey } from "./menu-config";

type SidebarItemProps = {
  label: string;
  icon: React.ComponentProps<typeof AntDesign>["name"];
  active?: boolean;

  onPress?: () => void;
  styles: ReturnType<typeof createStyles>;
  iconSize: number;
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  active,
  onPress,
  styles,
  iconSize,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.itemContainer, active && styles.itemActive]}
    >
      <View style={styles.itemContent}>
        <AntDesign
          name={icon}
          size={iconSize}
          color={active ? styles.itemActiveIcon.color : styles.itemIcon.color}
        />
        <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
          {label}
        </Text>
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

const Sidebar: React.FC<SidebarProps> = ({
  activeKey,
  isOpen,
  onClose,
  onSelect,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentBranch, setCurrentBranch] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const profileResponse = await settingsApi.getProfile();
      if (profileResponse.data) {
        setProfile(profileResponse.data);
      }

      // Load current branch from login data
      const branchId = await AsyncStorage.getItem("current_branch_id");
      const branchName = await AsyncStorage.getItem("current_branch_name");
      if (branchId && branchName) {
        setCurrentBranch({id: branchId, name: branchName});
      }

      // Get branches to get current branch name if not in storage
      if (branchId && !branchName) {
        try {
          const branchesResponse = await authApi.getUserBranches?.();
          if (branchesResponse?.data) {
            const branches = branchesResponse.data as any[];
            const currentBranchData = branches.find(
              (b: any) => b.id === branchId
            );
            if (currentBranchData) {
              setCurrentBranch({id: branchId, name: currentBranchData.name});
              await AsyncStorage.setItem(
                "current_branch_name",
                currentBranchData.name
              );
            }
          }
        } catch (error) {
          console.error("❌ Failed to load branches:", error);
        }
      }
    } catch (error: any) {
      console.error("❌ Failed to load user data:", error);
    } finally {
      setIsLoading(false);
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

    const route = getDashboardRouteForKey(key as any);
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
                onClose?.();
              }}
              style={styles.profileRow}
            >
              <View style={styles.avatarCircle}>
                {profile?.photo ? (
                  <Text>Photo</Text>
                ) : (
                  <AntDesign
                    name="user"
                    size={isTablet ? 32 : 28}
                    color={Colors[colorScheme].primary}
                  />
                )}
                <View style={styles.badgeFree}>
                  <Text style={styles.badgeFreeText}>FREE</Text>
                </View>
              </View>
              <View style={{flex: 1}}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors[colorScheme].primary}
                  />
                ) : (
                  <>
                    <Text style={styles.profileName} numberOfLines={1}>
                      {profile?.name || "User"}
                    </Text>
                    <Text style={styles.profileRole}>
                      {profile?.role === "user"
                        ? "Pemilik"
                        : profile?.role || "User"}
                    </Text>
                  </>
                )}
              </View>
              <AntDesign
                name="right"
                size={isTablet ? 20 : 16}
                color={Colors[colorScheme].icon}
              />
            </TouchableOpacity>

            <View style={styles.outletRow}>
              <View style={{flex: 1}}>
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors[colorScheme].primary}
                  />
                ) : (
                  <>
                    <Text style={styles.outletName} numberOfLines={1}>
                      {currentBranch?.name || "Outlet"}
                    </Text>
                    <Text style={styles.outletLocation}>
                      {currentBranch ? "Outlet Aktif" : "Pilih Outlet"}
                    </Text>
                  </>
                )}
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
            {DASHBOARD_MENU_ITEMS.filter(item => item.key !== "profile").map(item => (
              <SidebarItem
                key={item.key}
                label={item.label}
                icon={item.icon}
                active={activeKey === item.key}
                onPress={() => handleSelectItem(item.key)}
                styles={styles}
                iconSize={isTablet ? 26 : 20}
              />
            ))}
          </ScrollView>

          <View style={styles.bottomSection}>
            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>
                Bantu kami jadi lebih baik
              </Text>
              <View style={styles.feedbackRow}>
                <Text style={styles.feedbackSubtitle}>Beri masukan untuk </Text>
                <Text style={styles.feedbackLink}>ELBIC</Text>
                <AntDesign
                  name="right"
                  size={isTablet ? 18 : 14}
                  color={Colors[colorScheme].primary}
                />
              </View>
            </View>

            <View style={styles.versionWrapper}>
              <Text style={styles.versionBrand}>ELBIC</Text>
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
};

export default Sidebar;

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      backgroundColor:
        colorScheme === "dark" ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.3)",
      zIndex: 30,
    },
    drawer: {
      width: isTablet ? 360 : 260,
      maxWidth: isTablet ? "55%" : "80%",
      backgroundColor: Colors[colorScheme].secondary,
    },
    container: {
      flex: 1,
      paddingTop: isTablet ? 64 : 40,
      paddingHorizontal: isTablet ? 28 : 16,
      backgroundColor: Colors[colorScheme].background,
    },
    topSection: {
      paddingBottom: isTablet ? 24 : 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors[colorScheme].border2,
    },
    scrollContent: {
      paddingVertical: isTablet ? 24 : 16,
      paddingBottom: isTablet ? 36 : 24,
    },
    bottomSection: {
      paddingTop: isTablet ? 20 : 12,
      paddingBottom: isTablet ? 24 : 16,
    },
    itemContainer: {},
    itemContent: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: isTablet ? 14 : 10,
      paddingHorizontal: isTablet ? 16 : 8,
      gap: isTablet ? 18 : 12,
    },
    itemIcon: {
      color: Colors[colorScheme].icon,
    },
    itemActiveIcon: {
      color: Colors[colorScheme].background,
    },
    itemLabel: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].text,
    },
    itemLabelActive: {
      color: Colors[colorScheme].background,
      fontWeight: "600",
    },
    itemActive: {
      borderLeftWidth: 2,
      backgroundColor: Colors[colorScheme].primary,
      borderLeftColor: Colors[colorScheme].primary,
    },
    profileRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isTablet ? 20 : 12,
      gap: isTablet ? 20 : 12,
    },
    avatarCircle: {
      width: isTablet ? 72 : 56,
      height: isTablet ? 72 : 56,
      borderRadius: isTablet ? 36 : 28,
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
      fontSize: isTablet ? 14 : 10,
      color: "#FFFFFF",
      fontWeight: "700",
    },
    profileName: {
      fontSize: isTablet ? 22 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    profileRole: {
      fontSize: isTablet? 18: 12,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
    outletRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: isTablet ? 20 : 12,
    },
    outletName: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    outletLocation: {
      fontSize: isTablet ? 16 : 12,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
    outletButton: {
      paddingHorizontal: isTablet ? 20 : 12,
      paddingVertical: isTablet ? 10 : 6,
      borderRadius: 16,

      backgroundColor: Colors[colorScheme].primary,
    },
    outletButtonText: {
      fontSize: isTablet ? 18 : 12,
      fontWeight: "600",
      color: Colors[colorScheme].background,
    },
    feedbackCard: {
      borderRadius: 12,
      paddingHorizontal: isTablet ? 20 : 12,
      paddingVertical: isTablet ? 14 : 10,
      backgroundColor: Colors[colorScheme].secondary,
      marginBottom: isTablet ? 16 : 8,
    },
    feedbackTitle: {
      fontSize: isTablet ? 18 : 12,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    feedbackRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    feedbackSubtitle: {
      fontSize: isTablet ? 16 : 12,
      color: Colors[colorScheme].icon,
    },
    feedbackLink: {
      fontSize: isTablet ? 16 : 12,
      color: Colors[colorScheme].primary,
      fontWeight: "600",
    },
    versionWrapper: {
      paddingHorizontal: isTablet ? 12 : 4,
      paddingTop: isTablet ? 8 : 4,
    },
    versionBrand: {
      fontSize: isTablet ? 22 : 16,
      fontWeight: "700",
      color: Colors[colorScheme].primary,
    },
    versionText: {
      fontSize: isTablet ? 15 : 11,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
    backdrop: {
      flex: 1,
      backgroundColor: "transparent",
    },
  });
