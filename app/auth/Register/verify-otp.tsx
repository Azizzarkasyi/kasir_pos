import Header from "@/components/header";
import OtpInput from "@/components/otp-input";
import ChangePhoneModal from "@/components/popup";
import {ThemedButton} from "@/components/themed-button";
import {ThemedText} from "@/components/themed-text";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React, {useEffect, useState} from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

const VerifyOtpScreen = () => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);

  const [phone] = useState("+6285152566988");
  const [countdown, setCountdown] = useState(60);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleResend = () => {
    setCountdown(60);
    // TODO: trigger resend SMS via API
  };
  const [isModalVisible, setModalVisible] = useState(false);

  const handleSave = (number: string) => {
    console.log("Nomor baru:", number);
    setModalVisible(false);
  };
  // Modal ditampilkan melalui state isModalVisible
  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header />
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
          <ThemedText type="title" style={styles.title}>
            Kode Verifikasi Telah Dikirim
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Cek kodenya di pesan SMS yang dikirim ke nomor dibawah ini.
          </ThemedText>

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
          {code ? (
            <ThemedText style={{textAlign: "center"}}>Kode: {code}</ThemedText>
          ) : null}

          <ThemedText style={styles.counterText}>
            Kirim ulang kode dalam 00 : {String(countdown).padStart(2, "0")}
          </ThemedText>

          <ThemedButton
            title="Kirim Ulang SMS"
            onPress={handleResend}
            disabled={countdown > 0}
            style={{marginTop: 24}}
          />
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
    },
    content: {
      flex: 1,
    },
    title: {
      marginTop: 20,
    },
    subtitle: {
      marginTop: 8,
      color: Colors[colorScheme].icon,
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
      gap: 8,
    },
    phoneText: {
      color: Colors[colorScheme].background,
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
