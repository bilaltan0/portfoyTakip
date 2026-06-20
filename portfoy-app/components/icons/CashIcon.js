/**
 * CashIcon.js - Nakit İkonu
 * 
 * AMAÇ: Nakit (TRY) için cüzdan / banknot ikonu
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #fff)
 */

import React from 'react';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

export default function CashIcon({ size = 24, color = '#fff' }) {
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
      {/* Cüzdan / Banknot şekli */}
      <Rect x="2" y="6" width="20" height="12" rx="2" />
      <Circle cx="12" cy="12" r="2" />
      <Path d="M6 12h.01M18 12h.01" />
    </Svg>
  );
}
