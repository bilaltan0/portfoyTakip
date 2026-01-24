/**
 * SubCategory.js - Alt Kategori Modeli
 * 
 * Kullanıcı tarafından oluşturulabilen özel alt kategoriler
 * Örnek: Borsa > Halka Arz, Büyüme, Temettü Hisseleri
 */

// ⚠️ CRITICAL: Polyfill must be imported BEFORE uuid
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

/**
 * Alt kategori şeması
 */
export const SubCategorySchema = {
  id: 'string (uuid)',
  name: 'string',
  parentCategory: 'string', // Altın, Borsa, Kripto, Döviz
  icon: 'string (emoji)',
  color: 'string (hex)',
  targetPercentage: 'number (0-100)',
  assets: 'array<string>', // Varlık adları listesi
  createdAt: 'string (ISO date)',
  updatedAt: 'string (ISO date)'
};

/**
 * Yeni alt kategori oluştur
 */
export const createSubCategory = ({
  name,
  parentCategory,
  icon = '📊',
  color = '#6366F1',
  targetPercentage = 0,
  assets = []
}) => {
  const now = new Date().toISOString();
  
  return {
    id: uuidv4(),
    name: name.trim(),
    parentCategory,
    icon,
    color,
    targetPercentage: Math.max(0, Math.min(100, targetPercentage)), // 0-100 arası
    assets: Array.isArray(assets) ? assets : [],
    createdAt: now,
    updatedAt: now
  };
};

/**
 * Alt kategori güncelle
 */
export const updateSubCategory = (subCategory, updates) => {
  return {
    ...subCategory,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

/**
 * Validation: Alt kategori geçerli mi?
 */
export const validateSubCategory = (subCategory) => {
  const errors = [];
  
  if (!subCategory.name || subCategory.name.trim().length === 0) {
    errors.push('Kategori adı boş olamaz');
  }
  
  if (subCategory.name.length > 30) {
    errors.push('Kategori adı en fazla 30 karakter olabilir');
  }
  
  const validCategories = ['Altın', 'Borsa', 'Kripto', 'Döviz'];
  if (!validCategories.includes(subCategory.parentCategory)) {
    errors.push('Geçersiz ana kategori');
  }
  
  if (subCategory.targetPercentage < 0 || subCategory.targetPercentage > 100) {
    errors.push('Hedef oran 0-100 arasında olmalıdır');
  }
  
  if (!subCategory.color.match(/^#[0-9A-Fa-f]{6}$/)) {
    errors.push('Geçersiz renk formatı (hex renk olmalı)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Varlık adını alt kategoriye ekle
 */
export const addAssetToSubCategory = (subCategory, assetName) => {
  if (!assetName || typeof assetName !== 'string') {
    return subCategory;
  }
  
  // Zaten varsa ekleme
  if (subCategory.assets.includes(assetName)) {
    return subCategory;
  }
  
  return {
    ...subCategory,
    assets: [...subCategory.assets, assetName],
    updatedAt: new Date().toISOString()
  };
};

/**
 * Varlık adını alt kategoriden çıkar
 */
export const removeAssetFromSubCategory = (subCategory, assetName) => {
  return {
    ...subCategory,
    assets: subCategory.assets.filter(a => a !== assetName),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Varsayılan alt kategoriler (ilk kullanım için öneriler)
 */
export const DEFAULT_SUBCATEGORIES = {
  Borsa: [
    {
      name: 'Halka Arz',
      icon: '🆕',
      color: '#3B82F6',
      targetPercentage: 15
    },
    {
      name: 'Büyüme',
      icon: '📈',
      color: '#8B5CF6',
      targetPercentage: 35
    },
    {
      name: 'Temettü',
      icon: '💰',
      color: '#10B981',
      targetPercentage: 50
    }
  ],
  Kripto: [
    {
      name: 'Layer 1',
      icon: '🔵',
      color: '#F59E0B',
      targetPercentage: 60
    },
    {
      name: 'DeFi',
      icon: '🟣',
      color: '#8B5CF6',
      targetPercentage: 30
    },
    {
      name: 'Stablecoin',
      icon: '🟢',
      color: '#10B981',
      targetPercentage: 10
    }
  ],
  Altın: [
    {
      name: 'Takı Amaçlı',
      icon: '💍',
      color: '#EC4899',
      targetPercentage: 30
    },
    {
      name: 'Yatırım Amaçlı',
      icon: '💰',
      color: '#FFD700',
      targetPercentage: 70
    }
  ],
  Döviz: [
    {
      name: 'Güçlü Para',
      icon: '💪',
      color: '#10B981',
      targetPercentage: 70
    },
    {
      name: 'Gelişen Piyasa',
      icon: '🌏',
      color: '#F59E0B',
      targetPercentage: 30
    }
  ]
};

export default {
  createSubCategory,
  updateSubCategory,
  validateSubCategory,
  addAssetToSubCategory,
  removeAssetFromSubCategory,
  DEFAULT_SUBCATEGORIES
};
