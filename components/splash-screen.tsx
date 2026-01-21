import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useMemo, useRef } from "react"; // Tambahkan useMemo
import {
    Animated,
    Easing,
    Image,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";

// --- KUMPULAN KATA-KATA MUTIARA/SEMANGAT ---
const LOADING_MESSAGES = [
  "Siap melariskan daganganmu...",
  "Menjemput rezeki hari ini...",
  "Halo Juragan, siap beraksi?",
  "Buka toko, buka peluang...",
  "Menyiapkan meja kasirmu...",
  "Semoga hari ini laris manis!",
  "Toko siap, rezeki pun datang...",
  "Membuka pintu rezeki...",
  "Selamat datang kembali, Juragan!",
  "Persiapkan dagangan terbaikmu...",
  "Waktunya berjualan dengan semangat!",
  "Mari kita mulai petualangan jualan!",
  "Apa kabar? Yuk mulai jualan.",
  "Mengoptimalkan performa toko...",
];

const LOGO_SIZE = 150;

export default function SplashScreen() {
  // Hapus prop text static
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  // --- MEMILIH TEKS SECARA ACAK SAAT PERTAMA LOAD ---
  const randomText = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * LOADING_MESSAGES.length);
    return LOADING_MESSAGES[randomIndex];
  }, []);

  const textColor = isDark ? "#FFFFFF" : "#4CAF50";
  const emptyColor = isDark ? "#333333" : "#E0E0E0";

  const entranceAnim = useRef(new Animated.Value(0)).current;
  const textEntranceAnim = useRef(new Animated.Value(0)).current;
  const fillProgress = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(0)).current;

  const logoSource = require("../assets/logos/logo_elbic.png");

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(entranceAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(textEntranceAnim, {
          toValue: 1,
          duration: 800,
          delay: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fillProgress, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(breathAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(breathAnim, {
              toValue: 0,
              duration: 1000,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]).start();
  }, []);

  // ... (Sisa kode style animasi sama seperti sebelumnya) ...
  const entranceStyle = {
    opacity: entranceAnim,
    transform: [
      {
        scale: entranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
  };

  const textStyle = {
    opacity: textEntranceAnim,
    transform: [
      {
        translateY: textEntranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const heightAnim = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, LOGO_SIZE],
  });

  const breathStyle = {
    transform: [
      {
        scale: breathAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.03],
        }),
      },
    ],
    opacity: breathAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.6],
    }),
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: Colors[colorScheme].background},
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={Colors[colorScheme].background}
      />

      <View style={styles.centerContent}>
        <Animated.View style={[styles.logoWrapper, entranceStyle]}>
          <Animated.Image
            source={logoSource}
            style={[styles.logoBase, {tintColor: emptyColor}, breathStyle]}
            resizeMode="contain"
          />

          <Animated.View
            style={[styles.overflowContainer, {height: heightAnim}]}
          >
            <Image
              source={logoSource}
              style={styles.logoFill}
              resizeMode="contain"
            />
          </Animated.View>
        </Animated.View>

        {/* MENGGUNAKAN RANDOM TEXT */}
        <Animated.Text
          style={[styles.loadingText, {color: textColor}, textStyle]}
        >
          {randomText}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Style tetap sama, copy paste dari sebelumnya)
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  logoBase: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    position: "absolute",
  },
  overflowContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: LOGO_SIZE,
    overflow: "hidden",
    justifyContent: "flex-end",
    zIndex: 2,
  },
  logoFill: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    position: "absolute",
    bottom: 0,
  },
  loadingText: {
    fontSize: 14,
    letterSpacing: 0.8,
  },
});
