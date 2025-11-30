/**
 * SettingsIcon.js - Ayarlar İkonu
 * 
 * AMAÇ: Ayarlar menüsü için dişli çark ikonu
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #004AAD)
 * 
 * KULLANIM:
 * import SettingsIcon from '../components/icons/SettingsIcon';
 * <SettingsIcon size={24} color={COLORS.darkBlue} />
 */

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export default function SettingsIcon({ size = 24, color = '#004AAD' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Dış halka */}
      <Circle cx={12} cy={12} r={8} stroke={color} strokeWidth={2} fill="none" />
      
      {/* İç merkez */}
      <Circle cx={12} cy={12} r={2} fill={color} />
      
      {/* Dişli noktaları */}
      <Circle cx={12} cy={5} r={1.5} fill={color} />
      <Circle cx={12} cy={19} r={1.5} fill={color} />
      <Circle cx={5} cy={12} r={1.5} fill={color} />
      <Circle cx={19} cy={12} r={1.5} fill={color} />
    </Svg>
  );
}
