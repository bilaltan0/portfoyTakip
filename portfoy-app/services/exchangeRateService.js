/**
 * Exchange Rate Service - Döviz Kuru Servisi
 * 
 * Exchange Rate API'den anlık döviz kurlarını çeker ve cache'ler.
 * Dashboard ve fiyat hesaplamalarında kullanılır.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION = 60 * 60 * 1000; // 1 saat (döviz kurları sık değişmez)
const CACHE_KEY = 'exchange_rates_cache';

// In-memory cache
let memoryCache = null;

/**
 * Exchange Rate API'den döviz kurlarını çeker
 * @returns {Promise<object>} { USD: 34.5, EUR: 37.8, GBP: 43.2 }
 */
const fetchTCMBRates = async () => {
  try {
    // Exchange Rate API - TRY bazlı kurlar al
    // Ücretsiz: 1500 istek/ay, API key gerekmez
    const response = await fetch('https://open.er-api.com/v6/latest/TRY');
    
    if (!response.ok) {
      throw new Error(`Exchange Rate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // TRY bazlı kurlar geldi, tersine çevirmemiz gerekiyor
    // TRY/USD = 0.029 → USD/TRY = 1/0.029 = 34.5
    const rates = {
      TRY: 1,
      USD: data.rates.USD ? (1 / data.rates.USD) : 34.5,
      EUR: data.rates.EUR ? (1 / data.rates.EUR) : 37.8,
      GBP: data.rates.GBP ? (1 / data.rates.GBP) : 43.2,
    };
    
    console.log('💱 Exchange rates:', rates);
    
    return rates;
  } catch (error) {
    console.error('❌ Exchange Rate API fetch error:', error);
    throw error;
  }
};

/**
 * Cache'den döviz kurlarını oku
 */
const getCachedRates = async () => {
  // 1. Memory cache
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_DURATION) {
    console.log('💰 Exchange rates from memory cache');
    return memoryCache.rates;
  }
  
  // 2. AsyncStorage cache
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        console.log('💰 Exchange rates from storage cache');
        memoryCache = parsed;
        return parsed.rates;
      }
    }
  } catch (error) {
    console.error('Cache read error:', error);
  }
  
  return null;
};

/**
 * Cache'e döviz kurlarını yaz
 */
const setCachedRates = async (rates) => {
  const cacheData = {
    rates,
    timestamp: Date.now(),
  };
  
  // 1. Memory cache
  memoryCache = cacheData;
  
  // 2. AsyncStorage
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Cache write error:', error);
  }
};

/**
 * Ana fonksiyon: Döviz kurlarını getir (cache'den veya API'den)
 * @returns {Promise<object>} { TRY: 1, USD: 34.5, EUR: 37.8, GBP: 43.2 }
 */
export const getExchangeRates = async () => {
  try {
    // Önce cache'e bak
    const cached = await getCachedRates();
    if (cached) {
      return cached;
    }
    
    // Cache yoksa API'den çek
    console.log('🔄 Fetching fresh exchange rates from Exchange Rate API...');
    const rates = await fetchTCMBRates();
    
    console.log('✅ Exchange rates fetched:', rates);
    
    // Cache'e kaydet
    await setCachedRates(rates);
    
    return rates;
  } catch (error) {
    console.error('❌ Failed to fetch exchange rates:', error);
    
    // Hata durumunda fallback (sabit kurlar)
    console.log('⚠️ Using fallback exchange rates');
    return {
      TRY: 1,
      USD: 34.5,
      EUR: 37.8,
      GBP: 43.2,
    };
  }
};

/**
 * Para birimini TRY'ye çevir
 * @param {number} amount - Miktar
 * @param {string} fromCurrency - Kaynak para birimi (USD, EUR, GBP)
 * @param {object} rates - Döviz kurları objesi
 * @returns {number} TRY cinsinden miktar
 */
export const convertToTRY = (amount, fromCurrency, rates) => {
  if (fromCurrency === 'TRY') return amount;
  
  const rate = rates[fromCurrency];
  if (!rate) {
    console.warn(`⚠️ Rate not found for ${fromCurrency}, using 1`);
    return amount;
  }
  
  return amount * rate;
};

/**
 * TRY'yi başka para birimine çevir
 * @param {number} amountInTRY - TRY cinsinden miktar
 * @param {string} toCurrency - Hedef para birimi
 * @param {object} rates - Döviz kurları objesi
 * @returns {number} Hedef para biriminde miktar
 */
export const convertFromTRY = (amountInTRY, toCurrency, rates) => {
  if (toCurrency === 'TRY') return amountInTRY;
  
  const rate = rates[toCurrency];
  if (!rate) {
    console.warn(`⚠️ Rate not found for ${toCurrency}, using 1`);
    return amountInTRY;
  }
  
  return amountInTRY / rate;
};

/**
 * Cache'i temizle (test/debug için)
 */
export const clearExchangeRateCache = async () => {
  memoryCache = null;
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
    console.log('✅ Exchange rate cache cleared');
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};
