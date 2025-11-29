import Header from "@/components/header";
import OtpInput from "@/components/otp-input";
import ChangePhoneModal from "@/components/popup";
import {ThemedButton} from "@/components/themed-button";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React, {useEffect, useState} from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {useLocalSearchParams, useRouter} from "expo-router";
import {authApi} from "@/services";

const VerifyOtpScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
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

      // Panggil API request OTP
      const response = await fetch(
        `http://10.0.2.2:3001/api/v1/auth/otp/request`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({phone: phoneNumber}),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log("✅ OTP sent successfully");
        // Jika development mode, tampilkan OTP
        if (result.data?.otp) {
          Alert.alert(
            "OTP Dikirim",
            `Kode OTP: ${result.data.otp}\n\n(Hanya di development mode)`
          );
        }
      } else {
        throw new Error(result.message || "Gagal mengirim OTP");
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

      const response = await fetch(
        `http://10.0.2.2:3001/api/v1/auth/otp/validate`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            phone: phone,
            otp: code,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.data?.access_token) {
        console.log("✅ OTP verified successfully");

        // Simpan token
        await authApi.setToken?.(result.data.access_token);

        Alert.alert("Berhasil!", "Akun Anda berhasil terdaftar", [
          {
            text: "OK",
            onPress: () => router.replace("/dashboard/home"),
          },
        ]);
      } else {
        throw new Error(result.message || "Kode OTP tidak valid");
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
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Daftar" />
      <KeyboardAwareScrollView
        contentContainerStyle={{paddingHorizontal: 20}}
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
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.editButton}
              >
                <Ionicons
                  name="pencil"
                  size={18}
                  color={Colors[colorScheme].background}
                />
              </TouchableOpacity>
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

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    content: {
      flex: 1,
      paddingVertical: 20,
      justifyContent: "center",
    },
    title: {
      marginTop: 20,
      fontSize: 20,
      textAlign: "center",
      fontWeight: "600",
    },
    subtitle: {
      marginTop: 8,
      color: Colors[colorScheme].icon,
      textAlign: "center",
      fontSize: 16,
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
      fontSize: 16,
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
    },
  });

export default VerifyOtpScreen;
