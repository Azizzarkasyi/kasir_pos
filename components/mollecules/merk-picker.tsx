import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {AntDesign, Ionicons} from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddMerkModal from "../drawers/add-merk-modal";
import {ThemedButton} from "../themed-button";
import {merkApi} from "@/services";
import {Merk} from "@/types/api";

type MerkPickerProps = {
  label?: string;
  value: string; // merk ID
  onChange: (merkId: string) => void;
  size?: "sm" | "md" | "base";
};

const MerkPicker: React.FC<MerkPickerProps> = ({
  label = "Pilih Merk",
  value,
  onChange,
  size = "md",
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, size);
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [isAdd, setIsAdd] = React.useState(false);
  const [editingMerk, setEditingMerk] = React.useState<Merk | undefined>(
    undefined
  );
  const [merkList, setMerkList] = React.useState<Merk[]>([]);

  // Load merks from API
  const loadMerks = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await merkApi.getMerks();
      if (response.data) {
        setMerkList(response.data);
      }
    } catch (error) {
      console.error("Failed to load merks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load merks on mount
  React.useEffect(() => {
    loadMerks();
  }, [loadMerks]);

  const openModal = () => {
    setIsAdd(false);
    setEditingMerk(undefined);
    setVisible(true);
    loadMerks(); // Refresh merks when opening
  };

  const closeModal = () => {
    setVisible(false);
    setIsAdd(false);
    setEditingMerk(undefined);
  };

  const handleSubmit = async (merkName: string) => {
    try {
      setLoading(true);

      if (editingMerk) {
        // Update existing merk
        const response = await merkApi.updateMerk(editingMerk.id, {
          name: merkName,
        });
        if (response.data) {
          await loadMerks();
          onChange(response.data.id);
        }
      } else {
        // Create new merk
        const response = await merkApi.createMerk({name: merkName});
        if (response.data) {
          await loadMerks();
          onChange(response.data.id);
        }
      }

      setIsAdd(false);
      setEditingMerk(undefined);
      setVisible(false);
    } catch (error) {
      console.error("Failed to save merk:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMerk = () => {
    setEditingMerk(undefined);
    setIsAdd(true);
  };

  const handleEditMerk = (item: Merk) => {
    setEditingMerk(item);
    setIsAdd(true);
  };

  const selectedMerk = React.useMemo(() => {
    const merk = merkList.find(m => m.id === value);
    return merk ? merk.name : "";
  }, [value, merkList]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputLike}
        activeOpacity={0.7}
        onPress={openModal}
      >
        <Text
          style={[
            styles.inputText,
            {
              color: value
                ? Colors[colorScheme].text
                : Colors[colorScheme].icon,
            },
          ]}
        >
          {selectedMerk || label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={Colors[colorScheme].icon}
        />
      </TouchableOpacity>

      <AddMerkModal
        visible={Boolean(visible && isAdd)}
        onClose={() => {
          setIsAdd(false);
        }}
        onSubmit={handleSubmit}
        initialValue={editingMerk?.name}
        label="Nama Merk"
      />

      <Modal
        visible={visible && !isAdd}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalRoot}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeModal}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Merk</Text>
            </View>

            <ScrollView style={styles.listContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={Colors[colorScheme].primary}
                  />
                </View>
              ) : merkList.length === 0 ? (
                <Text
                  style={[
                    styles.listItemText,
                    {textAlign: "center", paddingVertical: 20},
                  ]}
                >
                  Belum ada merk
                </Text>
              ) : (
                merkList.map(item => (
                  <View key={item.id} style={styles.listItemRow}>
                    <TouchableOpacity
                      style={styles.listItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        onChange(item.id);
                        closeModal();
                      }}
                    >
                      <Text
                        style={[
                          styles.listItemText,
                          item.id === value && {
                            color: Colors[colorScheme].primary,
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editButton}
                      activeOpacity={0.7}
                      onPress={() => handleEditMerk(item)}
                    >
                      <AntDesign
                        name="edit"
                        size={20}
                        color={Colors[colorScheme].primary}
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
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

const createStyles = (
  colorScheme: "light" | "dark",
  size: "sm" | "md" | "base"
) =>
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
    loadingContainer: {
      paddingVertical: 20,
      alignItems: "center",
      justifyContent: "center",
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
