/**
 * MenuItem.js - Menü Item Component'i
 * 
 * MoreScreen ve diğer menü ekranlarında kullanılan menü öğesi bileşeni
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function MenuItem({ 
  icon: Icon, 
  title, 
  subtitle, 
  onPress, 
  danger = false 
}) {
  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        danger && styles.iconContainerDanger
      ]}>
        <Icon 
          size={24} 
          color={danger ? COLORS.red : COLORS.darkBlue} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[
          styles.title,
          danger && styles.titleDanger
        ]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerDanger: {
    backgroundColor: '#FEE2E2',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  titleDanger: {
    color: COLORS.red,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
});
