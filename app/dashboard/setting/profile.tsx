import ConfirmationDialog, {
  ConfirmationDialogHandle,
} from "@/components/drawers/confirmation-dialog";
import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React, {useEffect, useState} from "react";
import {StyleSheet, View, Alert, ActivityIndicator} from "react-native";
import {ScrollView} from "react-native-gesture-handler";
import {settingsApi, authApi, UserProfile} from "@/services";
import {useRouter} from "expo-router";

export default function ProfileSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
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
  const confirmationDialogRef = React.useRef<ConfirmationDialogHandle | null>(
    null
  );

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await settingsApi.getProfile();
      if (response.data) {
        setProfile(response.data);
        setName(response.data.name);
        setEmail(response.data.email);
        setPhone(response.data.phone);
        setPhotoUri(response.data.photo);
      }
    } catch (error: any) {
      console.error("❌ Failed to load profile:", error);
      Alert.alert("Error", "Gagal memuat data profil");
    } finally {
      setIsLoading(false);
    }
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
      await settingsApi.updateProfile({
        name: name.trim(),
        email: email.trim(),
      });
      Alert.alert("Berhasil", "Profil berhasil diperbarui");
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
        confirm_pin: confirmPin,
      });

      Alert.alert("Berhasil", "PIN berhasil diubah");
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
          Alert.alert("Berhasil", "Akun berhasil dihapus", [
            {text: "OK", onPress: () => router.replace("/auth/Login/login")},
          ]);
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
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard1}>
          <ImageUpload uri={photoUri} onPress={() => {}} />
          {/* <View style={{marginTop: 16}}>
            <ThemedButton
              title="Terapkan Foto"
              variant="primary"
              onPress={() => {}}
            />
          </View> */}
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
            keyboardType="number-pad"
            maxLength={6}
          />
          <ThemedInput
            label="Masukkan 6 Angka PIN Baru"
            value={newPin}
            onChangeText={setNewPin}
            isPassword
            keyboardType="number-pad"
            maxLength={6}
          />
          <ThemedInput
            label="Konfirmasi 6 Angka PIN Baru"
            value={confirmPin}
            onChangeText={setConfirmPin}
            isPassword
            keyboardType="number-pad"
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
      </ScrollView>

      <ConfirmationDialog ref={confirmationDialogRef} />
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    sectionCard: {
      marginTop: 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 8,
      paddingVertical: 8,
    },
    sectionCard1: {
      marginTop: 12,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 8,
      paddingVertical: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      marginBottom: 12,
    },
    sectionButtonWrapper: {
      marginTop: 12,
    },
    pinHintText: {
      fontSize: 14,
      color: Colors[colorScheme].warning,
    },
    accountWarningText: {
      color: Colors[colorScheme].danger,
      lineHeight: 20,
      fontSize: 14,
      fontWeight: "300",
      marginVertical: 12,
    },
  });
