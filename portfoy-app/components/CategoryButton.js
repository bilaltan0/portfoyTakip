/**
 * CategoryButton.js - Kategori Seçim Butonu Component'i
 * 
 * Ana kategori seçimi için kullanılan buton bileşeni
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');
// 4 buton için: ekran genişliği - padding'ler (20*2) - gap'ler (4*3) / 4
const buttonWidth = (width - 40 - 12) / 4;

export default function CategoryButton({ 
  label, 
  isActive = false, 
  onPress 
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isActive && styles.buttonActive,
      ]}
      onPress={onPress}
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
    width: buttonWidth,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    marginVertical: 4,
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
