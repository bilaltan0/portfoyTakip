/**
 * SubCategoryContext.js - Alt Kategori Global State Management
 * 
 * Tüm alt kategori işlemlerini yöneten Context API
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSubCategory as createSubCategoryModel } from '../models/SubCategory';
import { 
  loadSubCategories,
  saveSubCategories,
  getSubCategoriesByParent,
  addSubCategory as addSubCategoryToStorage,
  updateSubCategory as updateSubCategoryInStorage,
  deleteSubCategory as deleteSubCategoryFromStorage,
  assignAssetToSubCategory as assignAssetInStorage,
  removeAssetFromSubCategory as removeAssetInStorage,
  getSubCategoryForAsset,
  loadAssetMapping,
  STORAGE_KEYS
} from '../utils/subCategoryStorage';

const SubCategoryContext = createContext();

export const useSubCategories = () => {
  const context = useContext(SubCategoryContext);
  if (!context) {
    throw new Error('useSubCategories must be used within SubCategoryProvider');
  }
  return context;
};

export const SubCategoryProvider = ({ children }) => {
  const [subCategories, setSubCategories] = useState([]);
  const [assetMapping, setAssetMapping] = useState({});
  const [loading, setLoading] = useState(true);

  /**
   * İlk yükleme
   */
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categories, mapping] = await Promise.all([
        loadSubCategories(),
        loadAssetMapping()
      ]);
      
      // ⚠️ FIX: ID olmayan kategorilere UUID ata
      const fixedCategories = categories.map(cat => {
        if (!cat.id || typeof cat.id !== 'string' || cat.id.length === 0 || cat.id === 'undefined') {
          const fixed = createSubCategoryModel({
            name: cat.name,
            parentCategory: cat.parentCategory,
            icon: cat.icon || '📊',
            color: cat.color || '#6366F1',
            targetPercentage: cat.targetPercentage || 0,
            assets: cat.assets || []
          });
          console.warn(`🔧 Bozuk kategori düzeltildi: ${cat.name} → Yeni ID: ${fixed.id}`);
          return fixed;
        }
        return cat;
      });
      
      setSubCategories(fixedCategories);
      setAssetMapping(mapping);
      
      console.log(`✅ ${fixedCategories.length} alt kategori yüklendi`);
      const fixedCount = fixedCategories.length - categories.filter(c => c.id && c.id !== 'undefined').length;
      if (fixedCount > 0) {
        console.warn(`🔧 ${fixedCount} bozuk kategori otomatik düzeltildi`);
        // Düzeltilmiş verileri kaydet
        saveSubCategories(fixedCategories);
      }
      console.log(`✅ ${Object.keys(mapping).length} asset mapping yüklendi`);
    } catch (error) {
      console.error('❌ Alt kategori verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Yeni alt kategori oluştur
   */
  const createSubCategory = async (categoryData) => {
    try {
      // 1. Model ile UUID'li SubCategory objesi oluştur
      const newCategoryWithId = createSubCategoryModel(categoryData);
      console.log('🔧 SubCategory modeli oluşturuldu:', newCategoryWithId);
      
      // 2. Storage'a kaydet
      const savedCategory = await addSubCategoryToStorage(newCategoryWithId);
      
      // 3. State'i güncelle
      setSubCategories(prev => [...prev, savedCategory]);
      console.log(`✅ Kategori oluşturuldu: ${savedCategory.name} (${savedCategory.id})`);
      
      return savedCategory;
    } catch (error) {
      console.error('❌ Kategori oluşturulamadı:', error);
      throw error;
    }
  };

  /**
   * Alt kategoriyi güncelle
   */
  const updateSubCategory = async (id, updates) => {
    try {
      const updated = await updateSubCategoryInStorage(id, updates);
      setSubCategories(prev => 
        prev.map(cat => cat.id === id ? updated : cat)
      );
      console.log(`✅ Kategori güncellendi: ${updated.name}`);
      return updated;
    } catch (error) {
      console.error('❌ Kategori güncellenemedi:', error);
      throw error;
    }
  };

  /**
   * Alt kategoriyi sil
   */
  const deleteSubCategory = async (id) => {
    try {
      await deleteSubCategoryFromStorage(id);
      setSubCategories(prev => prev.filter(cat => cat.id !== id));
      
      // Asset mapping'den de temizle
      const updatedMapping = { ...assetMapping };
      Object.keys(updatedMapping).forEach(assetName => {
        if (updatedMapping[assetName] === id) {
          delete updatedMapping[assetName];
        }
      });
      setAssetMapping(updatedMapping);
      
      console.log('✅ Kategori silindi');
      return true;
    } catch (error) {
      console.error('❌ Kategori silinemedi:', error);
      throw error;
    }
  };

  /**
   * Parent kategoriye göre alt kategorileri getir
   */
  const getSubCategoriesByCategory = (parentCategory) => {
    return subCategories.filter(cat => cat.parentCategory === parentCategory);
  };

  /**
   * ID'ye göre alt kategori bul
   */
  const getSubCategoryById = (id) => {
    return subCategories.find(cat => cat.id === id) || null;
  };

  /**
   * Varlığı alt kategoriye ata
   */
  const assignAssetToSubCategory = async (assetName, subCategoryId) => {
    try {
      await assignAssetInStorage(assetName, subCategoryId);
      
      // Asset mapping güncelle
      setAssetMapping(prev => ({
        ...prev,
        [assetName]: subCategoryId
      }));
      
      // SubCategory'nin assets listesini güncelle
      setSubCategories(prev => prev.map(cat => {
        const catAssets = cat.assets || [];
        if (cat.id === subCategoryId && !catAssets.includes(assetName)) {
          return {
            ...cat,
            assets: [...catAssets, assetName],
            updatedAt: new Date().toISOString()
          };
        }
        // Önceki kategoriden çıkar
        if (catAssets.includes(assetName) && cat.id !== subCategoryId) {
          return {
            ...cat,
            assets: catAssets.filter(a => a !== assetName),
            updatedAt: new Date().toISOString()
          };
        }
        return cat;
      }));
      
      console.log(`✅ ${assetName} kategoriye atandı`);
      return true;
    } catch (error) {
      console.error('❌ Asset atama başarısız:', error);
      throw error;
    }
  };

  /**
   * Varlığı kategoriden çıkar
   */
  const removeAssetFromCategory = async (assetName) => {
    try {
      const subCategoryId = assetMapping[assetName];
      
      if (!subCategoryId) {
        return true; // Zaten kategorisiz
      }
      
      await removeAssetInStorage(assetName);
      
      // Asset mapping'den sil
      const updatedMapping = { ...assetMapping };
      delete updatedMapping[assetName];
      setAssetMapping(updatedMapping);
      
      // SubCategory'den çıkar
      setSubCategories(prev => prev.map(cat => {
        if (cat.id === subCategoryId) {
          const catAssets = cat.assets || [];
          return {
            ...cat,
            assets: catAssets.filter(a => a !== assetName),
            updatedAt: new Date().toISOString()
          };
        }
        return cat;
      }));
      
      console.log(`✅ ${assetName} kategoriden çıkarıldı`);
      return true;
    } catch (error) {
      console.error('❌ Asset kaldırma başarısız:', error);
      throw error;
    }
  };

  /**
   * Varlığın hangi kategoride olduğunu bul
   */
  const getSubCategoryForAssetName = (assetName) => {
    const subCategoryId = assetMapping[assetName];
    if (!subCategoryId) {
      return null;
    }
    return getSubCategoryById(subCategoryId);
  };

  /**
   * Kategorisiz varlıkları getir
   */
  const getUncategorizedAssets = (allAssets) => {
    return allAssets.filter(asset => !assetMapping[asset.assetName]);
  };

  /**
   * TÜM alt kategorileri ve eşleştirmeleri temizle
   */
  const clearAllSubCategories = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SUBCATEGORIES,
        STORAGE_KEYS.ASSET_MAPPING
      ]);
      setSubCategories([]);
      setAssetMapping({});
      console.log('✅ Tüm alt kategoriler temizlendi');
    } catch (error) {
      console.error('❌ Alt kategoriler temizlenemedi:', error);
      throw error;
    }
  };

  /**
   * Parent kategorideki toplam hedef yüzdeyi hesapla
   */
  const getTotalTargetPercentage = (parentCategory) => {
    const categorySubCategories = getSubCategoriesByCategory(parentCategory);
    return categorySubCategories.reduce((sum, cat) => sum + cat.targetPercentage, 0);
  };

  /**
   * Verileri yeniden yükle (refresh için)
   */
  const refreshData = async () => {
    await loadData();
  };

  const value = {
    // State
    subCategories,
    assetMapping,
    loading,
    
    // CRUD Operations
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    
    // Query Operations
    getSubCategoriesByCategory,
    getSubCategoryById,
    getSubCategoryForAssetName,
    getUncategorizedAssets,
    getTotalTargetPercentage,
    
    // Asset Operations
    assignAssetToSubCategory,
    removeAssetFromCategory,
    
    // Utility
    refreshData,
    clearAllSubCategories
  };

  return (
    <SubCategoryContext.Provider value={value}>
      {children}
    </SubCategoryContext.Provider>
  );
};

export default SubCategoryContext;
