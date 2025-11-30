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
  green: '#1ABC9C',
  red: '#E74C3C',
  blue1: '#2563eb',
  blue2: '#60a5fa',
  blue3: '#93c5fd',
};

// Örnek varlıklar (daha sonra API'den gelecek)
export const MOCK_ASSETS = [
  { name: 'Altın', value: '₺120.000', change: '+2.1%', color: COLORS.gold, changeColor: COLORS.green },
  { name: 'Kripto', value: '₺105.000', change: '-1.3%', color: COLORS.darkBlue, changeColor: COLORS.red },
  { name: 'Borsa', value: '₺80.000', change: '+0.7%', color: COLORS.blue1, changeColor: COLORS.green },
  { name: 'Döviz', value: '₺35.000', change: '+1.0%', color: COLORS.blue2, changeColor: COLORS.green },
];
