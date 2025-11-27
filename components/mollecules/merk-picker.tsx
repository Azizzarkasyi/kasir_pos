import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AddMerkModal from "../drawers/add-merk-modal";
import { ThemedButton } from "../themed-button";

type MerkPickerProps = {
  label?: string;
  value: string;
  onChange: (merk: string) => void;
  size?: "sm" | "md" | "base";
  brands?: string[];
};

const defaultBrands: string[] = ["Tidak ada merk", "Qasir"];

const MerkPicker: React.FC<MerkPickerProps> = ({
  label = "Pilih Merk",
  value,
  onChange,
  size = "md",
  brands,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, size);
  const [visible, setVisible] = React.useState(false);

  const [isAdd, setIsAdd] = React.useState(false);
  const [editingValue, setEditingValue] = React.useState<string | undefined>(undefined);
  const [merkList, setMerkList] = React.useState<string[]>(brands && brands.length ? brands : defaultBrands);

  const openModal = () => {
    setIsAdd(false);
    setEditingValue(undefined);
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    setIsAdd(false);
    setEditingValue(undefined);
  };

  const handleSubmit = (merkName: string) => {
    setMerkList(prev => {
      const existsIndex = prev.findIndex(b => b === editingValue);

      // Edit existing merk
      if (editingValue && existsIndex !== -1) {
        const next = [...prev];
        next[existsIndex] = merkName;
        return next;
      }

      // Add new merk if not exists
      if (!prev.includes(merkName)) {
        return [...prev, merkName];
      }

      return prev;
    });

    onChange(merkName);
    setIsAdd(false);
    setEditingValue(undefined);
    setVisible(false);
  };

  const handleAddMerk = () => {
    setEditingValue(undefined);
    setIsAdd(true);
  };

  const handleEditMerk = (item: string) => {
    setEditingValue(item);
    setIsAdd(true);
  };

  const selectedMerk = value || "";

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputLike} activeOpacity={0.7} onPress={openModal}>
        <Text
          style={[
            styles.inputText,
            { color: value ? Colors[colorScheme].text : Colors[colorScheme].icon },
          ]}
        >
          {selectedMerk || label}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors[colorScheme].icon} />
      </TouchableOpacity>

      <AddMerkModal
        visible={Boolean(visible && isAdd)}
        onClose={() => {
          setIsAdd(false);
        }}
        onSubmit={handleSubmit}
        initialValue={editingValue}
        label="Nama Merk"
      />

      <Modal visible={visible && !isAdd} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalRoot}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeModal} />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Merk</Text>
            </View>

            <ScrollView style={styles.listContainer}>
              {merkList.map(item => (
                <View key={item} style={styles.listItemRow}>
                  <TouchableOpacity
                    style={styles.listItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      onChange(item);
                      closeModal();
                    }}
                  >
                    <Text
                      style={[
                        styles.listItemText,
                        item === value && {
                          color: Colors[colorScheme].primary,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editButton}
                    activeOpacity={0.7}
                    onPress={() => handleEditMerk(item)}
                  >
                    <AntDesign name="edit" size={20} color={Colors[colorScheme].primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <ThemedButton
              size="sm"
              title="Tambah Merk"
              style={{
                marginTop: 8,
              }}
              onPress={handleAddMerk}
            />
            <View style={styles.modalFooter}>
              <ThemedButton
                size="sm"
                variant="secondary"
                title="Batal"
                onPress={closeModal}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", size: "sm" | "md" | "base") =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginVertical: size === "sm" ? 6 : size === "md" ? 8 : 10,
    },
    label: {
      position: "absolute",
      top: size === "sm" ? 12 : size === "md" ? 12 : 16,
      left: 12,
      backgroundColor: Colors[colorScheme].background,
      paddingHorizontal: 4,
      zIndex: 2,
      color: Colors[colorScheme].primary,
      fontSize: size === "sm" ? 14 : size === "md" ? 14 : 16,
    },
    inputLike: {
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors[colorScheme].border,
      paddingHorizontal: size === "sm" ? 10 : size === "md" ? 14 : 12,
      height: size === "sm" ? 48 : size === "md" ? 52 : 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors[colorScheme].background,
    },
    inputText: {
      fontSize: size === "sm" ? 14 : size === "md" ? 15 : 16,
    },
    modalRoot: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalCard: {
      width: "86%",
      maxWidth: 420,
      borderRadius: 12,
      paddingTop: 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      backgroundColor: Colors[colorScheme].background,
    },
    modalHeader: {
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
    },
    modalFooter: {
      marginTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: Colors[colorScheme].border,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    listContainer: {
      maxHeight: 260,
      marginTop: 4,
      marginBottom: 8,
    },
    listItemRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors[colorScheme].border,
      justifyContent: "space-between",
    },
    listItem: {
      paddingVertical: 10,
    },
    listItemText: {
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    editButton: {
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    addButtonText: {
      fontSize: 14,
      color: Colors[colorScheme].primary,
      fontWeight: "500",
    },
    cancelButton: {
      marginTop: 4,
      alignSelf: "flex-end",
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    cancelText: {
      fontSize: 14,
      color: Colors[colorScheme].primary,
    },
  });

export default MerkPicker;

