import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {useLocalSearchParams, useRouter} from "expo-router";
import React, {useState} from "react";
import {Alert, StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function EditEmployeeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [name, setName] = useState((params.name as string) || "");
  const [phone, setPhone] = useState((params.phone as string) || "");
  const [email, setEmail] = useState((params.email as string) || "");
  // PIN is usually not pre-filled for security, user sets a new one if needed
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleSave = () => {
    if (!name || !phone || !email) {
      Alert.alert("Error", "Mohon lengkapi data utama (Nama, Telepon, Email)");
      return;
    }

    if (pin && pin !== confirmPin) {
      Alert.alert("Error", "PIN dan Konfirmasi PIN tidak sama");
      return;
    }

    // TODO: Implement API call to update employee
    console.log("Updating employee", {id: params.id, name, phone, email, pin});
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Hapus Pegawai",
      "Apakah Anda yakin ingin menghapus pegawai ini?",
      [
        {text: "Batal", style: "cancel"},
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            // TODO: Implement API call to delete employee
            console.log("Deleting employee", params.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Edit Pegawai" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{padding: 20, paddingBottom: 100}}
        enableOnAndroid
      >
        <ThemedInput
          label="Nama Pegawai"
          value={name}
          size="md"
          onChangeText={setName}
        />
        <ThemedInput
          label="No. Telepon"
          value={phone}
          size="md"
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <ThemedInput
          label="Email"
          value={email}
          size="md"
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View style={styles.divider} />
        <ThemedText style={styles.sectionTitle}>Ubah PIN (Opsional)</ThemedText>

        <ThemedInput
          label="PIN Baru"
          value={pin}
          size="md"
          onChangeText={setPin}
          isPassword
          keyboardType="numeric"
          maxLength={6}
        />
        <ThemedInput
          label="Konfirmasi PIN Baru"
          value={confirmPin}
          size="md"
          onChangeText={setConfirmPin}
          isPassword
          keyboardType="numeric"
          maxLength={6}
        />

        <View style={{marginTop: 24, gap: 12}}>
          <ThemedButton
            title="Simpan Perubahan"
            onPress={handleSave}
            size="medium"
          />
          <ThemedButton
            title="Hapus Pegawai"
            variant="danger"
            size="medium"
            onPress={handleDelete}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
    },
    divider: {
      height: 1,
      backgroundColor: Colors[colorScheme].border,
      marginVertical: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      color: Colors[colorScheme].text,
    },
  });
