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

/**
 * Varlık için dinamik renk oluştur
 * @param {string} assetName - Varlık adı
 * @returns {string} - Renk kodu
 */
export const generateColorForAsset = (assetName) => {
  // Basit bir hash fonksiyonu kullanarak tutarlı renk üret
  let hash = 0;
  for (let i = 0; i < assetName.length; i++) {
    hash = assetName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // HSL renk uzayında renk üret (180-360 arası hue için pastel renkler)
  const hue = Math.abs(hash % 180) + 180;
  const saturation = 65 + (Math.abs(hash) % 20);
  const lightness = 55 + (Math.abs(hash) % 15);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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
