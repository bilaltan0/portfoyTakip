/**
 * formatters.js - Veri Formatlama Fonksiyonları
 * 
 * Para, tarih, sayı formatlamaları
 */

/**
 * Para formatı
 * 
 * @param {number} amount - Miktar
 * @param {string} currency - Para birimi (TRY, USD, EUR)
 * @param {string} locale - Dil (tr-TR, en-US)
 * @returns {string} Formatlanmış para
 */
export const formatCurrency = (amount, currency = 'TRY', locale = 'tr-TR') => {
  if (amount === undefined || amount === null) {
    return '-';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback
    return `${amount.toFixed(2)} ${currency}`;
  }
};

/**
 * Sayı formatı (binlik ayracı ile)
 * 
 * @param {number} number - Sayı
 * @param {number} decimals - Ondalık basamak sayısı
 * @param {string} locale - Dil
 * @returns {string} Formatlanmış sayı
 */
export const formatNumber = (number, decimals = 2, locale = 'tr-TR') => {
  if (number === undefined || number === null) {
    return '-';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
};

/**
 * Yüzde formatı
 * 
 * @param {number} value - Yüzde değeri (0-100)
 * @param {number} decimals - Ondalık basamak sayısı
 * @returns {string} Formatlanmış yüzde
 */
export const formatPercentage = (value, decimals = 2) => {
  if (value === undefined || value === null) {
    return '-';
  }

  return `%${value.toFixed(decimals)}`;
};

/**
 * Tarih formatı - Kısa
 * 
 * @param {string|Date} date - Tarih
 * @param {string} locale - Dil
 * @returns {string} Formatlanmış tarih (ör: 30.11.2025)
 */
export const formatDate = (date, locale = 'tr-TR') => {
  if (!date) {
    return '-';
  }

  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '-';
  }

  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Tarih formatı - Uzun
 * 
 * @param {string|Date} date - Tarih
 * @param {string} locale - Dil
 * @returns {string} Formatlanmış tarih (ör: 30 Kasım 2025)
 */
export const formatDateLong = (date, locale = 'tr-TR') => {
  if (!date) {
    return '-';
  }

  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '-';
  }

  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Tarih formatı - Saat ile
 * 
 * @param {string|Date} date - Tarih
 * @param {string} locale - Dil
 * @returns {string} Formatlanmış tarih ve saat
 */
export const formatDateTime = (date, locale = 'tr-TR') => {
  if (!date) {
    return '-';
  }

  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '-';
  }

  return d.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Göreceli zaman (ör: 2 saat önce, 3 gün önce)
 * 
 * @param {string|Date} date - Tarih
 * @param {string} locale - Dil
 * @returns {string} Göreceli zaman
 */
export const formatRelativeTime = (date, locale = 'tr-TR') => {
  if (!date) {
    return '-';
  }

  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '-';
  }

  const now = new Date();
  const diffMs = now - d;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Az önce';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else {
    return formatDate(date, locale);
  }
};

/**
 * Büyük sayıları kısaltma (1000 → 1K, 1000000 → 1M)
 * 
 * @param {number} number - Sayı
 * @param {number} decimals - Ondalık basamak sayısı
 * @returns {string} Kısaltılmış sayı
 */
export const formatCompactNumber = (number, decimals = 1) => {
  if (number === undefined || number === null) {
    return '-';
  }

  if (number >= 1000000000) {
    return `${(number / 1000000000).toFixed(decimals)}B`;
  } else if (number >= 1000000) {
    return `${(number / 1000000).toFixed(decimals)}M`;
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(decimals)}K`;
  }

  return number.toFixed(decimals);
};
