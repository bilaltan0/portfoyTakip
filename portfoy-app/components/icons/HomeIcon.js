/**
 * HomeIcon.js - Ana Sayfa İkonu
 * 
 * AMAÇ: Tab Navigator'da Ana Sayfa için ev ikonu
 * 
 * PROPS:
 * - size: İkon boyutu (default: 28)
 * - color: İkon rengi (default: #FFFFFF)
 * - filled: Dolu mu boş mu (default: true)
 * 
 * KULLANIM:
 * import HomeIcon from '../components/icons/HomeIcon';
 * <HomeIcon size={28} color={COLORS.gold} filled={true} />
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function HomeIcon({ size = 28, color = '#FFFFFF', filled = true }) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path 
          d="M3 9 L12 2 L21 9 L21 20 C21 20.5 20.5 21 20 21 L4 21 C3.5 21 3 20.5 3 20 Z" 
          fill={color} 
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path 
        d="M3 9 L12 2 L21 9 L21 20 C21 20.5 20.5 21 20 21 L4 21 C3.5 21 3 20.5 3 20 Z" 
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}
