import SmallLogo from "@/components/atoms/logo-sm";
import CountryCodePicker from "@/components/country-code-picker";
import LoadingLoginScreen from "@/components/loading-login";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useBranchStore } from "@/stores/branch-store";
import { useTaxStore } from "@/stores/tax-store";
import { useUserStore } from "@/stores/user-store";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [credential, setCredential] = useState("");
  const [pin, setPin] = useState("");
  const [credentialError, setCredentialError] = useState("");
  const {setCurrentBranch} = useBranchStore();
  const {setUser, startPeriodicFetch} = useUserStore();
  const [pinError, setPinError] = useState("");
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;

  const styles = createStyles(colorScheme, isTablet);
  const countryItems = [
    {label: "Indonesia", value: "🇮🇩"},
    {label: "Malaysia", value: "🇲🇾"},
    {label: "Singapore", value: "🇸🇬"},
    {label: "Thailand", value: "🇹🇭"},
    {label: "Philippines", value: "🇵🇭"},
    {label: "Brunei", value: "🇧🇳"},
  ];
  const [countryCode, setCountryCode] = useState(countryItems[0].value);

  const handleLogin = async () => {
    // Reset error state dulu
    setCredentialError("");
    setPinError("");

    let valid = true;

    // 1. Validasi Input
    if (credential.trim() === "") {
      setCredentialError(
        isPhoneLogin
          ? "No. Handphone tidak boleh kosong"
          : "Email tidak boleh kosong"
      );
      valid = false;
    } else if (!isPhoneLogin) {
      // Validasi format email jika login dengan email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credential)) {
        setCredentialError("Format email tidak valid");
        valid = false;
      }
    } else if (isPhoneLogin) {
      // Validasi format phone minimal 10 digit
      if (credential.length < 10) {
        setCredentialError("No. Handphone minimal 10 digit");
        valid = false;
      }
    }

    if (pin.trim() === "") {
      setPinError("PIN tidak boleh kosong");
      valid = false;
    } else if (pin.length < 6) {
      setPinError("PIN minimal 6 digit");
      valid = false;
    }

    // 2. Jika Valid, baru jalankan proses Login
    if (valid) {
      // A. Tutup Keyboard SECARA PAKSA di sini
      Keyboard.dismiss();

      // B. Tampilkan Loading Screen
      setIsLoggingIn(true);

      try {
        // C. Proses Login dengan API
        console.log(
          "🔄 Attempting login with:",
          credential,
          "isPhone:",
          isPhoneLogin
        );

        // Import authApi di bagian atas file
        const {authApi} = await import("@/services");

        const result = await authApi.login(credential, pin, isPhoneLogin);

        console.log("✅ Login success:", result);
        console.log("🔑 Token saved:", result.access_token ? "Yes" : "No");

        // Jika user belum verifikasi, arahkan ke halaman Verify OTP
        const isVerifiedFlag = (result.user as any)?.is_verified;
        if (isVerifiedFlag === 0 || isVerifiedFlag === false) {
          setIsLoggingIn(false);
          router.push({
            pathname: "/auth/Register/verify-otp",
            params: {phone: result.user?.phone || ""},
          } as never);
          return;
        }

        // Save branch ID and name to AsyncStorage
        if (result.branch?.id) {
          setCurrentBranch({
            id: result.branch.id,
            name: result.branch.name,
          });
        }

        // Save user data to store (including plan and role)
        if (result.user) {
          setUser(result.user);
          console.log("✅ User data saved to store:", result.user);
        }

        // Save user role to AsyncStorage (backward compatibility)
        if (result.user?.role) {
          const AsyncStorage = await import(
            "@react-native-async-storage/async-storage"
          );
          await AsyncStorage.default.setItem(
            "user_role",
            result.user.role
          );
          console.log("✅ User role saved:", result.user.role);
        }

        // D. Navigate ke dashboard jika berhasil dan sudah terverifikasi
        setIsLoggingIn(false);
        
        // Start periodic user data fetching
        startPeriodicFetch();
        
        // Fetch tax rate after successful login
        useTaxStore.getState().fetchTaxRate();
        
        router.replace("/dashboard/home" as never);
      } catch (error: any) {
        console.error("❌ Login failed:", error);

        setIsLoggingIn(false);

        // Tampilkan error ke user
        if (error.code === 401) {
          setPinError("No. Handphone atau PIN salah");
        } else if (error.code === 404) {
          setCredentialError("Akun tidak ditemukan");
        } else if (error.code === 400 && error.errors) {
          // Validation errors
          if (error.errors.pin) {
            setPinError(error.errors.pin[0]);
          } else if (error.errors.phone) {
            setCredentialError(error.errors.phone[0]);
          } else if (error.errors.email) {
            setCredentialError(error.errors.email[0]);
          } else {
            setPinError("Data tidak valid. Periksa kembali input Anda.");
          }
        } else if (error.message) {
          setPinError(error.message);
        } else {
          setPinError("Gagal login. Periksa koneksi internet Anda.");
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* <Header withShadow={false}  /> */}
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {paddingBottom: insets.bottom},
        ]}
        enableOnAndroid
        keyboardOpeningTime={0}
        extraScrollHeight={Platform.OS === "ios" ? 16 : 24}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{backgroundColor: Colors[colorScheme].background}}
      >
        <Image
          source={require("@/assets/ilustrations/login.png")}
          style={styles.loginIlustration}
        />

        <View style={styles.formContainer}>
          {isPhoneLogin ? (
            <View style={{flexDirection: "row", alignItems: "flex-start"}}>
              <CountryCodePicker
                value={countryCode}
                onChange={setCountryCode}
                items={countryItems}
              />
              <View style={{flex: 1, marginLeft: 8}}>
                <ThemedInput
                  label="No. Handphone"
                  value={credential}
                  onChangeText={text => {
                    setCredential(text);
                    if (credentialError) setCredentialError("");
                  }}
                  keyboardType="phone-pad"
                  error={credentialError}
                  containerStyle={{marginTop: 0}}
                />
              </View>
            </View>
          ) : (
            <ThemedInput
              label="Email"
              value={credential}
              onChangeText={text => {
                setCredential(text);
                if (credentialError) setCredentialError("");
              }}
              keyboardType="email-address"
              error={credentialError}
            />
          )}
          <ThemedInput
            label="PIN"
            value={pin}
            onChangeText={text => {
              setPin(text);
              if (pinError) setPinError("");
            }}
            numericOnly
            error={pinError}
            isPassword={true}
          />

          <TouchableOpacity onPress={() => setIsPhoneLogin(!isPhoneLogin)}>
            <ThemedText style={styles.toggleLoginText}>
              Masuk menggunakan {isPhoneLogin ? "Email" : "No. Handphone"}?
            </ThemedText>
          </TouchableOpacity>

          <ThemedButton
            title="Masuk"
            style={{marginTop: 32}}
            onPress={handleLogin}
          />
        </View>

        <View style={{marginTop: isTablet ? 20 : 0}}>
          <SmallLogo />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity>
            <ThemedText style={styles.footerText}>Lupa PIN ?</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Overlay Loading */}
      {isLoggingIn ? (
        <View style={styles.overlay}>
          <LoadingLoginScreen />
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    loginIlustration: {
      width: isTablet ? 450 : 300,
      height: isTablet ? 450 : 300,
      resizeMode: "contain",
      marginTop: isTablet ? 0 : 100,
      marginBottom: isTablet ? 20 : 0,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: 20,
      justifyContent: isTablet ? "center" : "space-between",
      alignItems: "center",
    },
    formContainer: {
      marginTop: -80,
      flexShrink: 0,
      width: "100%",
      maxWidth: isTablet ? 480 : 400,
      alignSelf: "center",
    },
    toggleLoginText: {
      color: Colors[colorScheme].icon,
      textAlign: "center",
      marginTop: 8,
      fontSize: isTablet ? 16 : 14,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    footerText: {
      color: Colors[colorScheme].icon,
      fontSize: isTablet ? 16 : 14,
      fontWeight: "500",
    },
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      elevation: 12,
      backgroundColor: Colors[colorScheme].background,
      alignItems: "center", // Pastikan splash screen di tengah
      justifyContent: "center",
    },
  });
