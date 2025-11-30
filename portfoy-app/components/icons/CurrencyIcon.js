/**
 * CurrencyIcon.js - Döviz/Dolar İkonu
 * 
 * AMAÇ: Döviz için dolar ($) sembolü (Lucide Dollar Sign)
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #fff)
 */

import React from 'react';
import Svg, { Line, Path } from 'react-native-svg';

export default function CurrencyIcon({ size = 24, color = '#fff' }) {
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
      {/* Dikey çizgi */}
      <Line x1="12" x2="12" y1="2" y2="22" />
      
      {/* $ sembolü path */}
      <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </Svg>
  );
}
