import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useProductFormStore } from "@/stores/product-form-store";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

export default function AddBarcodeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const router = useRouter();
  const setBarcode = useProductFormStore(state => state.setBarcode);

  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");
  const [scanned, setScanned] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const result = await requestPermission();
        if (!isMounted || !result) return;

        if (!result.granted) {
          setHasPermission("denied");
          router.back();
        } else {
          setHasPermission("granted");
        }
      } catch (e) {
        if (!isMounted) return;
        setHasPermission("denied");
        router.back();
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [requestPermission, router]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [scanAnim]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    console.log("Barcode scanned:", data);

    setBarcode(String(data));
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        {hasPermission === "granted" && !scanned ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
          />
        ) : null}

        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.mask} />
          <View style={styles.centerRow}>
            <View style={styles.mask} />
            <View style={styles.scanBox}>
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [
                      {
                        translateY: scanAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 276],
                        }),
                      },
                    ],
                    opacity: scanAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1, 0],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.mask} />
          </View>
          <View style={styles.mask} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[colorScheme].background,
    },
    scannerContainer: {
      flex: 1,
      backgroundColor: "#000",
      position: "relative",
      overflow: "hidden",
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    centerRow: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
    },
    mask: {
      flex: 1,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.52)",
    },
    scanBox: {
      width: 300,
      height: 300,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    scanLine: {
      position: "absolute",
      left: 12,
      right: 12,
      top: 12,
      height: 1,
      backgroundColor: "#ff0000ff",
      borderRadius: 999,
    },
  });

