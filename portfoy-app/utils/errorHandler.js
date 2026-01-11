/**
 * errorHandler.js - Merkezi Hata Yönetim Sistemi
 * 
 * Tüm hataları tek noktadan yönetir, loglar ve kullanıcıya uygun mesajlar verir
 */

/**
 * Özel hata sınıfı
 */
export class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Stack trace için
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Hata kodları
 */
export const ERROR_CODES = {
  // Storage hataları
  STORAGE_READ_FAILED: 'STORAGE_READ_FAILED',
  STORAGE_WRITE_FAILED: 'STORAGE_WRITE_FAILED',
  STORAGE_DELETE_FAILED: 'STORAGE_DELETE_FAILED',
  STORAGE_CLEAR_FAILED: 'STORAGE_CLEAR_FAILED',
  STORAGE_LIST_FAILED: 'STORAGE_LIST_FAILED',
  STORAGE_MULTI_READ_FAILED: 'STORAGE_MULTI_READ_FAILED',
  STORAGE_MULTI_WRITE_FAILED: 'STORAGE_MULTI_WRITE_FAILED',

  // Validasyon hataları
  INVALID_TRANSACTION: 'INVALID_TRANSACTION',
  INVALID_PORTFOLIO_NAME: 'INVALID_PORTFOLIO_NAME',
  INVALID_CATEGORY_NAME: 'INVALID_CATEGORY_NAME',
  INVALID_INPUT: 'INVALID_INPUT',

  // İş mantığı hataları
  PORTFOLIO_NOT_FOUND: 'PORTFOLIO_NOT_FOUND',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  INSUFFICIENT_QUANTITY: 'INSUFFICIENT_QUANTITY',
  DUPLICATE_PORTFOLIO: 'DUPLICATE_PORTFOLIO',

  // Network hataları
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Genel hatalar
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
};

/**
 * Kullanıcı dostu hata mesajları
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.STORAGE_READ_FAILED]: 'Veriler yüklenemedi. Lütfen uygulamayı yeniden başlatın.',
  [ERROR_CODES.STORAGE_WRITE_FAILED]: 'Veriler kaydedilemedi. Cihazınızın depolama alanını kontrol edin.',
  [ERROR_CODES.STORAGE_DELETE_FAILED]: 'Veri silinemedi. Lütfen tekrar deneyin.',
  [ERROR_CODES.STORAGE_CLEAR_FAILED]: 'Tüm veriler temizlenemedi. Lütfen tekrar deneyin.',
  
  [ERROR_CODES.INVALID_TRANSACTION]: 'İşlem bilgileri hatalı. Lütfen kontrol edin.',
  [ERROR_CODES.INVALID_PORTFOLIO_NAME]: 'Portföy adı geçersiz.',
  [ERROR_CODES.INVALID_CATEGORY_NAME]: 'Kategori adı geçersiz.',
  [ERROR_CODES.INVALID_INPUT]: 'Girilen bilgiler hatalı.',
  
  [ERROR_CODES.PORTFOLIO_NOT_FOUND]: 'Portföy bulunamadı.',
  [ERROR_CODES.TRANSACTION_NOT_FOUND]: 'İşlem bulunamadı.',
  [ERROR_CODES.INSUFFICIENT_QUANTITY]: 'Yetersiz miktar. Satış yapılamaz.',
  [ERROR_CODES.DUPLICATE_PORTFOLIO]: 'Bu isimde bir portföy zaten mevcut.',
  
  [ERROR_CODES.NETWORK_ERROR]: 'İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.',
  [ERROR_CODES.API_ERROR]: 'Sunucudan veri alınamadı. Lütfen daha sonra tekrar deneyin.',
  [ERROR_CODES.TIMEOUT_ERROR]: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  [ERROR_CODES.PERMISSION_DENIED]: 'Bu işlem için yetkiniz yok.',
};

/**
 * Hatayı işle ve kullanıcı dostu mesaj döndür
 * 
 * @param {Error|AppError} error - Hata objesi
 * @param {boolean} showInConsole - Console'da göster mi?
 * @returns {string} Kullanıcı dostu hata mesajı
 */
export const handleError = (error, showInConsole = true) => {
  // Development'ta console'a yaz
  if (__DEV__ && showInConsole) {
    console.error('❌ Error caught:', {
      message: error.message,
      code: error.code || 'NO_CODE',
      details: error.details || {},
      stack: error.stack,
    });
  }

  // Production'da analytics/crash reporting servisine gönder
  // if (!__DEV__) {
  //   // Sentry.captureException(error);
  //   // Firebase Crashlytics.recordError(error);
  // }

  // AppError ise özel mesajı döndür
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code] || error.message;
  }

  // Standart Error ise genel mesaj döndür
  if (error instanceof Error) {
    return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  }

  // String hata
  if (typeof error === 'string') {
    return error;
  }

  // Bilinmeyen hata tipi
  return ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
};

/**
 * Try-catch wrapper (async fonksiyonlar için)
 * 
 * @param {Function} fn - Çalıştırılacak async fonksiyon
 * @param {Function} onError - Hata durumunda çağrılacak fonksiyon
 * @returns {Promise} Fonksiyon sonucu veya undefined (hata durumunda)
 */
export const tryCatch = async (fn, onError = null) => {
  try {
    return await fn();
  } catch (error) {
    const errorMessage = handleError(error);
    
    if (onError) {
      onError(errorMessage, error);
    }
    
    return undefined;
  }
};

/**
 * Validasyon hatalarını formatla
 * 
 * @param {Object} errors - Validasyon hata objesi
 * @returns {string} Birleştirilmiş hata mesajı
 */
export const formatValidationErrors = (errors) => {
  if (!errors || Object.keys(errors).length === 0) {
    return '';
  }

  const messages = Object.values(errors);
  
  if (messages.length === 1) {
    return messages[0];
  }

  return `• ${messages.join('\n• ')}`;
};

/**
 * Network hata kontrolü
 * 
 * @param {Error} error - Hata objesi
 * @returns {boolean} Network hatası mı?
 */
export const isNetworkError = (error) => {
  return (
    error.message === 'Network request failed' ||
    error.message === 'Network Error' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ETIMEDOUT' ||
    error.code === ERROR_CODES.NETWORK_ERROR
  );
};

/**
 * Timeout hatası kontrolü
 * 
 * @param {Error} error - Hata objesi
 * @returns {boolean} Timeout hatası mı?
 */
export const isTimeoutError = (error) => {
  return (
    error.code === 'ECONNABORTED' ||
    error.code === ERROR_CODES.TIMEOUT_ERROR ||
    error.message?.includes('timeout')
  );
};

/**
 * Hata loglama (gelecekte cloud'a gönderilebilir)
 * 
 * @param {string} context - Hatanın gerçekleştiği yer
 * @param {Error} error - Hata objesi
 * @param {Object} metadata - Ek bilgiler
 */
export const logError = (context, error, metadata = {}) => {
  const errorLog = {
    context,
    message: error.message,
    code: error.code || 'NO_CODE',
    timestamp: new Date().toISOString(),
    metadata,
    stack: error.stack,
  };

  if (__DEV__) {
    console.error(`🔴 [${context}]`, errorLog);
  }

  // Production'da cloud'a gönder
  // if (!__DEV__) {
  //   sendToErrorTracking(errorLog);
  // }
};

/**
 * Alert gösterme helper (React Native Alert)
 * 
 * @param {string} title - Başlık
 * @param {string} message - Mesaj
 * @param {Array} buttons - Butonlar
 */
export const showErrorAlert = (title, message, buttons = [{ text: 'Tamam' }]) => {
  // React Native'de kullanmak için Alert import edilmeli
  // Alert.alert(title, message, buttons);
  
  if (__DEV__) {
    console.warn(`⚠️ Alert: ${title}\n${message}`);
  }
};
