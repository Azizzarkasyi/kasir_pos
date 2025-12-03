import EmployeeCard from "@/components/employee-card";
import Header from "@/components/header";
import {ThemedInput} from "@/components/themed-input";
import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import employeeApi from "@/services/endpoints/employees";
import {Employee} from "@/types/api";
import {Ionicons} from "@expo/vector-icons";
import {useFocusEffect, useRouter} from "expo-router";
import React, {useCallback, useState} from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function EmployeeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [])
  );

  const loadEmployees = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await employeeApi.getEmployees({
        search: search || undefined,
      });

      if (response.data) {
        setEmployees(response.data);
        console.log("✅ Employees loaded:", response.data.length);
      }
    } catch (error: any) {
      console.error("❌ Failed to load employees:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        loadEmployees();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const goAdd = () => {
    router.push("/dashboard/employee/add" as never);
  };

  return (
    <View style={{flex: 1, backgroundColor: Colors[colorScheme].background}}>
      <Header title="Pegawai" showHelp={false} />
      <View style={[styles.contentContainer]}>
        <View style={[styles.searchRow, {paddingHorizontal: 20}]}>
          <View style={{flex: 1}}>
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

        {loading && !refreshing ? (
          <View
            style={{flex: 1, justifyContent: "center", alignItems: "center"}}
          >
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme].primary}
            />
          </View>
        ) : (
          <FlatList
            data={employees}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{paddingBottom: 100, marginTop: 16}}
            refreshing={refreshing}
            onRefresh={() => loadEmployees(true)}
            renderItem={({item}) => (
              <EmployeeCard
                initials={item.name.slice(0, 2).toUpperCase()}
                name={item.name}
                phone={item.phone || "-"}
                role={item.role || "Staff"}
                onPress={() => {
                  router.push({
                    pathname: "/dashboard/employee/edit",
                    params: {
                      id: String(item.id),
                    },
                  } as never);
                }}
              />
            )}
            ListEmptyComponent={
              <View style={{alignItems: "center", marginTop: 40}}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={Colors[colorScheme].icon}
                />
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, {bottom: insets.bottom + 24}]}
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
