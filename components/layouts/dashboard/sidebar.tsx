import Skeleton from "@/components/atoms/skeleton";
import ProBadge from "@/components/ui/pro-badge";
import SoonBadge from "@/components/ui/soon-badge";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserPlan } from "@/hooks/use-user-plan";
import { usePermissions } from "@/hooks/usePermissions";
import { authApi, settingsApi, UserProfile } from "@/services";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { DASHBOARD_MENU_ITEMS, getDashboardRouteForKey } from "./menu-config";

const API_HOST = Constants.expoConfig?.extra?.apiUrl || process.env.API_URL || "http://192.168.1.7:3001";

const fixImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (!url.startsWith("http")) return url;
  const fixedUrl = url
    .replace(/http:\/\/localhost:\d+/, API_HOST)
    .replace(/http:\/\/127\.0\.0\.1:\d+/, API_HOST);
  return fixedUrl;
};

type SidebarItemProps = {
  label: string;
  icon: React.ComponentProps<typeof AntDesign>["name"];
  active?: boolean;
  onPress?: () => void;
  styles: ReturnType<typeof createStyles>;
  iconSize: number;
  disabled?: boolean;
  soonBadge?: boolean;
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  icon,
  active,
  onPress,
  styles,
  iconSize,
  disabled = false,
  soonBadge = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.itemContainer, active && styles.itemActive, disabled && styles.itemDisabled]}
      disabled={disabled}
    >
      <View style={styles.itemContent}>
        <View style={styles.leftContent}>
          <View style={styles.iconContainer}>
            <AntDesign
              name={icon}
              size={iconSize}
              color={
                disabled
                  ? Colors["light"].icon
                  : active
                    ? styles.itemActiveIcon.color
                    : styles.itemIcon.color
              }
            />
          </View>
          <Text style={[
            styles.itemLabel,
            active && styles.itemLabelActive,
            disabled && styles.itemLabelDisabled
          ]}>
            {label}
          </Text>
        </View>
        {(disabled && !soonBadge) && (
          <View style={styles.rightBadge}>
            <ProBadge size="small" />
          </View>
        )}
        {soonBadge && (
          <View style={styles.rightBadge}>
            <SoonBadge size="small" />
          </View>
        )}
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
  const { width, height } = useWindowDimensions();
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
  const { hasPermission } = usePermissions();
  const { isBasic, isTrial, isPro } = useUserPlan();

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  const loadUserData = async () => {
    try {
      // Load user profile
      const profileResponse = await settingsApi.getProfile();
      console.log("profileResponse", profileResponse);
      if (profileResponse.data) {
        setProfile(profileResponse.data);
      }

      // Load current branch from login data
      const branchId = await AsyncStorage.getItem("current_branch_id");
      const branchName = await AsyncStorage.getItem("current_branch_name");
      if (branchId && branchName) {
        setCurrentBranch({ id: branchId, name: branchName });
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
              setCurrentBranch({ id: branchId, name: currentBranchData.name });
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
      console.log("loading profile data")
    } catch (error: any) {
      console.error("❌ Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectItem = (key: string) => {
    onSelect?.(key);

    if (key === "outlet") {
      if (!isPro) return;
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
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarCircle}>
                  {profile?.profile_url ? (
                    <Image
                      source={{ uri: fixImageUrl(profile.profile_url) }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <AntDesign
                      name="user"
                      size={isTablet ? 32 : 28}
                      color={Colors[colorScheme].primary}
                    />
                  )}
                </View>
                <View style={[styles.badgeFree, !isBasic && styles.badgePro]}>
                  <Text style={[styles.badgeFreeText, !isBasic && styles.badgeProText]}>
                    {isBasic ? "BASIC" : isTrial ? "TRIAL" : "PRO"}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                {isLoading ? (
                  <View>
                    <Skeleton
                      width={isTablet ? 120 : 80}
                      height={isTablet ? 22 : 14}
                      style={{ marginBottom: 2 }}
                    />
                    <Skeleton
                      width={isTablet ? 60 : 40}
                      height={isTablet ? 18 : 12}
                    />
                  </View>
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

            {isPro && (
              <View style={styles.outletRow}>
                <View style={{ flex: 1 }}>
                  {isLoading ? (
                    <View>
                      <Skeleton
                        width={isTablet ? 100 : 70}
                        height={isTablet ? 18 : 14}
                        style={{ marginBottom: 2 }}
                      />
                      <Skeleton
                        width={isTablet ? 80 : 60}
                        height={isTablet ? 16 : 12}
                      />
                    </View>
                  ) : (
                    <>
                      <Text style={[
                        styles.outletName,
                      ]} numberOfLines={1}>
                        {currentBranch?.name || "Outlet"}
                      </Text>
                      <Text style={[
                        styles.outletLocation,
                      ]}>
                        {currentBranch ? "Outlet Aktif" : "Pilih Outlet"}
                      </Text>
                    </>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.outletButton,
                  ]}
                  onPress={() => {
                    const outletRoute = "/dashboard/select-branch";
                    if (pathname !== outletRoute) {
                      router.push(outletRoute as never);
                    }
                    onClose?.();
                  }}
                >
                  <Text style={[
                    styles.outletButtonText,
                  ]}>
                    Pilih Outlet
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {DASHBOARD_MENU_ITEMS.filter(item => {
              if (item.key === 'help' || item.key === 'bio-link') return true;
              if (item.key === 'outlets') return true; // Always show outlets, just disable if not Pro
              if (item.permissionKey) {
                return hasPermission(item.permissionKey);
              }
              return false;
            }).map(item => (
              <SidebarItem
                key={item.key}
                label={item.label}
                icon={item.icon}
                active={activeKey === item.key}
                onPress={() => handleSelectItem(item.key)}
                styles={styles}
                iconSize={isTablet ? 26 : 20}
                disabled={item.key === 'bio-link' ? true : item.key === 'stock-history' ? isBasic : item.key === 'outlets' ? !isPro : false}
                soonBadge={item.key === 'bio-link' ? true : false}
              />
            ))}
          </ScrollView>

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={styles.whatsappCard}
              onPress={() => Linking.openURL('https://wa.me/6281554073742')}
            >
              <View style={styles.whatsappContent}>
                <View style={styles.whatsappIconWrapper}>
                  <Ionicons name="logo-whatsapp" size={isTablet ? 24 : 20} color="#25D366" />
                </View>
                <View>
                  <Text style={styles.whatsappTitle}>Bantuan Lanjut?</Text>
                  <Text style={styles.whatsappSubtitle}>Hubungi Admin via WhatsApp</Text>
                </View>
              </View>
              <AntDesign
                name="right"
                size={isTablet ? 18 : 14}
                color={Colors[colorScheme].primary}
              />
            </TouchableOpacity>

            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>
                Bantu kami jadi lebih baik
              </Text>
              <View style={styles.feedbackRow}>
                <Text style={styles.feedbackSubtitle}>Beri masukan untuk </Text>
                <Text style={styles.feedbackLink}>MISE</Text>
                <AntDesign
                  name="right"
                  size={isTablet ? 18 : 14}
                  color={Colors[colorScheme].primary}
                />
              </View>
            </View>

            <View style={styles.versionWrapper}>
              <Text style={styles.versionBrand}>MISE</Text>
              <Text style={styles.versionText}>Versi 1.0.0</Text>
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
      justifyContent: "space-between",
    },
    leftContent: {
      flexDirection: "row",
      alignItems: "center",
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
    avatarWrapper: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    avatarCircle: {
      width: isTablet ? 72 : 56,
      height: isTablet ? 72 : 56,
      borderRadius: isTablet ? 36 : 28,
      borderWidth: 2,
      borderColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
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
    badgePro: {
      backgroundColor: "#FF6B35",
    },
    badgeProText: {
      color: "#FFFFFF",
    },
    profileName: {
      fontSize: isTablet ? 22 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    profileRole: {
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
    roleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isTablet ? 8 : 6,
      marginTop: 2,
    },
    planName: {
      fontSize: isTablet ? 16 : 11,
      color: Colors[colorScheme].primary,
      fontWeight: '600',
      backgroundColor: Colors[colorScheme].primary + '15',
      paddingHorizontal: isTablet ? 8 : 6,
      paddingVertical: 2,
      borderRadius: 8,
      overflow: 'hidden',
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
    itemDisabled: {
      opacity: 0.5,
    },
    itemLabelDisabled: {
      color: Colors[colorScheme].icon,
    },
    disabledText: {
      color: Colors[colorScheme].icon,
    },
    disabledOutletButton: {
      backgroundColor: Colors[colorScheme].secondary,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      opacity: 0.6,
    },
    disabledButtonText: {
      color: Colors[colorScheme].icon,
      opacity: 0.7,
    },
    iconContainer: {
      position: 'relative',
    },
    rightBadge: {
      alignSelf: 'center',
    },
    badgeOverlay: {
      position: 'absolute',
      top: -4,
      right: -4,
      zIndex: 1,
    },
    proBadgeAbsolute: {
      position: 'absolute',
      top: -6,
      right: -6,
      zIndex: 1,
    },
    whatsappCard: {
      borderRadius: 12,
      paddingHorizontal: isTablet ? 20 : 12,
      paddingVertical: isTablet ? 14 : 10,
      backgroundColor: Colors[colorScheme].secondary,
      marginBottom: isTablet ? 12 : 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: Colors[colorScheme].border2,
    },
    whatsappContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 16 : 12,
    },
    whatsappIconWrapper: {
      width: isTablet ? 44 : 36,
      height: isTablet ? 44 : 36,
      borderRadius: isTablet ? 22 : 18,
      backgroundColor: "#25D36615",
      alignItems: "center",
      justifyContent: "center",
    },
    whatsappTitle: {
      fontSize: isTablet ? 16 : 13,
      fontWeight: "700",
      color: Colors[colorScheme].text,
    },
    whatsappSubtitle: {
      fontSize: isTablet ? 14 : 11,
      color: Colors[colorScheme].icon,
      marginTop: 2,
    },
  });
