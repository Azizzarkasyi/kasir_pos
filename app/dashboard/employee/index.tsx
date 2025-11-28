import EmployeeCard from "@/components/employee-card";
import { ThemedInput } from "@/components/themed-input";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function EmployeeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [search, setSearch] = useState("");

  // Mock data for employees
  const [employees] = useState([
    { id: "1", name: "Budi Santoso", phone: "081234567890", role: "Kasir" },
    { id: "2", name: "Siti Aminah", phone: "089876543210", role: "Admin" },
    { id: "3", name: "Joko Widodo", phone: "081122334455", role: "Staff" },
  ]);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(search.toLowerCase())
  );

  const goAdd = () => {
    router.push("/dashboard/employee/add" as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <ThemedInput
              label="Cari Pegawai"
              value={search}
              onChangeText={setSearch}
              size="sm"
              leftIconName="search"
              width="100%"
              showLabel={false}
              placeholder="Cari Pegawai"
            />
          </View>
        </View>

        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100, marginTop: 16 }}
          renderItem={({ item }) => (
            <EmployeeCard
              initials={item.name.slice(0, 2).toUpperCase()}
              name={item.name}
              phone={item.phone}
              role={item.role}
              onPress={() => {
                // Handle employee press if needed
              }}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons
                name="people-outline"
                size={48}
                color={Colors[colorScheme].icon}
              />
            </View>
          }
        />
      </View>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={goAdd}
      >
        <Ionicons name="add" size={28} color={Colors[colorScheme].background} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 16,
    },
    fab: {
      position: "absolute",
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme].primary,
      elevation: 6,
    },
  });
