/**
 * TransactionIcon.js - İşlem İkonu
 * 
 * AMAÇ: Tab Navigator'da İşlem Yap için ok ikonu (Lucide Arrow Right Left)
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
import Svg, { Path } from 'react-native-svg';

export default function TransactionIcon({ size = 28, color = '#FFFFFF' }) {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Sağ ok */}
      <Path d="m16 3 4 4-4 4" />
      <Path d="M20 7H4" />
      
      {/* Sol ok */}
      <Path d="m8 21-4-4 4-4" />
      <Path d="M4 17h16" />
    </Svg>
  );
}
