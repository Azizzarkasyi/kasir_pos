import Header from "@/components/header";
import Logo from "@/components/logo";
import {ThemedButton} from "@/components/themed-button";
import {ThemedInput} from "@/components/themed-input";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import React, {useState} from "react";
import {KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const insets = useSafeAreaInsets();
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [credential, setCredential] = useState("");
  const [pin, setPin] = useState("");
  const [credentialError, setCredentialError] = useState("");
  const [pinError, setPinError] = useState("");

  const styles = createStyles(colorScheme);

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
      console.log("Login diproses");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View
        style={[
          styles.container,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Header />

          <Logo />

          <View style={styles.formContainer}>
            <ThemedInput
              label={isPhoneLogin ? "No. Handphone" : "Email"}
              value={credential}
              onChangeText={text => {
                setCredential(text);
                if (credentialError) setCredentialError("");
              }}
              keyboardType={isPhoneLogin ? "phone-pad" : "email-address"}
              error={credentialError}
            />

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
