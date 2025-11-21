import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import RadioButton from './radio-button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
      <RadioButton selected={selected} onPress={onPress} />
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
      borderBottomColor: Colors[colorScheme].icon,
    },
    text: {
      marginLeft: 16,
    },
  });

export default CountryListItem;