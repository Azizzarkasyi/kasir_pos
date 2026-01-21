import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, StatusBar, StyleSheet, Text, View } from "react-native";

interface LoadingLoginScreenProps {
  text?: string; // text bersifat opsional
}

export default function LoadingLoginScreen({
  text = "Menyiapkan Toko Kamu...",
}: LoadingLoginScreenProps) {
  const colorScheme = useColorScheme() ?? "light";
  // 1. Inisialisasi nilai animasi (mulai dari 0)
  const progress = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    // 2. Menjalankan animasi saat komponen dimuat
    Animated.parallel([
      // Animasi Loading Bar (Width 0% -> 100%)
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000, // Durasi 3 detik
        useNativeDriver: false,
      }),
      // Animasi Fade In Logo (Opacity 0 -> 1)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  const animatedWidth = Animated.multiply(progress, barWidth || 1);

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: Colors[colorScheme].background},
      ]}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={Colors[colorScheme].background}
      />

      {/* Bagian Logo (Tengah) */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/logos/logo_elbic.png")}
          style={{width: 200, height: 200}}
          resizeMode="contain"
        />
      </View>

      {/* Bagian Loading Bar (Bawah) */}
      <View style={styles.footerContainer}>
        {/* Container Bar (Abu-abu) */}
        <View
          style={[
            styles.progressBarBackground,
            {backgroundColor: colorScheme === "dark" ? "#333" : "#E0E0E0"},
          ]}
          onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
        >
          {/* Isi Bar (Oranye - Bergerak) */}
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: animatedWidth,
                backgroundColor: Colors[colorScheme].primary,
              },
            ]}
          />
        </View>

        <Text style={[styles.loadingText, {color: Colors[colorScheme].icon}]}>
          Menyiapkan Toko Kamu...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between", // Membagi ruang atas dan bawah
    paddingVertical: 60, // Jarak aman dari atas dan bawah layar
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 48,
    fontWeight: "500", // Font weight sedang seperti di gambar
    color: "#FF5722", // Warna Oranye khas Qasir
    letterSpacing: 1,
  },
  footerContainer: {
    alignItems: "center",
    paddingHorizontal: 40, // Jarak kiri kanan loading bar
    width: "100%",
  },
  progressBarBackground: {
    height: 8, // Ketebalan garis
    width: 100,
    borderRadius: 3,
    overflow: "hidden", // Agar bar oranye tidak keluar dari radius
    position: "relative",
    marginBottom: 20,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "400",
  },
});
