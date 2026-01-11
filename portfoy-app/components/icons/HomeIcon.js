/**
 * HomeIcon.js - Ana Sayfa İkonu
 * 
 * AMAÇ: Tab Navigator'da Ana Sayfa için ev ikonu (Lucide House)
 * 
 * PROPS:
 * - size: İkon boyutu (default: 28)
 * - color: İkon rengi (default: #FFFFFF)
 * 
 * KULLANIM:
 * import HomeIcon from '../components/icons/HomeIcon';
 * <HomeIcon size={28} color={COLORS.gold} />
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function HomeIcon({ size = 28, color = '#FFFFFF' }) {
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
      {/* İç kapı */}
      <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      
      {/* Ev yapısı */}
      <Path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Svg>
  );
}
