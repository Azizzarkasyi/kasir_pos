import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ selected, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme  , selected);

  return (
    <TouchableOpacity style={styles.radioButton} onPress={onPress}>
      {selected && <View style={styles.radioButtonInner} />}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: 'light' | 'dark', selected: boolean) =>
  StyleSheet.create({
    radioButton: {
      height: 24,
      width: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: selected ? Colors[colorScheme].primary : Colors[colorScheme].border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonInner: {
      height: 12,
      width: 12,
      borderRadius: 6,
      backgroundColor: selected ? Colors[colorScheme].primary : Colors[colorScheme].border,
    },
  });

export default RadioButton;