import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
    Alert,
    Image,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import { ThemedText } from "./themed-text";

interface ImageUploadProps {
  uri?: string | null;
  initials?: string;
  onPress?: () => void;
  onImageSelected?: (uri: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  uri,
  initials = "NP",
  onPress,
  onImageSelected,
  disabled = false,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  const handlePickImage = async () => {
    if (disabled) return;

    // Custom onPress handler
    if (onPress) {
      onPress();
      return;
    }

    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Izin Diperlukan",
          "Aplikasi memerlukan izin untuk mengakses galeri foto"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false, // Disable EXIF to prevent rendering issues
        legacy: true, // Use legacy mode for better Android compatibility
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        console.log("📸 Image selected:", {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
        });

        // Only preview image, don't upload yet
        // Parent component will handle upload when user clicks save button
        onImageSelected?.(asset.uri);
      }
    } catch (error: any) {
      console.error("❌ Failed to pick image:", error);
      Alert.alert("Error", "Gagal memilih gambar");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.square}>
        {uri ? (
          <Image source={{uri}} style={styles.image} />
        ) : (
          <ThemedText style={styles.initials}>{initials}</ThemedText>
        )}
        <TouchableOpacity
          style={[styles.cameraBtn, disabled && styles.cameraBtnDisabled]}
          onPress={handlePickImage}
          disabled={disabled}
        >
          <Ionicons
            name="camera"
            size={isTablet ? 28 : 20}
            color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      marginTop: isTablet ? 20 : 12,
      marginBottom: isTablet ? 20 : 12,
    },
    square: {
      width: isTablet ? 140 : 104,
      height: isTablet ? 140 : 104,
      borderRadius: isTablet ? 12 : 8,
      backgroundColor: Colors[colorScheme].border,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: isTablet ? 12 : 8,
    },
    initials: {
      fontSize: isTablet ? 40 : 28,
      fontWeight: "700",
      color: Colors[colorScheme].background,
    },
    cameraBtn: {
      position: "absolute",
      bottom: isTablet ? -20 : -16,
      right: isTablet ? -24 : -20,
      width: isTablet ? 52 : 40,
      height: isTablet ? 52 : 40,
      borderRadius: isTablet ? 26 : 20,
      backgroundColor: Colors[colorScheme].background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      shadowColor: Colors[colorScheme].shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderColor: Colors[colorScheme].border,
    },
    cameraBtnDisabled: {
      opacity: 0.5,
    },
  });

export default ImageUpload;
