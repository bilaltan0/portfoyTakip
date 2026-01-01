/**
 * Exchange Rate Service - Döviz Kuru Servisi
 * 
 * TCMB API'sinden anlık döviz kurlarını çeker ve cache'ler.
 * Dashboard ve fiyat hesaplamalarında kullanılır.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DURATION = 60 * 60 * 1000; // 1 saat (döviz kurları sık değişmez)
const CACHE_KEY = 'exchange_rates_cache';

// In-memory cache
let memoryCache = null;

/**
 * TCMB API'den döviz kurlarını çeker
 * @returns {Promise<object>} { USD: 34.5, EUR: 37.8, GBP: 43.2 }
 */
const fetchTCMBRates = async () => {
  try {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    
    let response = await fetch(
      `https://www.tcmb.gov.tr/kurlar/${year}${month}/${day}${month}${year}.xml`
    );
    
    // Bugünkü veri yoksa dünün verisini al
    if (!response.ok) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yDay = yesterday.getDate().toString().padStart(2, '0');
      const yMonth = (yesterday.getMonth() + 1).toString().padStart(2, '0');
      const yYear = yesterday.getFullYear();
      
      response = await fetch(
        `https://www.tcmb.gov.tr/kurlar/${yYear}${yMonth}/${yDay}${yMonth}${yYear}.xml`
      );
      
      if (!response.ok) {
        throw new Error(`TCMB API error: ${response.status}`);
      }
    }
    
    const xmlText = await response.text();
    
    // USD, EUR, GBP kurlarını parse et
    const rates = {
      TRY: 1, // TRY baz para birimi
      USD: parseRate(xmlText, 'USD'),
      EUR: parseRate(xmlText, 'EUR'),
      GBP: parseRate(xmlText, 'GBP'),
    };
    
    return rates;
  } catch (error) {
    console.error('❌ TCMB fetch error:', error);
    throw error;
  }
};

/**
 * XML'den belirli para biriminin kurunu parse eder
 */
const parseRate = (xmlText, currency) => {
  // ForexSelling (efektif satış) kurunu al
  const regex = new RegExp(
    `<Currency.*?CurrencyCode="${currency}".*?<ForexSelling>(.*?)</ForexSelling>`,
    's'
  );
  const match = xmlText.match(regex);
  
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  throw new Error(`Currency ${currency} not found in TCMB data`);
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
    console.log('🔄 Fetching fresh exchange rates from TCMB...');
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
