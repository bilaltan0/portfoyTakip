/**
 * CategoryButton.js - Kategori Seçim Butonu Component'i
 * 
 * Ana kategori seçimi için kullanılan buton bileşeni
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function CategoryButton({ 
  label, 
  isActive = false, 
  onPress,
  onLayout
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isActive && styles.buttonActive,
      ]}
      onPress={onPress}
      onLayout={onLayout}
    >
      <Text
        style={[
          styles.buttonText,
          isActive && styles.buttonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  buttonTextActive: {
    color: COLORS.white,
  },
});
