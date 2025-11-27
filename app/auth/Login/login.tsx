import CountryCodePicker from "@/components/country-code-picker";
import Header from "@/components/header";
import Logo from "@/components/logo";
import SplashScreen from "@/components/splash-screen";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
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
  const [pinError, setPinError] = useState("");
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const styles = createStyles(colorScheme);
  const countryItems = [
    {label: "Indonesia", value: "🇮🇩"},
    {label: "Malaysia", value: "🇲🇾"},
    {label: "Singapore", value: "🇸🇬"},
    {label: "Thailand", value: "🇹🇭"},
    {label: "Philippines", value: "🇵🇭"},
    {label: "Brunei", value: "🇧🇳"},
  ];
  const [countryCode, setCountryCode] = useState(countryItems[0].value);

  const handleLogin = () => {
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
    }

    if (pin.trim() === "") {
      setPinError("PIN tidak boleh kosong");
      valid = false;
    }

    // 2. Jika Valid, baru jalankan proses Login
    if (valid) {
      // A. Tutup Keyboard SECARA PAKSA di sini
      Keyboard.dismiss();

      // B. Tampilkan Loading Screen
      setIsLoggingIn(true);

      // C. Proses Login (Simulasi)
      const finalCredential = credential;
      console.log("Login diproses", finalCredential);

      setTimeout(() => {
        setIsLoggingIn(false);
        router.replace("/dashboard/home" as never);
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <Header withShadow={false} />
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
        <Logo />

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
            keyboardType="number-pad"
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

        <View style={styles.footer}>
          <TouchableOpacity>
            <ThemedText style={styles.footerText}>Lupa PIN ?</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Overlay Loading */}
      {isLoggingIn ? (
        <View style={styles.overlay}>
          <SplashScreen />
        </View>
      ) : null}
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
      flexGrow: 1,
      paddingHorizontal: 20,
      justifyContent: "space-between",
    },
    formContainer: {
      flex: 1,
    },
    toggleLoginText: {
      color: Colors[colorScheme].icon,
      textAlign: "center",
      marginTop: 8,
      fontSize: 14,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    footerText: {
      color: Colors[colorScheme].icon,
      fontSize: 14,
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
