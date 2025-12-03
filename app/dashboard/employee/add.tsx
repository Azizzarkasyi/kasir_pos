import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import employeeApi from "@/services/endpoints/employees";
import {useRouter} from "expo-router";
import React, {useState} from "react";
import {Alert, StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function AddEmployeeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"cashier" | "manager">("cashier");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validate name
    if (!name || !name.trim()) {
      Alert.alert("Error", "Nama pegawai harus diisi");
      return;
    }

    if (name.trim().length < 3) {
      Alert.alert("Error", "Nama pegawai minimal 3 karakter");
      return;
    }

    // Validate phone
    if (!phone || !phone.trim()) {
      Alert.alert("Error", "No. Telepon harus diisi");
      return;
    }

    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert(
        "Error",
        "Format nomor telepon tidak valid. Contoh: 081234567890"
      );
      return;
    }

    // Validate email
    if (!email || !email.trim()) {
      Alert.alert("Error", "Email harus diisi");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert(
        "Error",
        "Format email tidak valid. Contoh: user@example.com"
      );
      return;
    }

    // Validate PIN
    if (!pin) {
      Alert.alert("Error", "PIN harus diisi");
      return;
    }

    if (pin.length !== 6) {
      Alert.alert("Error", "PIN harus exactly 6 digit");
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      Alert.alert("Error", "PIN harus 6 digit angka");
      return;
    }

    // Validate confirm PIN
    if (!confirmPin) {
      Alert.alert("Error", "Konfirmasi PIN harus diisi");
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert("Error", "PIN dan Konfirmasi PIN tidak sama");
      return;
    }

    // Validate role
    if (!role || (role !== "cashier" && role !== "manager")) {
      Alert.alert("Error", "Role harus dipilih (cashier atau manager)");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        pin: pin,
        role: role,
      };

      console.log("📦 Creating employee:");
      console.log("- Name:", payload.name);
      console.log("- Phone:", payload.phone);
      console.log("- Email:", payload.email);
      console.log("- PIN:", payload.pin);
      console.log("- Role:", payload.role, typeof payload.role);

      const response = await employeeApi.createEmployee(payload);

      if (response.data) {
        console.log("✅ Employee created successfully:", response.data);
        Alert.alert("Sukses", "Pegawai berhasil ditambahkan", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("❌ Failed to create employee:", error);
      Alert.alert("Error", error.message || "Gagal menambahkan pegawai");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Tambah Pegawai" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={{padding: 20, gap: 8, paddingBottom: 100}}
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
          onChangeText={text => {
            // Only allow numbers and + symbol
            const filtered = text.replace(/[^0-9+]/g, "");
            setPhone(filtered);
          }}
          keyboardType="phone-pad"
        />
        <ThemedInput
          label="Email"
          size="md"
          value={email}
          onChangeText={text => {
            // Auto trim and lowercase
            const filtered = text.trim().toLowerCase();
            setEmail(filtered);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <ComboInput
          label="Role"
          value={role === "cashier" ? "Kasir" : "Manager"}
          onChangeText={label => {
            const newRole = label === "Kasir" ? "cashier" : "manager";
            console.log(
              "🔄 Role changed from label:",
              label,
              "to value:",
              newRole
            );
            setRole(newRole);
          }}
          items={[
            {label: "Kasir", value: "cashier"},
            {label: "Manager", value: "manager"},
          ]}
          disableAutoComplete
        />
        <ThemedInput
          label="PIN"
          size="md"
          value={pin}
          onChangeText={text => {
            // Only allow numbers
            const filtered = text.replace(/[^0-9]/g, "");
            setPin(filtered);
          }}
          isPassword
          keyboardType="numeric"
          maxLength={6}
        />
        <ThemedInput
          label="Konfirmasi PIN"
          size="md"
          value={confirmPin}
          onChangeText={text => {
            // Only allow numbers
            const filtered = text.replace(/[^0-9]/g, "");
            setConfirmPin(filtered);
          }}
          isPassword
          keyboardType="numeric"
          maxLength={6}
        />

        <View style={{marginTop: 24}}>
          <ThemedButton
            title={isSaving ? "Menyimpan..." : "Simpan"}
            onPress={handleSave}
            size="medium"
            disabled={isSaving}
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
  });
