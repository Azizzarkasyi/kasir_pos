import SectionDivider from "@/components/atoms/section-divider";
import ConfirmPopup from "@/components/atoms/confirm-popup";
import SelectBranchModal from "@/components/drawers/select-branch-modal";
import Header from "@/components/header";
import RadioButton from "@/components/radio-button";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Branch} from "@/services";
import employeeApi from "@/services/endpoints/employees";
import {useRouter} from "expo-router";
import React, {useState} from "react";
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function AddEmployeeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"cashier" | "manager">("cashier");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<Branch[]>([]);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

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

    if (selectedBranches.length === 0) {
      Alert.alert("Error", "Mohon pilih minimal satu outlet");
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
        branch_ids: [],
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
        setShowSuccessPopup(true);
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
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
      >
        <View style={styles.contentWrapper}>
          <View style={styles.sectionPadding}>
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
          </View>
        </View>

        <SectionDivider />

        <View style={styles.contentWrapper}>
          <View style={styles.sectionPadding}>
            <ThemedText style={styles.sectionTitle}>Role</ThemedText>

            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={styles.roleOption}
                activeOpacity={0.7}
                onPress={() => setRole("cashier")}
              >
                <RadioButton
                  selected={role === "cashier"}
                  onPress={() => setRole("cashier")}
                />
                <ThemedText style={styles.roleLabel}>Cashier</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.roleOption}
                activeOpacity={0.7}
                onPress={() => setRole("manager")}
              >
                <RadioButton
                  selected={role === "manager"}
                  onPress={() => setRole("manager")}
                />
                <ThemedText style={styles.roleLabel}>Manager</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <SectionDivider />

        <View style={styles.contentWrapper}>
          <View style={styles.sectionPadding}>
            <View style={styles.outletSection}>
              <ThemedText style={styles.sectionTitle}>Outlet</ThemedText>
              <TouchableOpacity
                style={styles.outletButton}
                onPress={() => setBranchModalVisible(true)}
              >
                <ThemedText style={styles.outletButtonText}>
                  Pilih Outlet
                </ThemedText>
              </TouchableOpacity>
            </View>

            {selectedBranches.length > 0 ? (
              <View style={styles.selectedOutletsList}>
                {selectedBranches.map(branch => (
                  <View key={branch.id} style={styles.selectedOutletItem}>
                    <ThemedText style={styles.selectedOutletName}>
                      {branch.name}
                    </ThemedText>
                    <ThemedText
                      style={styles.selectedOutletAddress}
                      numberOfLines={1}
                    >
                      {branch.address}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : (
              <ThemedText style={styles.outletHint}>
                Tekan Pilih Outlet untuk memilih tempat pegawai bekerja
              </ThemedText>
            )}

            <View style={styles.buttonContainer}>
              <ThemedButton title="Simpan" onPress={handleSave} size="medium" />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <SelectBranchModal
        visible={branchModalVisible}
        selectedBranches={selectedBranches}
        onSelect={setSelectedBranches}
        onClose={() => setBranchModalVisible(false)}
      />

      <ConfirmPopup
        visible={showSuccessPopup}
        title="Berhasil"
        message="Pegawai berhasil ditambahkan"
        onConfirm={() => {
          setShowSuccessPopup(false);
          router.back();
        }}
        onCancel={() => {
          setShowSuccessPopup(false);
          router.back();
        }}
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
    scrollContent: {
      paddingBottom: isTablet ? 120 : 100,
    },
    contentWrapper: {
      width: "100%",
      maxWidth: isTabletLandscape ? 960 : undefined,
      alignSelf: "center",
    },
    sectionPadding: {
      paddingHorizontal: isTablet ? 40 : 20,
      paddingVertical: isTablet ? 28 : 16,
      gap: isTablet ? 12 : 8,
    },
    buttonContainer: {
      marginTop: isTablet ? 32 : 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isTablet ? 24 : 16,
      paddingBottom: isTablet ? 16 : 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    backButton: {
      padding: isTablet ? 12 : 8,
    },
    headerTitle: {
      fontSize: isTablet ? 22 : 18,
      fontWeight: "bold",
    },
    divider: {
      height: 1,
      backgroundColor: Colors[colorScheme].border,
      marginVertical: isTablet ? 28 : 20,
    },
    sectionTitle: {
      fontSize: isTablet ? 20 : 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    roleContainer: {
      flexDirection: "row",
      gap: isTablet ? 32 : 24,
      marginTop: isTablet ? 16 : 12,
    },
    roleOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: isTablet ? 12 : 8,
    },
    roleLabel: {
      fontSize: isTablet ? 20 : 14,
      color: Colors[colorScheme].text,
    },
    outletSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    outletButton: {
      paddingHorizontal: isTablet ? 20 : 16,
      paddingVertical: isTablet ? 12 : 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    outletButtonText: {
      fontSize: isTablet ? 18 : 12,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    outletHint: {
      fontSize: isTablet ? 18 : 12,
      color: Colors[colorScheme].icon,
      textAlign: "center",
      marginTop: isTablet ? 16 : 12,
    },
    selectedOutletsList: {
      marginTop: isTablet ? 16 : 12,
      gap: isTablet ? 12 : 8,
    },
    selectedOutletItem: {
      paddingVertical: isTablet ? 14 : 10,
      paddingHorizontal: isTablet ? 16 : 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    selectedOutletName: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 4,
    },
    selectedOutletAddress: {
      fontSize: isTablet ? 16 : 12,
      color: Colors[colorScheme].icon,
    },
  });
