/**
 * EyeIcon.js - Göz İkonu (Göster)
 * 
 * AMAÇ: Tutar gizliliği için göz ikonu (Göster durumu)
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #FFFFFF)
 * 
 * KULLANIM:
 * import EyeIcon from '../components/icons/EyeIcon';
 * <EyeIcon size={24} color={COLORS.gold} />
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function EyeIcon({ size = 24, color = '#FFFFFF' }) {
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
      {/* Göz dış çizgisi */}
      <Path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      
      {/* İç benek (göz bebek) */}
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}
