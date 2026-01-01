import ConfirmPopup from "@/components/atoms/confirm-popup";
import SectionDivider from "@/components/atoms/section-divider";
import SelectBranchModal from "@/components/drawers/select-branch-modal";
import Header from "@/components/header";
import RadioButton from "@/components/radio-button";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Branch } from "@/services";
import employeeApi from "@/services/endpoints/employees";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EditEmployeeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { width, height } = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"cashier" | "manager">("cashier");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<Branch[]>([]);
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDeleteSuccessPopup, setShowDeleteSuccessPopup] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, []);

  console.log(params.id);

  const loadEmployee = async () => {
    if (!params.id) {
      Alert.alert("Error", "ID pegawai tidak ditemukan");
      router.back();
      return;
    }

    try {
      setIsLoading(true);
      const response = await employeeApi.getEmployee(params.id);

      if (response.data) {
        const employee = response.data as any;
        setName(employee.name);
        setPhone(employee.phone || "");
        setEmail(employee.email);

        // Set role - use the role from the first branch if available, otherwise use employee role
        let roleToSet = "cashier"; // default
        if (employee.branches && employee.branches.length > 0) {
          // Use role from the first branch
          const branchRole = employee.branches[0].role?.toLowerCase();
          if (branchRole === "manager") {
            roleToSet = "manager";
          }
        } else if (employee.role) {
          // Fallback to employee role
          const empRole = employee.role.toLowerCase();
          if (empRole === "manager") {
            roleToSet = "manager";
          }
        }
        setRole(roleToSet as "cashier" | "manager");

        // Set selected branches from branches array
        if (employee.branches && employee.branches.length > 0) {
          const branches = employee.branches.map((branch: any) => ({
            id: branch.id,
            name: branch.name,
            address: branch.address || "",
          }));
          setSelectedBranches(branches);
        }

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
        params.id as string,
        payload
      );

      if (response.data) {
        console.log("✅ Employee updated successfully:", response.data);
        setShowSuccessPopup(true);
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
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              setIsSaving(true);

              await employeeApi.deleteEmployee(params.id as string);

              console.log("✅ Employee deleted successfully");
              setShowDeleteSuccessPopup(true);
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
      <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
        <Header title="Edit Pegawai" showHelp={false} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Colors[colorScheme].primary} />
          <ThemedText style={{ marginTop: 16, color: Colors[colorScheme].icon }}>
            Memuat data pegawai...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Header title="Edit Pegawai" showHelp={false} />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
      >
        <View style={styles.contentWrapper}>
          <View style={styles.sectionPadding}>
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
          </View>
        </View>

        <SectionDivider />

        <View style={styles.contentWrapper}>
          <View style={styles.sectionPadding}>
            <ThemedText style={styles.sectionTitle}>
              Ubah PIN (Opsional)
            </ThemedText>

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
              <View style={styles.selectedOutletsContainer}>
                <View style={styles.selectedOutletsHeader}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors[colorScheme].primary}
                  />
                  <ThemedText style={styles.selectedOutletsHeaderText}>
                    {selectedBranches.length} Outlet Terpilih
                  </ThemedText>
                </View>
                <View style={styles.selectedOutletsList}>
                  {selectedBranches.map((branch, index) => (
                    <View key={branch.id} style={styles.selectedOutletItem}>
                      <View style={styles.selectedOutletContent}>
                        <View style={styles.selectedOutletIcon}>
                          <Ionicons
                            name="storefront"
                            size={isTablet ? 22 : 18}
                            color={Colors[colorScheme].primary}
                          />
                        </View>
                        <View style={styles.selectedOutletInfo}>
                          <ThemedText style={styles.selectedOutletName}>
                            {branch.name}
                          </ThemedText>
                          {branch.address && (
                            <ThemedText
                              style={styles.selectedOutletAddress}
                              numberOfLines={1}
                            >
                              {branch.address}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.removeBranchButton}
                        onPress={() => {
                          const newBranches = selectedBranches.filter(b => b.id !== branch.id);
                          setSelectedBranches(newBranches);
                        }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color={Colors[colorScheme].icon}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <ThemedText style={styles.outletHint}>
                Tekan Pilih Outlet untuk memilih tempat pegawai bekerja
              </ThemedText>
            )}

            <View style={styles.buttonContainer}>
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
        successOnly
        title="Berhasil"
        message="Pegawai berhasil diperbarui"
        onConfirm={() => {
          setShowSuccessPopup(false);
          router.back();
        }}
        onCancel={() => {
          setShowSuccessPopup(false);
          router.back();
        }}
      />

      <ConfirmPopup
        visible={showDeleteSuccessPopup}
        title="Berhasil"
        message="Pegawai berhasil dihapus"
        onConfirm={() => {
          setShowDeleteSuccessPopup(false);
          router.back();
        }}
        onCancel={() => {
          setShowDeleteSuccessPopup(false);
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
      paddingHorizontal: isTablet ? 60 : 20,
      paddingVertical: isTablet ? 24 : 16,
      gap: isTablet ? 12 : 8,
    },
    buttonContainer: {
      marginTop: isTablet ? 32 : 24,
      gap: isTablet ? 16 : 12,
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
      fontSize: isTablet ? 24 : 16,
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
      fontSize: isTablet ? 22 : 14,
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
    selectedOutletsContainer: {
      marginTop: isTablet ? 20 : 16,
    },
    selectedOutletsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isTablet ? 16 : 12,
      gap: 8,
    },
    selectedOutletsHeaderText: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    selectedOutletsList: {
      gap: isTablet ? 12 : 8,
    },
    selectedOutletItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: isTablet ? 16 : 12,
      paddingHorizontal: isTablet ? 16 : 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      backgroundColor: Colors[colorScheme].background,
    },
    selectedOutletContent: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: isTablet ? 12 : 10,
    },
    selectedOutletIcon: {
      width: isTablet ? 44 : 36,
      height: isTablet ? 44 : 36,
      borderRadius: isTablet ? 22 : 18,
      backgroundColor: Colors[colorScheme].primary + "20",
      alignItems: "center",
      justifyContent: "center",
    },
    selectedOutletInfo: {
      flex: 1,
    },
    selectedOutletName: {
      fontSize: isTablet ? 18 : 14,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      marginBottom: 2,
    },
    selectedOutletAddress: {
      fontSize: isTablet ? 16 : 12,
      color: Colors[colorScheme].icon,
    },
    removeBranchButton: {
      padding: 8,
    },
  });

