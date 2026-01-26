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
  subtitleAlign = 'below', // 'below' or 'pill'
  leftIcon = null, // React element
  size = 'medium', // 'small' | 'medium' | 'large'
  style,
  textStyle,
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
  const pillTextColor = variant === 'success' ? COLORS.profit : (variant === 'danger' ? COLORS.loss : COLORS.primary);

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
          variant === 'text' && styles.leftIconWrapperText,
          variant === 'success' && styles.leftIconWrapperSuccess,
          variant === 'danger' && styles.leftIconWrapperDanger,
        ]}>
          {React.cloneElement(leftIcon, { color: variant === 'outline' || variant === 'text' ? COLORS.primary : (variant === 'success' ? COLORS.profit : (variant === 'danger' ? COLORS.loss : COLORS.white)) })}
        </View>
      ) : null}

      {/* Main content: label and subtitle (either below or pill on right) */}
      <View style={[styles.mainContent, subtitleAlign === 'pill' ? styles.mainContentRow : styles.mainContentColumn]}>
  <Text style={[styles.buttonText, { color: getTextColor(), fontSize: isSmall ? 13 : 14 }, textStyle]} numberOfLines={1}>{label}</Text>
        {subtitle ? (
          subtitleAlign === 'pill' ? (
            <View style={styles.buttonSubtitlePill}>
              <Text style={[styles.buttonSubtitlePillText, { color: pillTextColor }]}>{subtitle}</Text>
            </View>
          ) : (
            <Text style={styles.buttonSubtitle}>{subtitle}</Text>
          )
        ) : null}
      </View>
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
    // Segment buttons are intended to be flat in the footer area.
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
    fontSize: 12,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700'
  },
  leftIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  leftIconWrapperSuccess: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  leftIconWrapperDanger: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
  ,
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  mainContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainContentColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  buttonSubtitlePill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonSubtitlePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
