/**
 * CurrencyIcon.js - Döviz/Dolar İkonu
 * 
 * AMAÇ: Döviz için dolar ($) sembolü (Lucide Circle Dollar Sign)
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #fff)
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

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
      {/* Dış çember */}
      <Circle cx="12" cy="12" r="10" />
      
      {/* $ sembolü */}
      <Path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <Path d="M12 18V6" />
    </Svg>
  );
}
