import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProBadgeProps {
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'inline';
}

const ProBadge: React.FC<ProBadgeProps> = ({ 
  size = 'small', 
  position = 'top-right' 
}) => {
  const badgeStyle = [
    styles.badge,
    styles[size],
    position === 'inline' && styles.inline
  ];

  return (
    <View style={badgeStyle}>
      <Text style={[styles.text, styles[`${size}Text`]]}>PRO</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  small: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 32,
    height: 16,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 40,
    height: 20,
  },
  large: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 48,
    height: 24,
  },
  inline: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  text: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 10,
  },
  smallText: {
    fontSize: 8,
  },
  mediumText: {
    fontSize: 10,
  },
  largeText: {
    fontSize: 12,
  },
});

export default ProBadge;
