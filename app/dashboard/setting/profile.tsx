import ImageUpload from "@/components/image-upload";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React from "react";
import {StyleSheet, View} from "react-native";
import {ScrollView} from "react-native-gesture-handler";

export default function ProfileSettingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const photoUri: string | undefined = undefined;
  const [name, setName] = React.useState("Basofi Rswt");
  const phone = "6288277069611";
  const [email, setEmail] = React.useState("basofi.cucokmeong12@gmail.com");
  const [oldPin, setOldPin] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");
  const [pinError, setPinError] = React.useState("");

  const handleChangePin = () => {
    if (newPin.length !== 6 || confirmPin.length !== 6) {
      setPinError("PIN harus 6 angka");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PIN baru tidak cocok");
      return;
    }
    setPinError("");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard1}>
          <ThemedText type="subtitle-2">Foto Profil</ThemedText>
          <ImageUpload uri={photoUri} onPress={() => {}} />
          <View style={{marginTop: 16}}>
            <ThemedButton
              title="Terapkan Foto"
              variant="primary"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Data Diri</ThemedText>
          <ThemedInput label="Nama" value={name} onChangeText={setName} />
          <ThemedInput label="Nomor Hp" value={phone} editable={false} />
          <ThemedInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <View style={{marginTop: 12}}>
            <ThemedButton title="Simpan" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">PIN</ThemedText>
          <ThemedText style={{color: Colors[colorScheme].icon}}>
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
          <View style={{marginTop: 12}}>
            <ThemedButton title="Ganti PIN" onPress={handleChangePin} />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <ThemedText type="subtitle-2">Kelola Akun</ThemedText>
          <ThemedText style={{color: Colors[colorScheme].primary}}>
            Akan menghapus secara permanen akunmu. Kamu tidak bisa lagi
            mengakses semua riwayat transaksi, laporan dan data pribadi
          </ThemedText>
          <View style={{marginTop: 12}}>
            <ThemedButton
              title="Hapus Akun"
              variant="secondary"
              onPress={() => {}}
            />
          </View>
        </View>
      </ScrollView>
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
  });
