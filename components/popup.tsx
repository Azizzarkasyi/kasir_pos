import React, {useState} from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose} // Untuk tombol back di Android
    >
      {/* Overlay Gelap */}
      <View style={styles.overlay}>
        {/* Container Kartu */}
        <View style={styles.card}>
          {/* Judul */}
          <Text style={styles.title}>Ganti No. Handphone</Text>

          {/* Input Area dengan Floating Label */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad" // Keyboard khusus angka/telepon
            />

            {/* Label Floating (Posisi Absolute di atas Border) */}
            <View style={styles.floatingLabelContainer}>
              <Text style={styles.floatingLabelText}>No. Handphone</Text>
            </View>
          </View>

          {/* Container Tombol */}
          <View style={styles.buttonContainer}>
            {/* Tombol Batal */}
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
            >
              <Text style={styles.textCancel}>Batal</Text>
            </TouchableOpacity>

            {/* Tombol Simpan */}
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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Latar belakang gelap transparan
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    // Shadow untuk iOS
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Shadow untuk Android
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 24,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 30,
    justifyContent: "center",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  // Trik untuk membuat label "memotong" border
  floatingLabelContainer: {
    position: "absolute",
    top: -10, // Naikkan ke atas border
    left: 10,
    backgroundColor: "white", // Wajib bg putih agar menutupi garis border di belakangnya
    paddingHorizontal: 4,
    zIndex: 1,
  },
  floatingLabelText: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12, // Gap support di RN versi baru (atau gunakan marginHorizontal pada button)
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancel: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  buttonSave: {
    backgroundColor: "#FF5722", // Warna Oranye sesuai gambar
  },
  textCancel: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  textSave: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default ChangePhoneModal;
