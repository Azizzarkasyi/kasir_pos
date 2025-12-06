import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';

type OtpInputProps = {
  length?: number;
  onComplete?: (code: string) => void;
};

const OtpInput: React.FC<OtpInputProps> = ({length = 6, onComplete}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const {width, height} = useWindowDimensions();
  const isTablet = Math.min(width, height) >= 600;
  const styles = createStyles(colorScheme, isTablet);
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const code = values.join('');
    // Selalu kirim kode terkini, biar tombol di parent bisa enable/disable berdasarkan panjangnya
    onComplete?.(code);
  }, [values, length, onComplete]);

  const handleChange = (text: string, index: number) => {
    const sanitized = text.replace(/\D/g, '');
    const next = [...values];

    // Jika user paste banyak digit sekaligus
    if (sanitized.length > 1) {
      let cursor = index;
      for (let i = 0; i < sanitized.length && cursor < length; i += 1, cursor += 1) {
        next[cursor] = sanitized[i];
      }
      setValues(next);

      // Pindahkan fokus ke kotak terakhir yang terisi dari paste
      const lastIndex = Math.min(index + sanitized.length - 1, length - 1);
      refs.current[lastIndex]?.focus();
      return;
    }

    // Input normal 1 digit
    const char = sanitized.slice(-1);
    next[index] = char || '';
    setValues(next);

    // Kalau ada input baru dan bukan kotak terakhir, pindah ke next
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
      return;
    }

    // Kalau hasilnya kosong (biasanya karena backspace) dan bukan kotak pertama, pindah ke prev
    if (!char && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      // Kalau kotak sudah kosong dan tekan backspace, cukup pindah fokus ke prev
      if (!values[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
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
          autoCapitalize="none"
          autoCorrect={false}
          textAlign="center"
        />
      ))}
    </View>
  );
};

const createStyles = (colorScheme: 'light' | 'dark', isTablet: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: isTablet ? 32 : 24,
    },
    box: {
      width: isTablet ? 56 : 48,
      height: isTablet ? 64 : 56,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: Colors[colorScheme].border,
      color: Colors[colorScheme].text,
      fontSize: isTablet ? 24 : 20,
      backgroundColor: Colors[colorScheme].background,
      textAlign: 'center',
    },
  });

export default OtpInput;