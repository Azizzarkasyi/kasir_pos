import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface RadioButtonProps {
  selected: boolean;
  onPress: () => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ selected, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity style={styles.radioButton} onPress={onPress}>
      {selected && <View style={styles.radioButtonInner} />}
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    radioButton: {
      height: 24,
      width: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: Colors[colorScheme].primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonInner: {
      height: 12,
      width: 12,
      borderRadius: 6,
      backgroundColor: Colors[colorScheme].primary,
    },
  });

export default RadioButton;