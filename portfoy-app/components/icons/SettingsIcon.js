/**
 * SettingsIcon.js - Ayarlar İkonu
 * 
 * AMAÇ: Ayarlar menüsü için dişli çark ikonu (Lucide Settings)
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
      {/* Dışlı çark path */}
      <Path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
      
      {/* İç daire */}
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}
