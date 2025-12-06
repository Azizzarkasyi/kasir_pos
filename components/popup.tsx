import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";

interface ChangePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newNumber: string) => void;
  initialValue?: string;
}

const ChangePhoneModal: React.FC<ChangePhoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValue = "+62 88217069612",
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialValue);
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose} // Untuk tombol back di Android
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Ganti No. Handphone</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad" // Keyboard khusus angka/telepon
            />

            <View style={styles.floatingLabelContainer}>
              <Text style={styles.floatingLabelText}>No. Handphone</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.textCancel}>Batal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSave]}
              onPress={() => onSave(phoneNumber)}
            >
              <Text style={styles.textSave}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colorScheme: "light" | "dark", isTablet: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)", // Latar belakang gelap transparan
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    card: {
      width: "100%",
      maxWidth: isTablet ? 420 : 340,
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 12,
      padding: isTablet ? 28 : 24,
      // Shadow untuk iOS
      shadowColor: Colors[colorScheme].shadow,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      // Shadow untuk Android
      elevation: 5,
    },
    title: {
      fontSize: isTablet ? 20 : 18,
      fontWeight: "700",
      color: Colors[colorScheme].text,
      marginBottom: 24,
    },
    inputContainer: {
      position: "relative",
      marginBottom: 30,
      justifyContent: "center",
    },
    input: {
      height: isTablet ? 56 : 50,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
      borderRadius: 6,
      paddingHorizontal: 12,
      fontSize: isTablet ? 18 : 16,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
    },
    // Trik untuk membuat label "memotong" border
    floatingLabelContainer: {
      position: "absolute",
      top: -10, // Naikkan ke atas border
      left: 10,
      backgroundColor: Colors[colorScheme].background, // Wajib bg putih agar menutupi garis border di belakangnya
      paddingHorizontal: 4,
      zIndex: 1,
    },
    floatingLabelText: {
      fontSize: isTablet ? 13 : 12,
      color: Colors[colorScheme].icon,
      fontWeight: "500",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12, // Gap support di RN versi baru (atau gunakan marginHorizontal pada button)
    },
    button: {
      flex: 1,
      paddingVertical: isTablet ? 14 : 12,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonCancel: {
      backgroundColor: Colors[colorScheme].background,
      borderWidth: 1,
      borderColor: Colors[colorScheme].border,
    },
    buttonSave: {
      backgroundColor: Colors[colorScheme].primary, // Warna utama theme
    },
    textCancel: {
      color: Colors[colorScheme].icon,
      fontWeight: "600",
      fontSize: isTablet ? 15 : 14,
    },
    textSave: {
      color: Colors[colorScheme].background,
      fontWeight: "600",
      fontSize: isTablet ? 15 : 14,
    },
  });

export default ChangePhoneModal;
