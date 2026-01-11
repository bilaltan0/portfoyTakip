/**
 * colorUtils.js - Renk Yardımcı Fonksiyonları
 * 
 * Renk hesaplamaları ve yönetimi
 */

import { COLORS } from '../constants/theme';

/**
 * Kategori rengini al
 * @param {string} categoryName - Kategori adı
 * @returns {string} - Renk kodu
 */
export const getCategoryColor = (categoryName) => {
  const colorMap = {
    'Altın': COLORS.gold || '#FFD700',
    'Kripto': COLORS.assets?.crypto || '#6366F1',
    'Borsa': COLORS.assets?.stock || '#10B981',
    'Döviz': COLORS.assets?.forex || '#F59E0B',
    'Nakit': COLORS.green || '#1ABC9C'
  };
  
  return colorMap[categoryName] || COLORS.gray || '#666666';
};

// Yüksek kontrast renk paleti - Grafiklerde birbirinden ayırt edilebilir renkler
const DISTINCT_COLORS = [
  '#E53E3E', // Kırmızı
  '#3B82F6', // Mavi
  '#10B981', // Yeşil
  '#F59E0B', // Turuncu
  '#8B5CF6', // Mor
  '#EC4899', // Pembe
  '#14B8A6', // Turkuaz
  '#F97316', // Koyu Turuncu
  '#6366F1', // İndigo
  '#84CC16', // Lime
  '#06B6D4', // Cyan
  '#EF4444', // Açık Kırmızı
  '#A855F7', // Açık Mor
  '#22C55E', // Açık Yeşil
  '#FBBF24', // Sarı
  '#FB7185', // Açık Pembe
  '#0EA5E9', // Sky Blue
  '#D946EF', // Fuşya
  '#4ADE80', // Neon Yeşil
  '#F472B6', // Hot Pink
];

/**
 * Varlık için dinamik renk oluştur
 * @param {string} assetName - Varlık adı
 * @param {number} index - Varlığın sıra numarası (opsiyonel, verilirse direkt kullanılır)
 * @returns {string} - Renk kodu
 */
export const generateColorForAsset = (assetName, index = null) => {
  // Eğer index verilmişse direkt kullan (kategorideki sıra için)
  if (index !== null && index >= 0) {
    return DISTINCT_COLORS[index % DISTINCT_COLORS.length];
  }
  
  // Index verilmemişse hash ile tutarlı renk seç (eski davranış)
  let hash = 0;
  for (let i = 0; i < assetName.length; i++) {
    hash = assetName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Renk paletinden tutarlı bir renk seç
  const colorIndex = Math.abs(hash) % DISTINCT_COLORS.length;
  return DISTINCT_COLORS[colorIndex];
};

/**
 * Kar/zarar rengini al
 * @param {number} value - Değer
 * @returns {string} - Renk kodu
 */
export const getProfitLossColor = (value) => {
  if (value > 0) return COLORS.profit;
  if (value < 0) return COLORS.loss;
  return COLORS.neutral;
};
