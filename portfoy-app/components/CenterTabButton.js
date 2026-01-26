import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { COLORS, SHADOWS } from '../constants/theme';
import TransactionIcon from './icons/TransactionIcon';

export default function CenterTabButton({ children, onPress, accessibilityState }) {
  const selected = accessibilityState?.selected;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

  return (
    <View style={styles.container} pointerEvents="box-none">
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          accessibilityRole="button"
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={[styles.button, selected ? styles.buttonSelected : null]}
        >
          <TransactionIcon size={28} color={COLORS.darkBlue} />
        </TouchableOpacity>
      </Animated.View>

      <Text style={[styles.label, selected ? styles.labelSelected : null]}>İşlem Yap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -22,
    width: 88,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: COLORS.gold,
    ...SHADOWS.xl,
  },
  buttonSelected: {
    transform: [{ scale: 1.02 }],
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
  },
  labelSelected: {
    color: COLORS.gold,
  }
});
