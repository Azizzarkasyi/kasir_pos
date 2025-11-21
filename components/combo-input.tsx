import {Colors} from "@/constants/theme";
import {useColorScheme} from "@/hooks/use-color-scheme";
import {Ionicons} from "@expo/vector-icons";
import React, {useEffect, useRef, useState} from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ComboItem = {label: string; value: string};

type ComboInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  items: ComboItem[];
  error?: string;
};

const ComboInput: React.FC<ComboInputProps> = ({
  label,
  value,
  onChangeText,
  items,
  error,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const styles = createStyles(colorScheme, !!error);
  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);

  const focusAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, focusAnim]);

  const labelStyle = {
    top: focusAnim.interpolate({inputRange: [0, 1], outputRange: [18, -10]}),
    fontSize: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors[colorScheme].icon, Colors[colorScheme].primary],
    }),
    backgroundColor: Colors[colorScheme].background,
    paddingHorizontal: 4,
  } as any;

  const filtered = items.filter(i =>
    i.label.toLowerCase().includes((value || "").toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            borderColor: !!error
              ? "red"
              : isFocused
              ? Colors[colorScheme].primary
              : Colors[colorScheme].icon,
          },
        ]}
      >
        <Animated.Text style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={text => {
            onChangeText(text);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
        />
        {items?.length ? (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setOpen(o => !o)}
          >
            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={20}
              color={Colors[colorScheme].icon}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}

      {open && filtered.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={filtered}
            keyExtractor={item => item.value}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onChangeText(item.label);
                  setOpen(false);
                }}
              >
                <Text
                  style={[styles.itemText, {color: Colors[colorScheme].text}]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (colorScheme: "light" | "dark", hasError: boolean) =>
  StyleSheet.create({
    container: {
      width: "100%",
      marginVertical: 10,
    },
    inputContainer: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      backgroundColor: Colors[colorScheme].background,
    },
    label: {
      position: "absolute",
      left: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: Colors[colorScheme].text,
      height: "100%",
    },
    iconContainer: {
      paddingLeft: 12,
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginTop: 4,
      marginLeft: 12,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      maxHeight: 200,
      overflow: "hidden",
      backgroundColor: Colors[colorScheme].background,
    },
    item: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].icon,
    },
    itemText: {
      fontSize: 16,
    },
  });

export default ComboInput;
