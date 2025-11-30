/**
 * StockIcon.js - Borsa/Hisse İkonu
 * 
 * AMAÇ: Borsa için yükselen grafik çizgisi (Lucide Trending Up)
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #fff)
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function StockIcon({ size = 24, color = '#fff' }) {
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
      {/* Ok ve kutu */}
      <Path d="M16 7h6v6" />
      
      {/* Yükselen grafik çizgisi */}
      <Path d="m22 7-8.5 8.5-5-5L2 17" />
    </Svg>
  );
}
