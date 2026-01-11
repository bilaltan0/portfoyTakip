/**
 * validators.js - Veri Doğrulama Fonksiyonları
 * 
 * Form validasyonları ve veri kontrolleri
 */

/**
 * İşlem doğrulama
 * 
 * @param {Object} transaction - İşlem objesi
 * @returns {Object} { isValid, errors }
 */
export const validateTransaction = (transaction) => {
  const errors = {};

  // Varlık adı kontrolü
  if (!transaction.assetName || transaction.assetName.trim() === '') {
    errors.assetName = 'Varlık adı zorunludur';
  } else if (transaction.assetName.length < 2) {
    errors.assetName = 'Varlık adı en az 2 karakter olmalıdır';
  } else if (transaction.assetName.length > 50) {
    errors.assetName = 'Varlık adı en fazla 50 karakter olabilir';
  }

  // Ana kategori kontrolü
  const validCategories = ['Altın', 'Kripto', 'Borsa', 'Döviz'];
  if (!transaction.mainCategory) {
    errors.mainCategory = 'Ana kategori zorunludur';
  } else if (!validCategories.includes(transaction.mainCategory)) {
    errors.mainCategory = 'Geçersiz ana kategori';
  }

  // İşlem türü kontrolü
  if (!transaction.type) {
    errors.type = 'İşlem türü zorunludur';
  } else if (!['buy', 'sell'].includes(transaction.type)) {
    errors.type = 'İşlem türü "buy" veya "sell" olmalıdır';
  }

  // Miktar kontrolü
  if (transaction.quantity === undefined || transaction.quantity === null) {
    errors.quantity = 'Miktar zorunludur';
  } else if (typeof transaction.quantity !== 'number') {
    errors.quantity = 'Miktar sayı olmalıdır';
  } else if (transaction.quantity <= 0) {
    errors.quantity = 'Miktar 0\'dan büyük olmalıdır';
  } else if (transaction.quantity > 1000000000) {
    errors.quantity = 'Miktar çok büyük';
  }

  // Birim fiyat kontrolü
  if (transaction.unitPrice === undefined || transaction.unitPrice === null) {
    errors.unitPrice = 'Birim fiyat zorunludur';
  } else if (typeof transaction.unitPrice !== 'number') {
    errors.unitPrice = 'Birim fiyat sayı olmalıdır';
  } else if (transaction.unitPrice <= 0) {
    errors.unitPrice = 'Birim fiyat 0\'dan büyük olmalıdır';
  } else if (transaction.unitPrice > 1000000000) {
    errors.unitPrice = 'Birim fiyat çok büyük';
  }

  // Para birimi kontrolü
  const validCurrencies = ['TRY', 'USD', 'EUR', 'GBP'];
  if (!transaction.currency) {
    errors.currency = 'Para birimi zorunludur';
  } else if (!validCurrencies.includes(transaction.currency)) {
    errors.currency = 'Geçersiz para birimi';
  }

  // Tarih kontrolü
  if (!transaction.date) {
    errors.date = 'Tarih zorunludur';
  } else {
    const date = new Date(transaction.date);
    if (isNaN(date.getTime())) {
      errors.date = 'Geçersiz tarih formatı';
    } else if (date > new Date()) {
      errors.date = 'Gelecek tarih seçilemez';
    } else if (date < new Date('2000-01-01')) {
      errors.date = 'Tarih çok eski';
    }
  }

  // Not kontrolü (opsiyonel ama varsa)
  if (transaction.note && transaction.note.length > 500) {
    errors.note = 'Not en fazla 500 karakter olabilir';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Portföy adı doğrulama
 * 
 * @param {string} name - Portföy adı
 * @returns {Object} { isValid, error }
 */
export const validatePortfolioName = (name) => {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'Portföy adı zorunludur',
    };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      error: 'Portföy adı en az 2 karakter olmalıdır',
    };
  }

  if (name.length > 30) {
    return {
      isValid: false,
      error: 'Portföy adı en fazla 30 karakter olabilir',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Kategori adı doğrulama
 * 
 * @param {string} name - Kategori adı
 * @returns {Object} { isValid, error }
 */
export const validateCategoryName = (name) => {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'Kategori adı zorunludur',
    };
  }

  if (name.length < 2) {
    return {
      isValid: false,
      error: 'Kategori adı en az 2 karakter olmalıdır',
    };
  }

  if (name.length > 30) {
    return {
      isValid: false,
      error: 'Kategori adı en fazla 30 karakter olabilir',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Email doğrulama (gelecekte kullanıcı sistemi için)
 * 
 * @param {string} email - Email adresi
 * @returns {boolean} Geçerli mi?
 */
export const validateEmail = (email) => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Telefon numarası doğrulama (Türkiye formatı)
 * 
 * @param {string} phone - Telefon numarası
 * @returns {boolean} Geçerli mi?
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  
  // Türkiye telefon formatı: 5XX XXX XX XX veya +90 5XX XXX XX XX
  const phoneRegex = /^(\+90|0)?5\d{9}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Sayısal input doğrulama
 * 
 * @param {string} value - Input değeri
 * @param {Object} options - { min, max, decimals }
 * @returns {Object} { isValid, error, parsedValue }
 */
export const validateNumericInput = (value, options = {}) => {
  const { min = 0, max = Infinity, decimals = 2 } = options;

  if (value === '' || value === null || value === undefined) {
    return {
      isValid: false,
      error: 'Değer boş olamaz',
      parsedValue: null,
    };
  }

  // String'i sayıya çevir
  const parsed = parseFloat(value);

  if (isNaN(parsed)) {
    return {
      isValid: false,
      error: 'Geçerli bir sayı giriniz',
      parsedValue: null,
    };
  }

  if (parsed < min) {
    return {
      isValid: false,
      error: `Değer en az ${min} olmalıdır`,
      parsedValue: parsed,
    };
  }

  if (parsed > max) {
    return {
      isValid: false,
      error: `Değer en fazla ${max} olabilir`,
      parsedValue: parsed,
    };
  }

  // Ondalık basamak kontrolü
  const decimalCount = (value.toString().split('.')[1] || '').length;
  if (decimalCount > decimals) {
    return {
      isValid: false,
      error: `En fazla ${decimals} ondalık basamak girebilirsiniz`,
      parsedValue: parsed,
    };
  }

  return {
    isValid: true,
    error: null,
    parsedValue: parsed,
  };
};
