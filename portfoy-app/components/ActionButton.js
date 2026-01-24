/**
 * ActionButton.js - Aksiyon Butonu Component'i
 * 
 * Alış/Satış gibi primary action butonları için kullanılan bileşen
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ActionButton({ 
  label, 
  onPress,
  variant = 'primary', // 'primary', 'success', 'danger', 'outline'
  disabled = false,
  loading = false,
  subtitle = null,
  leftIcon = null, // React element
  size = 'medium', // 'small' | 'medium' | 'large'
  style,
  onLayout
}) {
  const getBackgroundColor = () => {
    if (variant === 'success') return COLORS.profit;
    if (variant === 'danger') return COLORS.loss;
    if (variant === 'outline') return 'transparent';
    if (variant === 'text') return 'transparent';
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'text') return COLORS.primary;
    return COLORS.white;
  };

  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.buttonOutline,
        variant === 'text' && styles.buttonTextVariant,
        disabled && styles.buttonDisabled,
        isSmall && styles.buttonSmall,
        style
      ]}
      onPress={onPress}
      onLayout={onLayout}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {leftIcon ? (
        <View style={[
          styles.leftIconWrapper,
          variant === 'outline' && styles.leftIconWrapperOutline,
          variant === 'text' && styles.leftIconWrapperText
        ]}>
          {React.cloneElement(leftIcon, { color: variant === 'outline' || variant === 'text' ? COLORS.primary : COLORS.white })}
        </View>
      ) : null}

      <Text style={[styles.buttonText, { color: getTextColor(), fontSize: isSmall ? 13 : 14 }]}>{label}</Text>
      {subtitle ? <Text style={styles.buttonSubtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginHorizontal: 0,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonSmall: {
    flex: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    minWidth: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextVariant: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    minWidth: 0,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
  },
  buttonSubtitle: {
    marginTop: 6,
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)'
  },
  leftIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  leftIconWrapperOutline: {
    backgroundColor: COLORS.white,
  }
  ,
  leftIconWrapperText: {
    backgroundColor: 'transparent',
    width: 18,
    height: 18,
    marginRight: 6,
  }
});
