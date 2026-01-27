import ConfirmPopup from "@/components/atoms/confirm-popup";
import HelpPopup from "@/components/atoms/help-popup";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import ProBadge from "@/components/ui/pro-badge";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserPlan } from "@/hooks/use-user-plan";
import { settingsApi, StruckConfig } from "@/services";
import assetApi, { prepareFileFromUri } from "@/services/endpoints/assets";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function ReceiptSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const navigation = useNavigation();
  const router = useRouter();
  const { isBasic } = useUserPlan();
  const [struckConfig, setStruckConfig] = useState<StruckConfig | null>(null);
  const [logoUri, setLogoUri] = useState<string | undefined>(undefined);
  const [extraNotes, setExtraNotes] = useState("");
  const [message, setMessage] = useState("");
  const [showHelpExtra, setShowHelpExtra] = useState(false);
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [branchId, setBranchId] = useState<string>("");

  const [initialData, setInitialData] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);

  useEffect(() => {
    loadBranchAndConfig();
  }, []);

  const loadBranchAndConfig = async () => {
    try {
      // Get current branch ID from storage or login data
      const branchIdFromStorage = await AsyncStorage.getItem(
        "current_branch_id"
      );
      console.log("branchIdFromStorage", branchIdFromStorage);
      if (branchIdFromStorage) {
        setBranchId(branchIdFromStorage);
        await loadStruckConfig(branchIdFromStorage);
      } else {
        // TODO: Jika tidak ada branch, tampilkan error atau redirect
        Alert.alert(
          "Error",
          "Branch tidak ditemukan. Silakan pilih branch terlebih dahulu."
        );
      }
    } catch (error) {
      console.error("❌ Failed to load branch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStruckConfig = async (branchId: string) => {
    try {
      const response = await settingsApi.getStruckConfig(branchId);
      if (response.data) {
        setStruckConfig(response.data);
        setLogoUri(response.data.logo_url);
        setExtraNotes(response.data.header_description || "");
        setMessage(response.data.footer_description || "");

        setInitialData({
          logoUri: response.data.logo_url,
          extraNotes: response.data.header_description || "",
          message: response.data.footer_description || "",
        });
      }
    } catch (error: any) {
      console.error("❌ Failed to load struck config:", error);
      if (error.code !== 404) {
        Alert.alert("Error", "Gagal memuat konfigurasi struk");
      }
    }
  };

  const handleSave = async () => {
    if (!branchId) {
      Alert.alert("Error", "Branch tidak ditemukan");
      return;
    }

    setIsSaving(true);
    try {
      // Upload logo first if selected and it's a local file
      let uploadedLogoUrl: string | undefined;
      if (logoUri && !logoUri.startsWith("http")) {
        console.log("📤 Uploading receipt logo...");
        try {
          const file = prepareFileFromUri(logoUri);
          const uploadResponse = await assetApi.uploadImage(file);
          if (uploadResponse.data?.url) {
            uploadedLogoUrl = uploadResponse.data.url;
            console.log("✅ Receipt logo uploaded:", uploadedLogoUrl);
          }
        } catch (uploadError: any) {
          console.error("❌ Logo upload failed:", uploadError);
          Alert.alert(
            "Peringatan",
            "Gagal upload logo. Lanjutkan tanpa mengubah logo?",
            [
              {
                text: "Batal",
                style: "cancel",
                onPress: () => setIsSaving(false),
              },
              { text: "Lanjutkan", onPress: () => { } },
            ]
          );
          return;
        }
      }

      await settingsApi.updateStruckConfig(branchId, {
        logo_url:
          uploadedLogoUrl ||
          (logoUri?.startsWith("http") ? logoUri : undefined),
        header_description: extraNotes.trim(),
        footer_description: message.trim(),
      });
      setShowSuccessPopup(true);
      setHasUnsavedChanges(false);
      loadStruckConfig(branchId);
    } catch (error: any) {
      console.error("❌ Failed to save struck config:", error);
      Alert.alert(
        "Gagal",
        error.message || "Gagal menyimpan konfigurasi struk"
      );
    } finally {
      setIsSaving(false);
    }
  };



  // Check for unsaved changes
  useEffect(() => {
    if (!initialData) return;

    const currentData = {
      logoUri,
      extraNotes,
      message,
    };

    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(initialData);
    setHasUnsavedChanges(hasChanges);
  }, [logoUri, extraNotes, message, initialData]);

  // Handle system back button
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges) {
        return;
      }

      e.preventDefault();
      setPendingAction(e.data.action);
      setShowExitConfirm(true);
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      router.back();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    if (pendingAction) {
      navigation.dispatch(pendingAction);
    } else {
      router.back();
    }
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={{ paddingHorizontal: 8 }}>
          <ThemedText style={{ color: Colors[colorScheme].primary }}>
            Lihat Struk
          </ThemedText>
        </TouchableOpacity>
      ),
      title: "Atur Struk",
    });
  }, [navigation, colorScheme]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Atur Struk" showHelp={false} onBackPress={handleBackPress} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.sectionCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: isTablet ? 16 : 12 }}>
              <ThemedText type="subtitle-2">Logo</ThemedText>
              {isBasic && <ProBadge size="small" />}
            </View>
            <View pointerEvents={isBasic ? "none" : "auto"} style={[isBasic && styles.disabledSection]}>
              <ImageUpload
                uri={logoUri}
                initials="LG"
                onImageSelected={uri => !isBasic && setLogoUri(uri)}
                disabled={isBasic}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.contentWrapper}>
          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2">Pengaturan Dasar</ThemedText>
            <ThemedInput
              label="Keterangan Tambahan (Opsional)"
              value={extraNotes}
              size="md"
              onChangeText={setExtraNotes}
              multiline
              maxLength={100}
              rightIcon={
                <TouchableOpacity onPress={() => setShowHelpExtra(true)}>
                  <Ionicons
                    name="help-circle-outline"
                    size={isTablet ? 28 : 20}
                    color={Colors[colorScheme].primary}
                  />
                </TouchableOpacity>
              }
              inputContainerStyle={{
                height: isTablet ? 120 : 100,
                alignItems: "center",
                paddingVertical: isTablet ? 16 : 12,
              }}
            />
            <View style={styles.counterRow}>
              <ThemedText
                style={{
                  color: Colors[colorScheme].icon,
                  fontSize: isTablet ? 16 : 14,
                }}
              >{`${extraNotes.length}/100`}</ThemedText>
            </View>
            <ThemedInput
              label="Pesan (Opsional)"
              value={message}
              onChangeText={setMessage}
              multiline
              size="md"
              maxLength={100}
              rightIcon={
                <TouchableOpacity onPress={() => setShowHelpMessage(true)}>
                  <Ionicons
                    name="help-circle-outline"
                    size={isTablet ? 28 : 20}
                    color={Colors[colorScheme].primary}
                  />
                </TouchableOpacity>
              }
              inputContainerStyle={{
                height: isTablet ? 120 : 100,
                alignItems: "center",
                paddingVertical: isTablet ? 16 : 12,
              }}
            />
            <View style={styles.counterRow}>
              <ThemedText
                style={{
                  color: Colors[colorScheme].icon,
                  fontSize: isTablet ? 16 : 14,
                }}
              >{`${message.length}/100`}</ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.sectionCardHighlight,
              isBasic && styles.disabledSectionCard
            ]}
            onPress={() => {
              if (!isBasic) {
                router.push("/dashboard/setting/order-receipt" as never);
              }
            }}
            disabled={isBasic}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ThemedText
                  style={{ fontWeight: "600", fontSize: isTablet ? 20 : 16 }}
                >
                  Ingin Pengaturan Tambahan?
                </ThemedText>
                {isBasic && <ProBadge size="small" />}
              </View>
              <ThemedText style={[
                styles.extraDescription,
                isBasic && styles.disabledText
              ]}>
                Kamu akan lebih leluasa mengatur struk sesuai keinginanmu.
              </ThemedText>
            </View>
            <View style={styles.rightChevron}>
              <Ionicons
                name="chevron-forward-outline"
                size={isTablet ? 24 : 18}
                color={isBasic ? Colors[colorScheme].icon : Colors[colorScheme].primary}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.bottomButtonWrapper}>
            <ThemedButton
              title={isSaving ? "Menyimpan..." : "Simpan"}
              onPress={handleSave}
              disabled={isSaving}
            />
          </View>
        </View>
        <HelpPopup
          visible={showHelpExtra}
          title="Keterangan Tambahan"
          description="Keterangan tambahan akan ditampilkan di bawah nama outlet kamu."
          onClose={() => setShowHelpExtra(false)}
        />
        <HelpPopup
          visible={showHelpMessage}
          title="Pesan Untuk Pelanggan"
          description="Pesan akan ditampilkan di bawah kembalian struk."
          onClose={() => setShowHelpMessage(false)}
        />

        <ConfirmPopup
          visible={showSuccessPopup}
          successOnly
          title="Berhasil"
          message="Konfigurasi struk berhasil disimpan"
          onConfirm={() => setShowSuccessPopup(false)}
          onCancel={() => setShowSuccessPopup(false)}
        />

        <ConfirmPopup
          visible={showExitConfirm}
          title="Perubahan Belum Disimpan"
          message="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?"
          onConfirm={handleConfirmExit}
          onCancel={() => {
            setShowExitConfirm(false);
            setPendingAction(null);
          }}
        />
      </ScrollView>
    </View>
  );
}


