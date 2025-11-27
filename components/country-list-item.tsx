import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import RadioButton from './radio-button';
import { ThemedText } from './themed-text';

interface CountryListItemProps {
  item: { id: string; name: string };
  selected: boolean;
  onPress: () => void;
}

const CountryListItem: React.FC<CountryListItemProps> = ({ item, selected, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <RadioButton selected={selected}  onPress={onPress} />
      <ThemedText style={styles.text}>{item.name}</ThemedText>
    </TouchableOpacity>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].border2,
    },
    text: {
      marginLeft: 16,
    },
  });

export default CountryListItem;