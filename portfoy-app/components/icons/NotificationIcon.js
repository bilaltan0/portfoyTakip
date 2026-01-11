/**
 * NotificationIcon.js - Bildirim İkonu
 * 
 * AMAÇ: Bildirimler için çan ikonu (Lucide Bell)
 * 
 * PROPS:
 * - size: İkon boyutu (default: 24)
 * - color: İkon rengi (default: #004AAD)
 * - showBadge: Kırmızı nokta göster (default: false)
 * 
 * KULLANIM:
 * import NotificationIcon from '../components/icons/NotificationIcon';
 * <NotificationIcon size={24} color={COLORS.darkBlue} showBadge={true} />
 */

import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export default function NotificationIcon({ size = 24, color = '#004AAD', showBadge = false }) {
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
      {/* Çan alt çizgi */}
      <Path d="M10.268 21a2 2 0 0 0 3.464 0" />
      
      {/* Çan gövdesi */}
      <Path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
      
      {/* Bildirim badge (opsiyonel kırmızı nokta) */}
      {showBadge && (
        <Circle cx={18} cy={6} r={3} fill="#E74C3C" stroke="none" />
      )}
    </Svg>
  );
}
