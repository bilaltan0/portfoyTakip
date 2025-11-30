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

export const COLORS = {
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
};

export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 16,
};

export const FONTS = {
  h3: {
    fontSize: 20,
    fontWeight: '700',
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
  },
  body4: {
    fontSize: 14,
    fontWeight: '400',
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
