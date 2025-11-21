import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {Colors} from '@/constants/theme';
import {Ionicons} from '@expo/vector-icons';

type CodeItem = {label: string; value: string};

type Props = {
  value: string;
  onChange: (val: string) => void;
  items: CodeItem[];
};

const CountryCodePicker: React.FC<Props> = ({value, onChange, items}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);
  const [open, setOpen] = useState(false);

  // value dipakai langsung; daftar items hanya untuk dropdown

  return (
    <View style={{position: 'relative'}}>
      <TouchableOpacity style={styles.box} onPress={() => setOpen(o => !o)}>
        <Text style={styles.flagEmoji}>{value}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={Colors[colorScheme].icon} />
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {items.map(item => (
            <TouchableOpacity
              key={item.value}
              style={styles.item}
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
            >
              <Text style={styles.flagEmoji}>{item.value}</Text>
              <Text style={styles.itemLabel} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    box: {
      width: 56,
      height: 56,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      backgroundColor: Colors[colorScheme].background,
    },
    flagEmoji: {
      fontSize: 18,
    },
    codeText: {
      display: 'none',
    },
    dropdown: {
      position: 'absolute',
      top: 60,
      left: 0,
      width: 220,
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      backgroundColor: Colors[colorScheme].background,
      zIndex: 100,
      elevation: 12,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 4},
    },
    item: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].icon,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    itemLabel: {
      color: Colors[colorScheme].text,
      fontSize: 14,
      flexShrink: 1,
    },
  });

export default CountryCodePicker;