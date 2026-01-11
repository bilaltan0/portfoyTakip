/**
 * storage.js - AsyncStorage Helper Fonksiyonları
 * 
 * AsyncStorage işlemlerini merkezi hale getirir ve error handling ekler
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppError, ERROR_CODES } from './errorHandler';

/**
 * Veri kaydetme
 * 
 * @param {string} key - Storage key
 * @param {any} value - Kaydedilecek değer (otomatik stringify)
 * @throws {AppError} Kaydetme hatası
 */
export const saveData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    
    if (__DEV__) {
      console.log(`💾 Saved to storage: ${key}`);
    }
  } catch (error) {
    throw new AppError(
      'Veriler kaydedilemedi',
      ERROR_CODES.STORAGE_WRITE_FAILED,
      { key, originalError: error.message }
    );
  }
};

/**
 * Veri okuma
 * 
 * @param {string} key - Storage key
 * @param {any} defaultValue - Bulunamazsa dönecek değer
 * @returns {any} Okunan değer veya defaultValue
 * @throws {AppError} Okuma hatası
 */
export const loadData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    
    if (jsonValue !== null) {
      if (__DEV__) {
        console.log(`📦 Loaded from storage: ${key}`);
      }
      return JSON.parse(jsonValue);
    }
    
    return defaultValue;
  } catch (error) {
    throw new AppError(
      'Veriler okunamadı',
      ERROR_CODES.STORAGE_READ_FAILED,
      { key, originalError: error.message }
    );
  }
};

/**
 * Veri silme
 * 
 * @param {string} key - Storage key
 * @throws {AppError} Silme hatası
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    
    if (__DEV__) {
      console.log(`🗑️ Removed from storage: ${key}`);
    }
  } catch (error) {
    throw new AppError(
      'Veri silinemedi',
      ERROR_CODES.STORAGE_DELETE_FAILED,
      { key, originalError: error.message }
    );
  }
};

/**
 * Tüm verileri silme
 * 
 * @throws {AppError} Silme hatası
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    
    if (__DEV__) {
      console.log('🧹 All storage cleared');
    }
  } catch (error) {
    throw new AppError(
      'Tüm veriler silinemedi',
      ERROR_CODES.STORAGE_CLEAR_FAILED,
      { originalError: error.message }
    );
  }
};

/**
 * Tüm key'leri listeleme
 * 
 * @returns {Array} Key listesi
 * @throws {AppError} Listeleme hatası
 */
export const getAllKeys = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    
    if (__DEV__) {
      console.log(`🔑 Storage keys: ${keys.length}`);
    }
    
    return keys;
  } catch (error) {
    throw new AppError(
      'Key\'ler listelenemedi',
      ERROR_CODES.STORAGE_LIST_FAILED,
      { originalError: error.message }
    );
  }
};

/**
 * Birden fazla veri kaydetme
 * 
 * @param {Array} pairs - [[key, value], [key, value], ...]
 * @throws {AppError} Kaydetme hatası
 */
export const saveMultipleData = async (pairs) => {
  try {
    const stringifiedPairs = pairs.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    
    await AsyncStorage.multiSet(stringifiedPairs);
    
    if (__DEV__) {
      console.log(`💾 Saved ${pairs.length} items to storage`);
    }
  } catch (error) {
    throw new AppError(
      'Çoklu veri kaydedilemedi',
      ERROR_CODES.STORAGE_MULTI_WRITE_FAILED,
      { count: pairs.length, originalError: error.message }
    );
  }
};

/**
 * Birden fazla veri okuma
 * 
 * @param {Array} keys - Key listesi
 * @returns {Object} { key: value, ... }
 * @throws {AppError} Okuma hatası
 */
export const loadMultipleData = async (keys) => {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    
    const result = {};
    pairs.forEach(([key, value]) => {
      if (value !== null) {
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      }
    });
    
    if (__DEV__) {
      console.log(`📦 Loaded ${Object.keys(result).length}/${keys.length} items from storage`);
    }
    
    return result;
  } catch (error) {
    throw new AppError(
      'Çoklu veri okunamadı',
      ERROR_CODES.STORAGE_MULTI_READ_FAILED,
      { keys, originalError: error.message }
    );
  }
};
