import { ThemedButton } from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const colorScheme = useColorScheme() ?? "light";
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);
  const screenWidth = Dimensions.get("window").width;

  const slides = [
    {
      id: 0,
      title: "Cukup 2 menit untuk registrasi",
      description:
        "Daftarin usahamu untuk catat transaksi dan pantau laporan penjualan.",
      image: require("../assets/ilustrations/registration.webp"),

      width: 250,
      height: 250,
    },
    {
      id: 1,
      title: "Satu akun untuk banyak cabang",
      description:
        "Kelola beberapa cabang usaha dalam satu aplikasi. Pantau performa tiap toko tanpa harus datang ke lokasi.",
      image: require("../assets/ilustrations/multi-branch.png"),
      width: 300,
      height: 300,
    },
    {
      id: 2,
      title: "Produk rapi, transaksi otomatis tercatat",
      description:
        "Atur katalog produk, harga, dan stok dengan mudah. Setiap transaksi langsung tercatat rapi di laporan.",
      image: require("../assets/ilustrations/inventory-transaction.png"),
      width: 200,
      height: 200,
    },
  ];

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const index = Math.round(contentOffset.x / layoutMeasurement.width);
    setActiveSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => {
        const nextIndex = (prev + 1) % slides.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            x: nextIndex * screenWidth,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [screenWidth, slides.length]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}

        >
          {slides.map(slide => (
            <View key={slide.id} style={[styles.slide, { width: screenWidth }]}>
              <View style={styles.imageContainer}>
                <Image
                  source={slide.image}
                  style={[styles.ilustration, { width: slide.width, height: slide.height }]}
                />
              </View>
              <View style={styles.textContainer}>
                <ThemedText type="subtitle-2" style={styles.title}>
                  {slide.title}
                </ThemedText>
                <ThemedText
                  style={[styles.subtitle, { color: Colors[colorScheme].icon }]}
                >
                  {slide.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.dotsContainer}>
          {slides.map((slide, index) => (
            <View
              key={slide.id}
              style={[
                styles.dot,
                index === activeSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="Daftar Sekarang"
          variant="primary"
          onPress={() =>
            navigation.navigate("auth/Register/select-country" as never)
          }
        />
        <ThemedButton
          title="Masuk"
          variant="secondary"
          style={{ marginTop: 16 }}
          onPress={() => navigation.navigate("auth/Login/login" as never)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20
  },
  carouselContainer: {
    width: "100%",
    flex: 1,
  },
  slide: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",

    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  imageContainer: {
    flexDirection: "column",
    borderRadius: 10,
    alignItems: "center",
  },
  ilustration: {
    width: 250,
    height: 250,
  },
  textContainer: {
    marginTop: 50,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 20,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
    paddingBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E1E3E8",
  },
  dotActive: {
    backgroundColor: Colors.light.primary,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
});
