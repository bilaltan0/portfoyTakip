/**
 * GoldIcon.js - Altın Külçesi İkonu
 * 
 * AMAÇ: Altın varlığı için külçe şeklinde ikon
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #fff)
 */

import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

export default function GoldIcon({ size = 24, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Külçe şekli */}
      <Path
        d="M4 10 L6 8 L18 8 L20 10 L18 16 L6 16 Z"
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
      {/* Üst yüzey - parlak efekti */}
      <Path
        d="M6 8 L8 10 L16 10 L18 8"
        fill={color}
        opacity={0.7}
      />
      {/* Detay çizgileri */}
      <Path
        d="M8 12 L16 12 M9 14 L15 14"
        stroke={color}
        strokeWidth={0.5}
        opacity={0.5}
      />
    </Svg>
  );
}
