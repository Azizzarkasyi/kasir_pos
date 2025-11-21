import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker as RNPicker } from '@react-native-picker/picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface PickerProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
}

const Picker: React.FC<PickerProps> = ({ selectedValue, onValueChange, items }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  return (
    <View style={styles.container}>
      <RNPicker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        {items.map(item => (
          <RNPicker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </RNPicker>
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 5,
      marginBottom: 20,
    },
    picker: {
      color: Colors[colorScheme].text,
    },
  });

export default Picker;