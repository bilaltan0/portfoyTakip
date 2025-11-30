/**
 * TransactionIcon.js - İşlem İkonu
 * 
 * AMAÇ: Tab Navigator'da İşlem Yap için artı işareti ikonu
 * 
 * PROPS:
 * - size: İkon boyutu (default: 28)
 * - color: İkon rengi (default: #FFFFFF)
 * 
 * KULLANIM:
 * import TransactionIcon from '../components/icons/TransactionIcon';
 * <TransactionIcon size={28} color={COLORS.gold} />
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function TransactionIcon({ size = 28, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Dış çember */}
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} fill="none" />
      
      {/* Artı işareti */}
      <Path d="M12 8 L12 16 M8 12 L16 12" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
