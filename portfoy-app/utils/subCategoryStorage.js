/**
 * subCategoryStorage.js - Alt Kategori AsyncStorage İşlemleri
 * 
 * Alt kategorilerin ve asset-subcategory mapping'lerinin
 * AsyncStorage'da saklanması/okunması
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
export const STORAGE_KEYS = {
  SUBCATEGORIES: '@portfolio_subcategories',
  ASSET_MAPPING: '@portfolio_asset_subcategory_mapping'
};

/**
 * Tüm alt kategorileri oku
 */
export const loadSubCategories = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SUBCATEGORIES);
    if (!data) {
      return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Alt kategoriler yüklenemedi:', error);
    return [];
  }
};

/**
 * Alt kategorileri kaydet
 */
export const saveSubCategories = async (subCategories) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.SUBCATEGORIES,
      JSON.stringify(subCategories)
    );
    console.log(`✅ ${subCategories.length} alt kategori kaydedildi`);
    return true;
  } catch (error) {
    console.error('❌ Alt kategoriler kaydedilemedi:', error);
    return false;
  }
};

/**
 * Parent kategoriye göre alt kategorileri filtrele
 */
export const getSubCategoriesByParent = async (parentCategory) => {
  try {
    const allSubCategories = await loadSubCategories();
    return allSubCategories.filter(sub => sub.parentCategory === parentCategory);
  } catch (error) {
    console.error(`❌ ${parentCategory} alt kategorileri yüklenemedi:`, error);
    return [];
  }
};

/**
 * ID'ye göre alt kategori bul
 */
export const getSubCategoryById = async (id) => {
  try {
    const allSubCategories = await loadSubCategories();
    return allSubCategories.find(sub => sub.id === id) || null;
  } catch (error) {
    console.error(`❌ Alt kategori bulunamadı (${id}):`, error);
    return null;
  }
};

/**
 * Yeni alt kategori ekle
 */
export const addSubCategory = async (newSubCategory) => {
  try {
    const allSubCategories = await loadSubCategories();
    
    // Aynı parent'ta aynı isimde kategori var mı?
    const duplicate = allSubCategories.find(
      sub => sub.parentCategory === newSubCategory.parentCategory &&
             sub.name.toLowerCase() === newSubCategory.name.toLowerCase()
    );
    
    if (duplicate) {
      throw new Error(`"${newSubCategory.name}" kategorisi zaten mevcut`);
    }
    
    const updated = [...allSubCategories, newSubCategory];
    await saveSubCategories(updated);
    
    console.log(`✅ Yeni kategori eklendi: ${newSubCategory.name}`);
    return newSubCategory;
  } catch (error) {
    console.error('❌ Alt kategori eklenemedi:', error);
    throw error;
  }
};

/**
 * Alt kategoriyi güncelle
 */
export const updateSubCategory = async (id, updates) => {
  try {
    const allSubCategories = await loadSubCategories();
    const index = allSubCategories.findIndex(sub => sub.id === id);
    
    if (index === -1) {
      throw new Error('Alt kategori bulunamadı');
    }
    
    allSubCategories[index] = {
      ...allSubCategories[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await saveSubCategories(allSubCategories);
    console.log(`✅ Kategori güncellendi: ${allSubCategories[index].name}`);
    return allSubCategories[index];
  } catch (error) {
    console.error('❌ Alt kategori güncellenemedi:', error);
    throw error;
  }
};

/**
 * Alt kategoriyi sil
 */
export const deleteSubCategory = async (id) => {
  try {
    const allSubCategories = await loadSubCategories();
    const filtered = allSubCategories.filter(sub => sub.id !== id);
    
    if (filtered.length === allSubCategories.length) {
      throw new Error('Silinecek kategori bulunamadı');
    }
    
    await saveSubCategories(filtered);
    
    // Asset mapping'lerden de temizle
    await removeAssetMappingsForSubCategory(id);
    
    console.log('✅ Kategori silindi');
    return true;
  } catch (error) {
    console.error('❌ Alt kategori silinemedi:', error);
    throw error;
  }
};

// ========== ASSET MAPPING OPERATIONS ==========

/**
 * Asset-SubCategory mapping'lerini oku
 */
export const loadAssetMapping = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ASSET_MAPPING);
    if (!data) {
      return {};
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Asset mapping yüklenemedi:', error);
    return {};
  }
};

/**
 * Asset-SubCategory mapping'lerini kaydet
 */
export const saveAssetMapping = async (mapping) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.ASSET_MAPPING,
      JSON.stringify(mapping)
    );
    return true;
  } catch (error) {
    console.error('❌ Asset mapping kaydedilemedi:', error);
    return false;
  }
};

/**
 * Varlığı alt kategoriye ata
 */
export const assignAssetToSubCategory = async (assetName, subCategoryId) => {
  try {
    const mapping = await loadAssetMapping();
    
    // Önceki eşleştirmeyi kontrol et
    const previousSubCategoryId = mapping[assetName];
    
    if (previousSubCategoryId === subCategoryId) {
      return true; // Zaten aynı kategoride
    }
    
    // Eğer önceden başka kategorideyse, o kategoriden çıkar
    if (previousSubCategoryId) {
      const previousSubCategory = await getSubCategoryById(previousSubCategoryId);
      if (previousSubCategory) {
        await updateSubCategory(previousSubCategoryId, {
          assets: previousSubCategory.assets.filter(a => a !== assetName)
        });
      }
    }
    
    // Yeni kategoriye ata
    mapping[assetName] = subCategoryId;
    await saveAssetMapping(mapping);
    
    // SubCategory'deki assets listesine de ekle
    const subCategory = await getSubCategoryById(subCategoryId);
    if (subCategory && !subCategory.assets.includes(assetName)) {
      await updateSubCategory(subCategoryId, {
        assets: [...subCategory.assets, assetName]
      });
    }
    
    console.log(`✅ ${assetName} → ${subCategory?.name || subCategoryId}`);
    return true;
  } catch (error) {
    console.error('❌ Asset atama başarısız:', error);
    throw error;
  }
};

/**
 * Varlığın alt kategorisini kaldır
 */
export const removeAssetFromSubCategory = async (assetName) => {
  try {
    const mapping = await loadAssetMapping();
    const subCategoryId = mapping[assetName];
    
    if (!subCategoryId) {
      return true; // Zaten kategorisiz
    }
    
    // Mapping'den sil
    delete mapping[assetName];
    await saveAssetMapping(mapping);
    
    // SubCategory'deki assets listesinden çıkar
    const subCategory = await getSubCategoryById(subCategoryId);
    if (subCategory) {
      await updateSubCategory(subCategoryId, {
        assets: subCategory.assets.filter(a => a !== assetName)
      });
    }
    
    console.log(`✅ ${assetName} kategoriden çıkarıldı`);
    return true;
  } catch (error) {
    console.error('❌ Asset kaldırma başarısız:', error);
    throw error;
  }
};

/**
 * Varlığın hangi alt kategoriye ait olduğunu bul
 */
export const getSubCategoryForAsset = async (assetName) => {
  try {
    const mapping = await loadAssetMapping();
    const subCategoryId = mapping[assetName];
    
    if (!subCategoryId) {
      return null; // Kategorisiz
    }
    
    return await getSubCategoryById(subCategoryId);
  } catch (error) {
    console.error('❌ Asset kategorisi bulunamadı:', error);
    return null;
  }
};

/**
 * Silinen alt kategori için mapping'leri temizle
 */
const removeAssetMappingsForSubCategory = async (subCategoryId) => {
  try {
    const mapping = await loadAssetMapping();
    const assetNames = Object.keys(mapping).filter(
      assetName => mapping[assetName] === subCategoryId
    );
    
    assetNames.forEach(assetName => {
      delete mapping[assetName];
    });
    
    await saveAssetMapping(mapping);
    console.log(`✅ ${assetNames.length} asset kategoriden çıkarıldı`);
    return true;
  } catch (error) {
    console.error('❌ Mapping temizleme başarısız:', error);
    return false;
  }
};

/**
 * Tüm verileri temizle (debug/reset için)
 */
export const clearAllSubCategoryData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SUBCATEGORIES);
    await AsyncStorage.removeItem(STORAGE_KEYS.ASSET_MAPPING);
    console.log('✅ Tüm alt kategori verileri temizlendi');
    return true;
  } catch (error) {
    console.error('❌ Veriler temizlenemedi:', error);
    return false;
  }
};

export default {
  loadSubCategories,
  saveSubCategories,
  getSubCategoriesByParent,
  getSubCategoryById,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  loadAssetMapping,
  saveAssetMapping,
  assignAssetToSubCategory,
  removeAssetFromSubCategory,
  getSubCategoryForAsset,
  clearAllSubCategoryData
};
