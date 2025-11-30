/**
 * MoreIcon.js - Daha Fazla İkonu
 * 
 * AMAÇ: Tab Navigator'da Daha Fazla menüsü için üç nokta ikonu
 * 
 * PROPS:
 * - size: İkon boyutu (default: 28)
 * - color: İkon rengi (default: #FFFFFF)
 * 
 * KULLANIM:
 * import MoreIcon from '../components/icons/MoreIcon';
 * <MoreIcon size={28} color={COLORS.gold} />
 */

import React from 'react';
import Svg, { Circle } from 'react-native-svg';

export default function MoreIcon({ size = 28, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Üç dikey nokta */}
      <Circle cx={12} cy={6} r={2} fill={color} />
      <Circle cx={12} cy={12} r={2} fill={color} />
      <Circle cx={12} cy={18} r={2} fill={color} />
    </Svg>
  );
}
