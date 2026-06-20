/**
 * storage.constants.js - AsyncStorage Key Sabitleri
 * 
 * Tüm storage key'lerini merkezi bir yerden yönetir
 */

export const STORAGE_KEYS = {
  // Portföy Verileri
  PORTFOLIOS: '@portfolio_portfolios',
  ACTIVE_PORTFOLIO_ID: '@portfolio_active_id',
  
  // Kategori Verileri
  CATEGORIES: '@portfolio_categories',
  CUSTOM_CATEGORIES: '@portfolio_custom_categories',
  
  // Ayarlar
  DISPLAY_CURRENCY: '@portfolio_display_currency',
  THEME_PREFERENCE: '@portfolio_theme',
  LANGUAGE: '@portfolio_language',
  NOTIFICATIONS_ENABLED: '@portfolio_notifications',
  
  // Kullanıcı Tercihleri
  CHART_TYPE: '@portfolio_chart_type',
  DEFAULT_VIEW: '@portfolio_default_view',
  SORT_PREFERENCE: '@portfolio_sort',
  BALANCE_HIDDEN: '@portfolio_balance_hidden', // Gizlilik modu durumu
  
  // Cache
  LAST_SYNC: '@portfolio_last_sync',
  CACHED_PRICES: '@portfolio_cached_prices',
  
  // Onboarding & Tour
  ONBOARDING_COMPLETED: '@portfolio_onboarding',
  FEATURE_TOUR_SEEN: '@portfolio_feature_tour',
  
  // Eski key'ler (Migration için)
  LEGACY_TRANSACTIONS: '@portfolio_transactions',
};

/**
 * Kategori Sabitleri
 */
export const CATEGORIES = {
  MAIN: ['Altın', 'Kripto', 'Borsa', 'Döviz', 'Nakit'],
  
  SUB: {
    'Altın': ['Gram Altın', 'Çeyrek Altın', 'Külçe', 'Cumhuriyet Altını', 'Reşat Altını'],
    'Kripto': ['Bitcoin', 'Ethereum', 'Altcoin', 'Stablecoin', 'DeFi'],
    'Borsa': ['Halka Arz', 'Normal Hisse', 'ETF', 'Endeks', 'REIT'],
    'Döviz': ['USD', 'EUR', 'GBP', 'CHF', 'JPY'],
    'Nakit': ['Türk Lirası (TRY)', 'Banka Hesabı', 'Nakit Kasa'],
  },
};

/**
 * Para Birimi Sabitleri
 */
export const CURRENCIES = {
  LIST: ['TRY', 'USD', 'EUR', 'GBP', 'CHF', 'JPY'],
  
  SYMBOLS: {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: '₣',
    JPY: '¥',
  },
  
  NAMES: {
    TRY: 'Türk Lirası',
    USD: 'Amerikan Doları',
    EUR: 'Euro',
    GBP: 'İngiliz Sterlini',
    CHF: 'İsviçre Frangı',
    JPY: 'Japon Yeni',
  },
};

/**
 * İşlem Türleri
 */
export const TRANSACTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
};

/**
 * Sıralama Seçenekleri
 */
export const SORT_OPTIONS = {
  DATE_DESC: 'date_desc',
  DATE_ASC: 'date_asc',
  VALUE_DESC: 'value_desc',
  VALUE_ASC: 'value_asc',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
};

/**
 * Grafik Tipleri
 */
export const CHART_TYPES = {
  PIE: 'pie',
  DONUT: 'donut',
  BAR: 'bar',
  LINE: 'line',
};

/**
 * Tema Seçenekleri
 */
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

/**
 * Dil Seçenekleri
 */
export const LANGUAGES = {
  TR: 'tr',
  EN: 'en',
};
