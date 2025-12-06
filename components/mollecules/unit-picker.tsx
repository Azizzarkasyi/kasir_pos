import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { unitApi } from "@/services";
import { Unit } from "@/types/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import AddUnitModal from "../drawers/add-unit-modal";
import { ThemedButton } from "../themed-button";

 type UnitPickerProps = {
  label?: string;
  value: string; // unit ID
  onChange: (unitId: string) => void;
  size?: "sm" | "md" | "base";
 };

 const UnitPicker: React.FC<UnitPickerProps> = ({
  label = "Pilih Unit",
  value,
  onChange,
  size = "md",
 }) => {
  const colorScheme = useColorScheme() ?? "light";
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, size, isTablet);
  const [visible, setVisible] = React.useState(false);
  const [isAdd, setIsAdd] = React.useState(false);

  const focusAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, focusAnim]);

  const [loading, setLoading] = React.useState(false);
  const [unitList, setUnitList] = React.useState<Unit[]>([]);

  const loadUnits = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await unitApi.getUnits();
      if (response.data) {
        setUnitList(response.data);
      }
    } catch (error) {
      console.error("Failed to load units:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const openModal = () => {
    setIsAdd(false);
    setVisible(true);
    loadUnits();
  };

  const closeModal = () => {
    setVisible(false);
    setIsAdd(false);
  };

  const handleSubmit = async (unitName: string) => {
    try {
      setLoading(true);
      const response = await unitApi.createUnit({name: unitName});
      if (response.data) {
        await loadUnits();
        onChange(response.data.id);
      }
      setIsAdd(false);
      setVisible(false);
    } catch (error) {
      console.error("Failed to save unit:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedUnit = React.useMemo(() => {
    const unit = unitList.find(u => u.id === value);
    return unit ? unit.name : "";
  }, [value, unitList]);

  const labelTopRange: [number, number] =
    size === "sm" ? [14, -8] : size === "md" ? [16, -8] : [18, -8];

  const labelFontRange: [number, number] =
    size === "sm"
      ? isTablet ? [18, 14] : [14, 12]
      : size === "md"
      ? isTablet ? [20, 14] : [15, 12]
      : isTablet
      ? [22, 14]
      : [16, 12];

  const labelStyle = {
    top: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: labelTopRange,
    }),
    fontSize: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: labelFontRange,
    }),
    color: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        Colors[colorScheme].icon,
        Colors[colorScheme].primary,
      ],
    }),
    backgroundColor: Colors[colorScheme].background,
    paddingHorizontal: 4,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputLike}
        activeOpacity={0.7}
        onPress={openModal}
      >
        <Animated.Text style={[styles.floatingLabel, labelStyle]}>
          {label}
        </Animated.Text>
        <Text
          style={[
            styles.inputText,
            {
              color: value
                ? Colors[colorScheme].text
                : "transparent",
            },
          ]}
        >
          {selectedUnit || label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={isTablet ? 24 : 18}
          color={Colors[colorScheme].icon}
        />
      </TouchableOpacity>

      <AddUnitModal
        visible={Boolean(visible && isAdd)}
        onClose={() => {
          setIsAdd(false);
        }}
        onSubmit={handleSubmit}
        initialValue={undefined}
        label="Nama Unit"
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
              <Text style={styles.modalTitle}>Pilih Unit</Text>
            </View>

            <ScrollView style={styles.listContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="small"
                    color={Colors[colorScheme].primary}
                  />
                </View>
              ) : unitList.length === 0 ? (
                <Text
                  style={[
                    styles.listItemText,
                    {textAlign: "center", paddingVertical: 20},
                  ]}
                >
                  Belum ada unit
                </Text>
              ) : (
                unitList.map(item => (
                  <TouchableOpacity
                    key={item.id}
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
                ))
              )}
            </ScrollView>

            <ThemedButton
              size="sm"
              title="Tambah Unit"
              style={{marginTop: 8}}
              onPress={() => setIsAdd(true)}
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
  size: "sm" | "md" | "base",
  isTablet: boolean
 ) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginVertical: isTablet
        ? (size === "sm" ? 10 : size === "md" ? 12 : 14)
        : (size === "sm" ? 6 : size === "md" ? 8 : 10),
    },
    floatingLabel: {
      position: "absolute",
      left: isTablet ? 16 : 12,
      zIndex: 2,
    },
    inputLike: {
      borderWidth: 1,
      borderRadius: isTablet ? 10 : 8,
      borderColor: Colors[colorScheme].border,
      paddingHorizontal: isTablet
        ? (size === "sm" ? 14 : size === "md" ? 18 : 16)
        : (size === "sm" ? 10 : size === "md" ? 14 : 12),
      height: isTablet
        ? (size === "sm" ? 56 : size === "md" ? 62 : 68)
        : (size === "sm" ? 48 : size === "md" ? 52 : 56),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors[colorScheme].background,
    },
    inputText: {
      fontSize: isTablet
        ? (size === "sm" ? 18 : size === "md" ? 20 : 22)
        : (size === "sm" ? 14 : size === "md" ? 15 : 16),
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
      width: isTablet ? "70%" : "86%",
      maxWidth: isTablet ? 520 : 420,
      borderRadius: isTablet ? 16 : 12,
      paddingTop: isTablet ? 12 : 8,
      paddingHorizontal: isTablet ? 24 : 16,
      paddingBottom: isTablet ? 18 : 12,
      backgroundColor: Colors[colorScheme].background,
    },
    modalFooter: {
      marginTop: isTablet ? 16 : 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: Colors[colorScheme].border,
      paddingVertical: isTablet ? 16 : 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    modalHeader: {
      paddingVertical: isTablet ? 16 : 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors[colorScheme].border,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: isTablet ? 24 : 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    listContainer: {
      maxHeight: isTablet ? 340 : 260,
      marginTop: isTablet ? 8 : 4,
      marginBottom: isTablet ? 12 : 8,
    },
    loadingContainer: {
      paddingVertical: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    listItem: {
      paddingVertical: isTablet ? 14 : 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: Colors[colorScheme].border,
    },
    listItemText: {
      fontSize: isTablet ? 22 : 16,
      color: Colors[colorScheme].text,
    },
  });

 export default UnitPicker;
