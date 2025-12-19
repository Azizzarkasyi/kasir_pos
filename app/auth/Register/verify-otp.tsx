import Header from "@/components/header";
import OtpInput from "@/components/otp-input";
import ChangePhoneModal from "@/components/popup";
import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { authApi } from "@/services";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  useWindowDimensions,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const VerifyOtpScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const isLandscape = width > height;
  const isTabletLandscape = isTablet && isLandscape;
  const styles = createStyles(colorScheme, isTablet, isTabletLandscape);
  const router = useRouter();
  const params = useLocalSearchParams<{phone?: string}>();

  const [phone, setPhone] = useState(params.phone || "");
  const [countdown, setCountdown] = useState(60);
  const [code, setCode] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Request OTP saat pertama kali masuk
  useEffect(() => {
    if (phone) {
      requestOtp(phone);
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const requestOtp = async (phoneNumber: string) => {
    try {
      setIsResending(true);
      console.log("📤 Requesting OTP for:", phoneNumber);

      const response = await authApi.requestOtp({phone: phoneNumber});

      if (response.success) {
        console.log("✅ OTP sent successfully");
        // Jika development mode, tampilkan OTP jika tersedia
        if ((response.data as any)?.otp) {
          Alert.alert(
            "OTP Dikirim",
            `Kode OTP: ${(response.data as any).otp}\n\n(Hanya di development mode)`
          );
        }
      } else {
        throw new Error(response.message || "Gagal mengirim OTP");
      }
    } catch (error: any) {
      console.error("❌ Request OTP failed:", error);
      Alert.alert("Gagal", error.message || "Gagal mengirim OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    requestOtp(phone);
  };

  const handleSave = (number: string) => {
    console.log("Nomor baru:", number);
    setPhone(number);
    setModalVisible(false);
    // Request OTP ke nomor baru
    requestOtp(number);
  };

  const handleVerifyOtp = async () => {
    if (code.length < 6) {
      Alert.alert("Perhatian", "Masukkan 6 digit kode OTP");
      return;
    }

    setIsLoading(true);

    try {
      console.log("📤 Validating OTP:", code);

      const response = await authApi.validateOtp({
        phone,
        otp: code,
      });

      if (response.success && response.data?.access_token) {
        console.log("✅ OTP verified successfully");

        // Save token
        await authApi.setToken(response.data.access_token);

        // Save user data to AsyncStorage (including plan and role)
        if (response.data.user) {
          const AsyncStorage = await import(
            "@react-native-async-storage/async-storage"
          );
          await AsyncStorage.default.setItem(
            "user_data",
            JSON.stringify(response.data.user)
          );
          console.log("✅ User data saved:", response.data.user);
        }

        // Save user role to AsyncStorage (backward compatibility)
        if (response.data.user?.role) {
          const AsyncStorage = await import(
            "@react-native-async-storage/async-storage"
          );
          await AsyncStorage.default.setItem(
            "user_role",
            response.data.user.role
          );
          console.log("✅ User role saved:", response.data.user.role);
        }
        console.log("🔑 Token saved");

        // Save store_id and branch_id to AsyncStorage
        const AsyncStorage = await import(
          "@react-native-async-storage/async-storage"
        );

        // Save store_id from user response
        if ((response.data.user as any)?.store_id) {
          await AsyncStorage.default.setItem(
            "store_id",
            String((response.data.user as any).store_id)
          );
          console.log("🏪 Store ID saved:", (response.data.user as any).store_id);
        }

        // Save branch_id and branch_name
        if (response.data.branch?.id) {
          await AsyncStorage.default.setItem(
            "current_branch_id",
            response.data.branch.id
          );
          console.log("🏢 Branch ID saved:", response.data.branch.id);

          if (response.data.branch?.name) {
            await AsyncStorage.default.setItem(
              "current_branch_name",
              response.data.branch.name
            );
          }
        }

        // Navigate directly to home
        router.replace("/dashboard/home" as never);
      } else {
        throw new Error(response.message || "Kode OTP tidak valid");
      }
    } catch (error: any) {
      console.error("❌ Validate OTP failed:", error);
      Alert.alert(
        "Gagal",
        error.message || "Kode OTP tidak valid atau sudah kadaluarsa"
      );
    } finally {
      setIsLoading(false);
    }
  };
  // Modal ditampilkan melalui state isModalVisible
  return (
    <View style={styles.container}>
      <Header title="Daftar" />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        style={{backgroundColor: Colors[colorScheme].background}}
      >
        <ChangePhoneModal
          isOpen={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
        />
        <View style={styles.content}>
          <ThemedText style={styles.title}>
            Kode Verifikasi Telah Dikirim
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Cek kodenya di pesan SMS yang dikirim ke nomor dibawah ini.
          </ThemedText>
          <View style={{flexDirection: "column", width: "100%"}}>
            <View style={styles.phonePill}>
              <ThemedText style={styles.phoneText}>{phone}</ThemedText>
              {/* <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.editButton}
              >
                <Ionicons
                  name="pencil"
                  size={18}
                  color={Colors[colorScheme].background}
                />
              </TouchableOpacity> */}
            </View>

            <OtpInput length={6} onComplete={setCode} />
          </View>

          <ThemedButton
            title={isLoading ? "Memverifikasi..." : "Verifikasi"}
            onPress={handleVerifyOtp}
            disabled={code.length < 6 || isLoading}
            style={{marginTop: 24}}
          />

          <ThemedText style={styles.counterText}>
            Kirim ulang kode dalam 00 : {String(countdown).padStart(2, "0")}
          </ThemedText>

          <ThemedButton
            title={isResending ? "Mengirim..." : "Kirim Ulang SMS"}
            onPress={handleResend}
            disabled={countdown > 0 || isResending}
            style={{marginTop: 12}}
          />

          {(isLoading || isResending) && (
            <ActivityIndicator
              size="small"
              color={Colors[colorScheme].primary}
              style={{marginTop: 12}}
            />
          )}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const createStyles = (
  colorScheme: "light" | "dark",
  isTablet: boolean,
  isTabletLandscape: boolean,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 0,
      paddingTop: 0,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 24,
      width: "100%",
      maxWidth: isTabletLandscape ? 640 : isTablet ? 480 : 400,
      alignSelf: "center",
    },
    content: {
      flex: 1,
      paddingVertical: 20,
      justifyContent: "center",
    },
    title: {
      marginTop: 20,
      fontSize: isTablet ? 22 : 20,
      textAlign: "center",
      fontWeight: "600",
    },
    subtitle: {
      marginTop: 8,
      color: Colors[colorScheme].icon,
      textAlign: "center",
      fontSize: isTablet ? 18 : 16,
    },
    phonePill: {
      justifyContent: "center",
      alignContent: "center",
      marginTop: 20,
      alignSelf: "center", // <--- UBAH INI (sebelumnya flex-start)
      backgroundColor: Colors[colorScheme].primary,
      borderRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    phoneText: {
      color: Colors[colorScheme].background,
      fontSize: isTablet ? 18 : 16,
    },
    editButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors[colorScheme].primary,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 8,
    },
    counterText: {
      textAlign: "center",
      color: Colors[colorScheme].icon,
      marginTop: 12,
    },
  });

export default VerifyOtpScreen;
