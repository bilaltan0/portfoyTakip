/**
 * currencyUtils.js - Para Birimi Yardımcı Fonksiyonları
 * 
 * Para birimi dönüşümleri, formatlama ve sembol işlemleri
 */

import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants/theme';

/**
 * Para birimini dönüştür
 * @param {number} amount - Tutar
 * @param {string} fromCurrency - Kaynak para birimi
 * @param {string} toCurrency - Hedef para birimi
 * @returns {number} - Dönüştürülmüş tutar
 */
export const convertCurrency = (amount, fromCurrency = 'TRY', toCurrency = 'TRY') => {
  if (fromCurrency === toCurrency) return amount;
  
  // TRY'ye çevir
  const amountInTRY = fromCurrency === 'TRY' 
    ? amount 
    : amount * EXCHANGE_RATES[fromCurrency];
  
  // Hedef para birimine çevir
  const result = toCurrency === 'TRY' 
    ? amountInTRY 
    : amountInTRY / EXCHANGE_RATES[toCurrency];
  
  return result;
};

/**
 * Para birimi sembolünü al
 * @param {string} currency - Para birimi kodu
 * @returns {string} - Para birimi sembolü
 */
export const getCurrencySymbol = (currency) => {
  return CURRENCY_SYMBOLS[currency] || currency;
};

/**
 * Tutarı formatla
 * @param {number} amount - Tutar
 * @param {string} currency - Para birimi
 * @param {object} options - Formatlama seçenekleri
 * @returns {string} - Formatlanmış tutar
 */
export const formatCurrency = (amount, currency = 'TRY', options = {}) => {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showSymbol = true
  } = options;
  
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits,
    maximumFractionDigits
  });
  
  if (showSymbol) {
    return `${getCurrencySymbol(currency)}${formatted}`;
  }
  
  return formatted;
};

/**
 * Yüzde formatla
 * @param {number} value - Yüzde değeri
 * @param {boolean} showSign - Artı/eksi işareti göster
 * @returns {string} - Formatlanmış yüzde
 */
export const formatPercentage = (value, showSign = true) => {
  const sign = value > 0 && showSign ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};
