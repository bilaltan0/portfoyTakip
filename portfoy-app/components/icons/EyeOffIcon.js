/**
 * EyeOffIcon.js - Göz İkonu (Gizle)
 * 
 * AMAÇ: Tutar gizliliği için kapalı göz ikonu (Gizle durumu)
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #FFFFFF)
 * 
 * KULLANIM:
 * import EyeOffIcon from '../components/icons/EyeOffIcon';
 * <EyeOffIcon size={24} color={COLORS.gold} />
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function EyeOffIcon({ size = 24, color = '#FFFFFF' }) {
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
      {/* Göz çizgisi parçaları */}
      <Path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <Path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <Path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      
      {/* Çapraz çizgi (gözü kapatma) */}
      <Path d="m2 2 20 20" />
    </Svg>
  );
}
