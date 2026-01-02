/**
 * DoughnutChart.js - Halka Grafik Component'i
 * 
 * SVG ile çizilen doughnut chart
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';
import { formatCurrency } from '../utils/currencyUtils';

export default function DoughnutChart({ 
  data = [], 
  centerValue,
  centerLabel = "Toplam",
  size = 180,
  strokeWidth = 20,
  currencySymbol = '₺',
  isBalanceHidden = false
}) {
  const radius = (50 - strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  
  // Her segment için başlangıç ve bitiş açılarını hesapla
  let currentAngle = 0;
  const segments = data.map((item) => {
    // exactPercentage varsa onu kullan (daha hassas), yoksa percentage
    const percent = item.exactPercentage !== undefined ? item.exactPercentage : item.percentage;
    const segmentAngle = (percent / 100) * 360;
    const segmentLength = (percent / 100) * circumference;
    
    const segment = {
      ...item,
      startAngle: currentAngle,
      segmentAngle,
      endAngle: currentAngle + segmentAngle,
      segmentLength,
    };
    
    currentAngle += segmentAngle;
    return segment;
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Arka plan çemberi (gri) */}
        {data.length > 0 && (
          <Circle
            r={radius}
            cx={50}
            cy={50}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="none"
          />
        )}
        
        {/* Her segment için ayrı çember çiz */}
        {segments.map((segment, index) => {
          const dashArray = `${segment.segmentLength} ${circumference - segment.segmentLength}`;
          const dashOffset = -(segment.startAngle / 360) * circumference;
          
          return (
            <Circle
              key={`${segment.name}-${index}`}
              r={radius}
              cx={50}
              cy={50}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 50 50)`}
            />
          );
        })}
      </Svg>
      
      {/* Merkez değer */}
      <View style={styles.center}>
        <Text style={styles.centerLabel}>{centerLabel}</Text>
        <Text style={styles.centerValue}>
          {isBalanceHidden ? '₺ *****' : `${currencySymbol}${Math.round(centerValue).toLocaleString('tr-TR')}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  centerLabel: {
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: 4,
  },
  centerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkBlue,
  },
});
