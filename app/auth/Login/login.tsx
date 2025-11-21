import Header from "@/components/header";
import Logo from "@/components/logo";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React, {useState} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import CountryCodePicker from "@/components/country-code-picker";

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [credential, setCredential] = useState("");
  const [pin, setPin] = useState("");
  const [credentialError, setCredentialError] = useState("");
  const [pinError, setPinError] = useState("");

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

  // kode negara tidak digunakan; hanya bendera untuk tampilan

  const handleLogin = () => {
    let valid = true;
    if (credential.trim() === "") {
      setCredentialError(
        isPhoneLogin
          ? "No. Handphone tidak boleh kosong"
          : "Email tidak boleh kosong"
      );
      valid = false;
    } else {
      setCredentialError("");
    }

    if (pin.trim() === "") {
      setPinError("PIN tidak boleh kosong");
      valid = false;
    } else {
      setPinError("");
    }

    if (valid) {
      // Lanjutkan proses login
      const finalCredential = credential;
      console.log("Login diproses", finalCredential);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            {paddingBottom: insets.bottom},
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{backgroundColor: Colors[colorScheme].background}}
        >
          <Header />

          <Logo />

          <View style={styles.formContainer}>
            {isPhoneLogin ? (
              <View style={{flexDirection: "row", alignItems: "center"}}>
                <CountryCodePicker
                  value={countryCode}
                  onChange={setCountryCode}
                  items={countryItems}
                />
                <View style={{flex: 1, marginLeft: 12}}>
                  <ThemedInput
                    label="No. Handphone"
                    value={credential}
                    onChangeText={text => {
                      setCredential(text);
                      if (credentialError) setCredentialError("");
                    }}
                    keyboardType="phone-pad"
                    error={credentialError}
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

            <View style={{height: 20}} />

            <ThemedInput
              label="No PIN"
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
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
      marginTop: 20,
    },
    footer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    footerText: {
      color: Colors[colorScheme].icon,
    },
  });
