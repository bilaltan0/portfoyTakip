/**
 * useAssetPrices.js - Varlık Fiyatlarını Çeken Custom Hook
 * 
 * Her varlık için anlık piyasa fiyatını çeker ve cache'ler.
 * Dashboard'da gerçek portföy değerini hesaplamak için kullanılır.
 */

import { useState, useEffect } from 'react';
import { fetchAssetPrice } from '../services/priceService';

/**
 * Birden fazla varlık için anlık fiyat çeker
 * @param {Array} assets - Varlık listesi: [{ name, apiMapping, quantity }]
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

    const newPrices = {};

    // Her varlık için fiyat çek (paralel)
    const promises = assets.map(async (asset) => {
      try {
        const priceData = await fetchAssetPrice(asset.name, asset);
        
        newPrices[asset.name] = {
          price: priceData.price,
          currency: priceData.currency,
          timestamp: priceData.timestamp,
          isMock: priceData.isMock || false,
        };
      } catch (err) {
        console.error(`❌ Fiyat çekilemedi: ${asset.name}`, err);
        newPrices[asset.name] = {
          price: 0,
          currency: 'TRY',
          error: err.message,
        };
      }
    });

    await Promise.allSettled(promises);

    setPrices(newPrices);
    setLoading(false);
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
