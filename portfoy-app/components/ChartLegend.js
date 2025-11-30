/**
 * ChartLegend.js - Grafik Legend Component'i
 * 
 * Grafik için renkli legend listesi
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ChartLegend({ data = [] }) {
  console.log('🎨 ChartLegend render - item count:', data.length);
  
  if (data.length === 0) {
    return <Text style={{ color: '#666' }}>Veri yok</Text>;
  }
  
  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        console.log(`📌 Item ${index}: name="${item.name}", percentage=${item.percentage}, color=${item.color}`);
        return (
          <View key={`${item.name}-${index}`} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.name}>{item.name || 'İsimsiz'}</Text>
            <Text style={styles.percentage}>{item.percentage}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  name: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginRight: 4,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});
