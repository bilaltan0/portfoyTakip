/**
 * theme.js - Tema ve Sabit Değerler
 * 
 * AMAÇ:
 * Uygulama genelinde kullanılan renk paleti ve sabit değerleri merkezi bir yerden yönetir.
 * Tasarım tutarlılığını sağlar ve tema değişikliklerini kolaylaştırır.
 * 
 * İÇERİK:
 * - COLORS: Renk sabitleri
 *   • darkBlue: Ana marka rengi (#004AAD)
 *   • gold: Vurgu rengi, pozitif değerler (#FFD700)
 *   • white: Arka plan rengi (#FFFFFF)
 *   • darkGray: Metin rengi (#333333)
 *   • green: Pozitif değişim göstergesi (#1ABC9C)
 *   • red: Negatif değişim göstergesi (#E74C3C)
 *   • blue1, blue2, blue3: Chart segmentleri için mavi tonları
 * 
 * - MOCK_ASSETS: Örnek varlık verileri (geliştirme aşamasında)
 *   Gerçek uygulamada API'den gelecek
 * 
 * KULLANIM:
 * import { COLORS } from '../constants/theme';
 * backgroundColor: COLORS.darkBlue
 * 
 * NOT:
 * Yeni renkler eklendiğinde buraya eklenir.
 * Tüm ekranlar bu dosyadan renk alır, böylece tema değişikliği tek yerden yapılır.
 */

// ========================================
// RENK PALETİ
// ========================================

export const COLORS = {
  // Marka Renkleri
  brand: {
    primary: '#004AAD',
    secondary: '#0066FF',
    accent: '#00D4FF',
  },
  
  // Semantic Renkler (Anlam taşıyan)
  semantic: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  
  // Varlık Kategorisi Renkleri
  assets: {
    gold: '#FFD700',
    crypto: '#6366F1',
    stock: '#10B981',
    forex: '#F59E0B',
  },
  
  // UI Renkleri
  ui: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Metin Renkleri
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
    inverse: '#FFFFFF',
  },
  
  // Grafik Renkleri
  chart: {
    blue1: '#2563EB',
    blue2: '#60A5FA',
    blue3: '#93C5FD',
    blue4: '#DBEAFE',
    purple1: '#7C3AED',
    purple2: '#A78BFA',
    green1: '#059669',
    green2: '#34D399',
    orange1: '#EA580C',
    orange2: '#FB923C',
  },

  // Backward compatibility (eski kodlar için)
  darkBlue: '#004AAD',
  gold: '#FFD700',
  white: '#FFFFFF',
  darkGray: '#333333',
  mediumGray: '#666666',
  lightGray: '#DDDDDD',
  lightPrimary: '#E3F2FD',
  primary: '#004AAD',
  dark: '#333333',
  gray: '#666666',
  danger: '#E74C3C',
  green: '#1ABC9C',
  red: '#E74C3C',
  blue1: '#2563eb',
  blue2: '#60a5fa',
  blue3: '#93c5fd',
  
  // Action button colors
  profit: '#10B981',
  loss: '#EF4444',
  success: '#10B981',
  
  // Text colors (for components)
  text: '#1E293B',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  background: '#F8FAFC',
};

// ========================================
// BOYUTLAR VE SPACING
// ========================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 16,
  // Ek boyutlar
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
};

// ========================================
// TİPOGRAFİ
// ========================================

export const FONTS = {
  // Başlıklar
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  h5: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  
  // Body
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  body3: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  
  // Özel Kullanımlar
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  overline: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  
  // Backward compatibility
  body4: {
    fontSize: 14,
    fontWeight: '400',
  },
};

// ========================================
// GÖLGELER
// ========================================

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Sabit döviz kurları (TRY baz alınarak)
export const EXCHANGE_RATES = {
  TRY: 1,
  USD: 34.5,   // 1 USD = 34.5 TRY
  EUR: 37.8,   // 1 EUR = 37.8 TRY
};

// Para birimi sembolleri
export const CURRENCY_SYMBOLS = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

// Örnek varlıklar (daha sonra API'den gelecek)
export const MOCK_ASSETS = [
  { name: 'Altın', value: '₺120.000', change: '+2.1%', color: COLORS.gold, changeColor: COLORS.green },
  { name: 'Kripto', value: '₺105.000', change: '-1.3%', color: COLORS.darkBlue, changeColor: COLORS.red },
  { name: 'Borsa', value: '₺80.000', change: '+0.7%', color: COLORS.blue1, changeColor: COLORS.green },
  { name: 'Döviz', value: '₺35.000', change: '+1.0%', color: COLORS.blue2, changeColor: COLORS.green },
];

// Kategori bazlı önceden tanımlı varlıklar
export const PREDEFINED_ASSETS = {
  'Altın': [
    'Gram Altın',
    'Çeyrek Altın',
    'Yarım Altın',
    'Cumhuriyet Altını',
    'Reşat Altını'
  ],
  'Kripto': [
    'Bitcoin (BTC)',
    'Ethereum (ETH)',
    'Ripple (XRP)',
    'Cardano (ADA)',
    'Solana (SOL)',
    'Polkadot (DOT)'
  ],
  'Borsa': [
    'BIST 100',
    'THYAO (Türk Hava Yolları)',
    'AKBNK (Akbank)',
    'GARAN (Garanti BBVA)',
    'EREGL (Ereğli Demir Çelik)',
    'TUPRS (Tüpraş)'
  ],
  'Döviz': [
    'Amerikan Doları (USD)',
    'Euro (EUR)',
    'İngiliz Sterlini (GBP)',
    'İsviçre Frangı (CHF)',
    'Japon Yeni (JPY)'
  ]
};
