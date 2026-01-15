import ConfirmPopup from "@/components/atoms/confirm-popup";
import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import Header from "@/components/header";
import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {settingsApi, UserProfile} from "@/services";
import assetApi, {prepareFileFromUri} from "@/services/endpoints/assets";
import {useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import {ScrollView} from "react-native-gesture-handler";

export default function ProfileSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [showProfileSuccessPopup, setShowProfileSuccessPopup] = useState(false);
  const [showPinSuccessPopup, setShowPinSuccessPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const confirmationDialogRef = React.useRef<ConfirmationDialogHandle | null>(
    null
  );

  useEffect(() => {
    loadProfile();
  }, []);

  // Detect changes
  useEffect(() => {
    if (!initialData) return;

    const changed =
      name !== initialData.name ||
      email !== initialData.email ||
      photoUri !== initialData.photoUri;

    setHasUnsavedChanges(changed);
  }, [name, email, photoUri, initialData]);

  const loadProfile = async () => {
    try {
      const response = await settingsApi.getProfile();
      if (response.data) {
        setProfile(response.data);
        setName(response.data.name);
        setEmail(response.data.email);
        setPhone(response.data.phone);
        setPhotoUri(response.data.profile_url);

        // Save initial data for change detection
        setInitialData({
          name: response.data.name,
          email: response.data.email,
          photoUri: response.data.profile_url,
        });
      }
    } catch (error: any) {
      console.error("❌ Failed to load profile:", error);
      Alert.alert("Error", "Gagal memuat data profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      router.back();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    setHasUnsavedChanges(false);
    router.back();
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert("Validasi", "Nama tidak boleh kosong");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Validasi", "Format email tidak valid");
      return;
    }

    setIsSaving(true);
    try {
      // Upload profile photo first if selected and it's a local file
      let uploadedPhotoUrl: string | undefined;
      if (photoUri && !photoUri.startsWith("http")) {
        console.log("📤 Uploading profile photo...");
        try {
          const file = prepareFileFromUri(photoUri);
          const uploadResponse = await assetApi.uploadImage(file);
          if (uploadResponse.data?.url) {
            uploadedPhotoUrl = uploadResponse.data.url;
            console.log("✅ Profile photo uploaded:", uploadedPhotoUrl);
          }
        } catch (uploadError: any) {
          console.error("❌ Photo upload failed:", uploadError);
          Alert.alert(
            "Peringatan",
            "Gagal upload foto. Lanjutkan tanpa mengubah foto?",
            [
              {
                text: "Batal",
                style: "cancel",
                onPress: () => setIsSaving(false),
              },
              {text: "Lanjutkan", onPress: () => {}},
            ]
          );
          return;
        }
      }

      const payload: any = {
        name: name.trim(),
        email: email.trim(),
      };

      // Add uploaded photo URL or keep existing URL
      if (uploadedPhotoUrl) {
        payload.profile_url = uploadedPhotoUrl;
      } else if (photoUri && photoUri.startsWith("http")) {
        payload.profile_url = photoUri;
      }

      await settingsApi.updateProfile(payload);
      setHasUnsavedChanges(false);
      setShowProfileSuccessPopup(true);
      loadProfile();
    } catch (error: any) {
      console.error("❌ Failed to update profile:", error);
      Alert.alert("Gagal", error.message || "Gagal memperbarui profil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePin = async () => {
    setPinError("");

    if (!oldPin || oldPin.length !== 6) {
      setPinError("PIN lama harus 6 angka");
      return;
    }

    if (newPin.length !== 6 || confirmPin.length !== 6) {
      setPinError("PIN harus 6 angka");
      return;
    }

    if (newPin !== confirmPin) {
      setPinError("PIN baru tidak cocok");
      return;
    }

    setIsChangingPin(true);
    try {
      await settingsApi.changePin({
        old_pin: oldPin,
        new_pin: newPin,
        new_pin_confirmation: confirmPin,
      });

      setShowPinSuccessPopup(true);
      setOldPin("");
      setNewPin("");
      setConfirmPin("");
    } catch (error: any) {
      console.error("❌ Failed to change PIN:", error);
      setPinError(error.message || "Gagal mengubah PIN");
    } finally {
      setIsChangingPin(false);
    }
  };

  const handleDeleteAccount = () => {
    confirmationDialogRef.current?.showConfirmationDialog({
      title: "Hapus Akun?",
      message:
        "Akunmu dan semua data terkait (transaksi, laporan, dan data pribadi) akan dihapus permanen dan tidak bisa dikembalikan.",
      onConfirm: async () => {
        try {
          await settingsApi.deleteAccount();
          setShowDeleteSuccessPopup(true);
        } catch (error: any) {
          console.error("❌ Failed to delete account:", error);
          Alert.alert("Gagal", error.message || "Gagal menghapus akun");
        }
      },
    });
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: "center", alignItems: "center"},
        ]}
      >
        <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Profile" showHelp={false} onBackPress={handleBackPress} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.sectionCard1}>
            <ImageUpload
              uri={photoUri}
              initials={(name || "PR").slice(0, 2).toUpperCase()}
              onImageSelected={uri => setPhotoUri(uri)}
            />
          </View>

          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              Data Diri
            </ThemedText>
            <ThemedInput label="Nama" value={name} onChangeText={setName} />
            <ThemedInput label="Nomor Hp" value={phone} editable={false} />
            <ThemedInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <View style={styles.sectionButtonWrapper}>
              <ThemedButton
                title={isSaving ? "Menyimpan..." : "Simpan"}
                size="medium"
                onPress={handleSaveProfile}
                disabled={isSaving}
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2" style={styles.sectionTitle}>
              PIN
            </ThemedText>
            <ThemedText style={styles.pinHintText}>
              Hanya diisi jika ingin diganti
            </ThemedText>
            <ThemedInput
              label="Masukkan 6 Angka PIN Lama"
              value={oldPin}
              onChangeText={setOldPin}
              isPassword
              numericOnly
              maxLength={6}
            />
            <ThemedInput
              label="Masukkan 6 Angka PIN Baru"
              value={newPin}
              onChangeText={setNewPin}
              isPassword
              numericOnly
              maxLength={6}
            />
            <ThemedInput
              label="Konfirmasi 6 Angka PIN Baru"
              value={confirmPin}
              onChangeText={setConfirmPin}
              isPassword
              numericOnly
              maxLength={6}
              error={pinError}
            />
            <View style={styles.sectionButtonWrapper}>
              <ThemedButton
                title={isChangingPin ? "Mengubah..." : "Ganti PIN"}
                size="medium"
                onPress={handleChangePin}
                disabled={isChangingPin}
              />
            </View>
          </View>

          <View style={styles.sectionCard}>
            <ThemedText type="subtitle-2">Kelola Akun</ThemedText>
            <ThemedText style={styles.accountWarningText}>
              Akan menghapus secara permanen akunmu. Kamu tidak bisa lagi
              mengakses semua riwayat transaksi, laporan dan data pribadi
            </ThemedText>
            <View style={styles.sectionButtonWrapper}>
              <ThemedButton
                title="Hapus Akun"
                variant="secondary"
                size="medium"
                onPress={handleDeleteAccount}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <ConfirmationDialog ref={confirmationDialogRef} />

      <ConfirmPopup
        visible={showProfileSuccessPopup}
        title="Berhasil"
        message="Profil berhasil diperbarui"
        onConfirm={() => setShowProfileSuccessPopup(false)}
        onCancel={() => setShowProfileSuccessPopup(false)}
      />

      <ConfirmPopup
        visible={showPinSuccessPopup}
        title="Berhasil"
        message="PIN berhasil diubah"
        onConfirm={() => setShowPinSuccessPopup(false)}
        onCancel={() => setShowPinSuccessPopup(false)}
      />

      <ConfirmPopup
        visible={showDeleteSuccessPopup}
        title="Berhasil"
        message="Akun berhasil dihapus"
        onConfirm={() => {
          setShowDeleteSuccessPopup(false);
          router.replace("/auth/Login/login");
        }}
        onCancel={() => {
          setShowDeleteSuccessPopup(false);
          router.replace("/auth/Login/login");
        }}
      />

      <ConfirmPopup
        visible={showExitConfirm}
        title="Perubahan Belum Disimpan"
        message="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin keluar?"
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitConfirm(false)}
      />
    </View>
  );
}

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingHorizontal: isTablet ? 60 : 20,
      paddingBottom: isTablet ? 32 : 20,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    sectionCard: {
      marginTop: isTablet ? 20 : 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: isTablet ? 16 : 8,
      paddingVertical: isTablet ? 16 : 8,
    },
    sectionCard1: {
      marginTop: isTablet ? 20 : 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: isTablet ? 16 : 8,
      paddingVertical: isTablet ? 16 : 8,
      marginBottom: isTablet ? 20 : 12,
    },
    sectionTitle: {
      marginBottom: isTablet ? 20 : 12,
      fontSize: isTablet ? 20 : 16,
    },
    sectionButtonWrapper: {
      marginTop: isTablet ? 20 : 12,
    },
    pinHintText: {
      fontSize: isTablet ? 18 : 14,
      color: Colors[colorScheme].warning,
    },
    accountWarningText: {
      color: Colors[colorScheme].danger,
      lineHeight: isTablet ? 28 : 20,
      fontSize: isTablet ? 18 : 14,
      fontWeight: "300",
      marginVertical: isTablet ? 20 : 12,
    },
  });
