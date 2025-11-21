import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, TextInput, View} from 'react-native';
import {useColorScheme} from '@/hooks/use-color-scheme';
import {Colors} from '@/constants/theme';

type OtpInputProps = {
  length?: number;
  onComplete?: (code: string) => void;
};

const OtpInput: React.FC<OtpInputProps> = ({length = 6, onComplete}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const styles = createStyles(colorScheme);
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const code = values.join('');
    if (code.length === length && !code.includes('')) {
      onComplete?.(code);
    }
  }, [values, length, onComplete]);

  const handleChange = (text: string, index: number) => {
    const char = text.replace(/\D/g, '').slice(-1);
    const next = [...values];
    next[index] = char || '';
    setValues(next);
    if (char && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const next = [...values];
      next[index - 1] = '';
      setValues(next);
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({length}).map((_, i) => (
        <TextInput
          key={i}
          ref={r => {
            refs.current[i] = r;
          }}
          value={values[i]}
          onChangeText={t => handleChange(t, i)}
          onKeyPress={e => handleKeyPress(e, i)}
          style={styles.box}
          keyboardType="number-pad"
          maxLength={1}
          autoCapitalize="none"
          autoCorrect={false}
          textAlign="center"
        />
      ))}
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 24,
    },
    box: {
      width: 48,
      height: 56,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors[colorScheme].icon,
      color: Colors[colorScheme].text,
      fontSize: 20,
      backgroundColor: Colors[colorScheme].background,
    },
  });

export default OtpInput;