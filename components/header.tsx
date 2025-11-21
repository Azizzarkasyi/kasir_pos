import React from 'react';
import { View, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './themed-text';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '@/constants/theme';

interface HeaderProps {
  onBackPress?: () => void;
  onHelpPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBackPress, onHelpPress }) => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.helpButton} onPress={onHelpPress}>
        <ThemedText style={styles.helpButtonText}>Bantuan</ThemedText>
        <Ionicons name="help-circle-outline" size={20} color={Colors[colorScheme].primary} />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') => StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors[colorScheme].icon,
  },
  helpButtonText: {
    marginRight: 4,
    color: Colors[colorScheme].text,
  },
});

export default Header;