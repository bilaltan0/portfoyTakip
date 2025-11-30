/**
 * StockIcon.js - Borsa/Hisse İkonu
 * 
 * AMAÇ: Borsa için yükselen grafik çizgisi
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #fff)
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function StockIcon({ size = 24, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Yükselen grafik çizgisi */}
      <Path
        d="M4 18 L8 14 L12 16 L16 10 L20 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Nokta vurguları */}
      <Circle cx={4} cy={18} r={1.5} fill={color} />
      <Circle cx={8} cy={14} r={1.5} fill={color} />
      <Circle cx={12} cy={16} r={1.5} fill={color} />
      <Circle cx={16} cy={10} r={1.5} fill={color} />
      <Circle cx={20} cy={6} r={1.5} fill={color} />
      
      {/* Ok işareti */}
      <Path
        d="M17 6 L20 6 L20 9"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
