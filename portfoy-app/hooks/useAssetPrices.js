/**
 * useAssetPrices.js - Varlık Fiyatlarını Çeken Custom Hook
 * 
 * Her varlık için anlık piyasa fiyatını çeker ve cache'ler.
 * Dashboard'da gerçek portföy değerini hesaplamak için kullanılır.
 * 
 * KATEGORİ BAZLI FIYAT ÇEKME:
 * - Kripto: Sıralı (rate limit)
 * - Borsa: Paralel (rate limit yok)
 * - Döviz: Paralel (günlük veri)
 * - Altın: Paralel (mock/basit API)
 */

import { useState, useEffect } from 'react';
import { fetchAssetPrice } from '../services/priceService';

/**
 * KRİPTO fiyatlarını sıralı şekilde çeker (Rate Limit)
 */
const fetchCryptoPrices = async (cryptoAssets) => {
  const prices = {};
  
  console.log(`🔄 ${cryptoAssets.length} kripto için sıralı fiyat çekiliyor...`);
  
  for (const asset of cryptoAssets) {
    try {
      const priceData = await fetchAssetPrice(asset.name, asset);
      
      prices[asset.name] = {
        price: priceData.price,
        currency: priceData.currency,
        timestamp: priceData.timestamp,
        isMock: priceData.isMock || false,
      };
      
      console.log(`✅ ${asset.name}: ${priceData.price} ${priceData.currency}`);
    } catch (err) {
      console.error(`❌ Kripto fiyat hatası: ${asset.name}`, err.message);
      prices[asset.name] = {
        price: 0,
        currency: 'USD',
        error: err.message,
      };
    }
  }
  
  return prices;
};

/**
 * BORSA fiyatlarını paralel şekilde çeker (Rate Limit yok)
 */
const fetchStockPrices = async (stockAssets) => {
  const prices = {};
  
  console.log(`🔄 ${stockAssets.length} hisse için paralel fiyat çekiliyor...`);
  
  const promises = stockAssets.map(async (asset) => {
    try {
      const priceData = await fetchAssetPrice(asset.name, asset);
      
      prices[asset.name] = {
        price: priceData.price,
        currency: priceData.currency,
        timestamp: priceData.timestamp,
        isMock: priceData.isMock || false,
      };
      
      console.log(`✅ ${asset.name}: ${priceData.price} ${priceData.currency}`);
    } catch (err) {
      console.error(`❌ Borsa fiyat hatası: ${asset.name}`, err.message);
      prices[asset.name] = {
        price: 0,
        currency: 'TRY',
        error: err.message,
      };
    }
  });
  
  await Promise.allSettled(promises);
  return prices;
};

/**
 * DÖVİZ fiyatlarını paralel şekilde çeker (TCMB günlük veri)
 */
const fetchForexPrices = async (forexAssets) => {
  const prices = {};
  
  console.log(`🔄 ${forexAssets.length} döviz için fiyat çekiliyor...`);
  
  const promises = forexAssets.map(async (asset) => {
    try {
      const priceData = await fetchAssetPrice(asset.name, asset);
      
      prices[asset.name] = {
        price: priceData.price,
        currency: priceData.currency,
        timestamp: priceData.timestamp,
        isMock: priceData.isMock || false,
      };
      
      console.log(`✅ ${asset.name}: ${priceData.price} ${priceData.currency}`);
    } catch (err) {
      console.error(`❌ Döviz fiyat hatası: ${asset.name}`, err.message);
      prices[asset.name] = {
        price: 1,
        currency: 'TRY',
        error: err.message,
      };
    }
  });
  
  await Promise.allSettled(promises);
  return prices;
};

/**
 * ALTIN fiyatlarını paralel şekilde çeker
 */
const fetchGoldPrices = async (goldAssets) => {
  const prices = {};
  
  console.log(`🔄 ${goldAssets.length} altın için fiyat çekiliyor...`);
  
  const promises = goldAssets.map(async (asset) => {
    try {
      const priceData = await fetchAssetPrice(asset.name, asset);
      
      prices[asset.name] = {
        price: priceData.price,
        currency: priceData.currency,
        timestamp: priceData.timestamp,
        isMock: priceData.isMock || false,
      };
      
      console.log(`✅ ${asset.name}: ${priceData.price} ${priceData.currency}`);
    } catch (err) {
      console.error(`❌ Altın fiyat hatası: ${asset.name}`, err.message);
      prices[asset.name] = {
        price: 0,
        currency: 'TRY',
        error: err.message,
      };
    }
  });
  
  await Promise.allSettled(promises);
  return prices;
};

/**
 * Birden fazla varlık için anlık fiyat çeker
 * @param {Array} assets - Varlık listesi: [{ name, category, quantity }]
 * @returns {Object} { prices, loading, error, refresh }
 */
export const useAssetPrices = (assets = []) => {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrices = async () => {
    if (!assets || assets.length === 0) {
      setPrices({});
      return;
    }

    setLoading(true);
    setError(null);

    console.log('📊 Fiyat çekme başlıyor - Kategori bazlı gruplandırma...');

    // Varlıkları kategoriye göre grupla
    const cryptoAssets = assets.filter(a => a.category === 'Kripto');
    const stockAssets = assets.filter(a => a.category === 'Borsa');
    const forexAssets = assets.filter(a => a.category === 'Döviz');
    const goldAssets = assets.filter(a => a.category === 'Altın');

    console.log(`� Kategoriler: Kripto=${cryptoAssets.length}, Borsa=${stockAssets.length}, Döviz=${forexAssets.length}, Altın=${goldAssets.length}`);

    try {
      // Her kategori için ayrı fonksiyon çağır
      const [cryptoPrices, stockPrices, forexPrices, goldPrices] = await Promise.all([
        cryptoAssets.length > 0 ? fetchCryptoPrices(cryptoAssets) : Promise.resolve({}),
        stockAssets.length > 0 ? fetchStockPrices(stockAssets) : Promise.resolve({}),
        forexAssets.length > 0 ? fetchForexPrices(forexAssets) : Promise.resolve({}),
        goldAssets.length > 0 ? fetchGoldPrices(goldAssets) : Promise.resolve({}),
      ]);

      // Tüm fiyatları birleştir
      const allPrices = {
        ...cryptoPrices,
        ...stockPrices,
        ...forexPrices,
        ...goldPrices,
      };

      console.log('✅ Tüm fiyatlar çekildi:', Object.keys(allPrices).length, 'varlık');
      setPrices(allPrices);
    } catch (err) {
      console.error('❌ Fiyat çekme hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // İlk yüklemede fiyatları çek
  useEffect(() => {
    fetchPrices();
  }, [assets.length]); // Assets değişince yeniden çek

  // Manuel refresh fonksiyonu
  const refresh = () => {
    fetchPrices();
  };

  return {
    prices,
    loading,
    error,
    refresh,
  };
};
