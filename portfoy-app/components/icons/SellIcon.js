import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function SellIcon({ size = 18, color = '#FFFFFF' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 5v14" />
      <Path d="m19 12-7 7-7-7" />
    </Svg>
  );
}
