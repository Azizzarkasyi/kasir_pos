import ComboInput from "@/components/combo-input";
import Header from "@/components/header";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import employeeApi from "@/services/endpoints/employees";
import {useLocalSearchParams, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import {ActivityIndicator, Alert, StyleSheet, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function EditEmployeeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{id?: string}>();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"cashier" | "manager">("cashier");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, []);

  const loadEmployee = async () => {
    if (!params.id) {
      Alert.alert("Error", "ID pegawai tidak ditemukan");
      router.back();
      return;
    }

    try {
      setIsLoading(true);
      const response = await employeeApi.getEmployee(Number(params.id));

      if (response.data) {
        const employee = response.data;
        setName(employee.name);
        setPhone(employee.phone || "");
        setEmail(employee.email);
        setRole(employee.role || "cashier");
        console.log("✅ Employee loaded:", employee);
      }
    } catch (error: any) {
      console.error("❌ Failed to load employee:", error);
      Alert.alert("Error", "Gagal memuat data pegawai");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

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

    // Validate PIN if provided (optional for edit)
    if (pin) {
      if (pin.length !== 6) {
        Alert.alert("Error", "PIN harus exactly 6 digit");
        return;
      }

      if (!/^\d{6}$/.test(pin)) {
        Alert.alert("Error", "PIN harus 6 digit angka");
        return;
      }

      if (pin !== confirmPin) {
        Alert.alert("Error", "PIN dan Konfirmasi PIN tidak sama");
        return;
      }
    }

    try {
      setIsSaving(true);

      const payload: any = {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        role: role,
      };

      if (pin) {
        payload.pin = pin;
      }

      console.log("📦 Updating employee:", payload);

      const response = await employeeApi.updateEmployee(
        Number(params.id),
        payload
      );

      if (response.data) {
        console.log("✅ Employee updated successfully:", response.data);
        Alert.alert("Sukses", "Pegawai berhasil diperbarui", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      console.error("❌ Failed to update employee:", error);
      Alert.alert("Error", error.message || "Gagal memperbarui pegawai");
    } finally {
      setIsSaving(false);
    }
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
          onPress: async () => {
            try {
              setIsSaving(true);
              console.log("🗑️ Deleting employee:", params.id);

              await employeeApi.deleteEmployee(Number(params.id));

              console.log("✅ Employee deleted successfully");
              Alert.alert("Sukses", "Pegawai berhasil dihapus", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error: any) {
              console.error("❌ Failed to delete employee:", error);
              Alert.alert("Error", error.message || "Gagal menghapus pegawai");
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
        <Header title="Edit Pegawai" showHelp={false} />
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          <ThemedText style={{marginTop: 16, color: Colors[colorScheme].icon}}>
            Memuat data pegawai...
          </ThemedText>
        </View>
      </View>
    );
  }

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
          onChangeText={text => {
            // Only allow numbers and + symbol
            const filtered = text.replace(/[^0-9+]/g, "");
            setPhone(filtered);
          }}
          keyboardType="phone-pad"
        />
        <ThemedInput
          label="Email"
          value={email}
          size="md"
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

        <View style={styles.divider} />
        <ThemedText style={styles.sectionTitle}>Ubah PIN (Opsional)</ThemedText>

        <ThemedInput
          label="PIN Baru"
          value={pin}
          size="md"
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
          label="Konfirmasi PIN Baru"
          value={confirmPin}
          size="md"
          onChangeText={text => {
            // Only allow numbers
            const filtered = text.replace(/[^0-9]/g, "");
            setConfirmPin(filtered);
          }}
          isPassword
          keyboardType="numeric"
          maxLength={6}
        />

        <View style={{marginTop: 24, gap: 12}}>
          <ThemedButton
            title={isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            onPress={handleSave}
            size="medium"
            disabled={isSaving}
          />
          <ThemedButton
            title="Hapus Pegawai"
            variant="danger"
            size="medium"
            onPress={handleDelete}
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
