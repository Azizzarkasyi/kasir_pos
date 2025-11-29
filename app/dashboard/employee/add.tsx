import Header from "@/components/header";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AddEmployeeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleSave = () => {
    if (!name || !phone || !email || !pin || !confirmPin) {
      Alert.alert("Error", "Mohon lengkapi semua data");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("Error", "PIN dan Konfirmasi PIN tidak sama");
      return;
    }

    // TODO: Implement API call to save employee
    console.log("Saving employee", { name, phone, email, pin });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header title="Tambah Pegawai" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: 100 }}
        enableOnAndroid
      >
        <ThemedInput
          label="Nama Pegawai"
          size="md"
          value={name}
          onChangeText={setName}
        />
        <ThemedInput
          label="No. Telepon"
          size="md"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <ThemedInput
          label="Email"
          size="md"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <ThemedInput
          label="PIN"
          size="md"
          value={pin}
          onChangeText={setPin}
          isPassword
          keyboardType="numeric"
          maxLength={6}
        />
        <ThemedInput
          label="Konfirmasi PIN"
          size="md"
          value={confirmPin}
          onChangeText={setConfirmPin}
          isPassword
          keyboardType="numeric"
          maxLength={6}
        />

        <View style={{ marginTop: 24 }}>
          <ThemedButton title="Simpan" onPress={handleSave} size="medium" />
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
  });
