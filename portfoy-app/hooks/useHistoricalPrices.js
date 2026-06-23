/**
 * useHistoricalPrices.js - Tarihsel Fiyat Hook'u
 * 
 * Seçilen döneme göre tarihsel fiyatları çeker ve cache'ler.
 * periodCalculations ile birlikte dönem bazlı kar/zarar hesaplamak için kullanılır.
 */

import { useState, useEffect, useRef } from 'react';
import { fetchHistoricalAssetPrice } from '../services/priceService';
import { getPeriodStartDate } from '../utils/periodCalculations';

/**
 * Tarihsel fiyatları çeken hook
 * @param {Array} assets - Varlık listesi [{ name, symbol, category, ... }]
 * @param {string} period - '1D', '1W', '1M', '1Y', 'ALL'
 * @returns {Object} { historicalPrices, loading, error }
 */
export const useHistoricalPrices = (assets = [], period = 'ALL') => {
  const [historicalPrices, setHistoricalPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Son çekilen period'u takip et (gereksiz API çağrısını önle)
  const lastFetchRef = useRef({ period: null, assetCount: 0 });

  useEffect(() => {
    // ALL seçiliyse tarihsel fiyata gerek yok (maliyet bazlı hesaplanır)
    if (period === 'ALL' || !assets || assets.length === 0) {
      setHistoricalPrices({});
      return;
    }

    // Aynı period ve aynı asset sayısıysa tekrar çekme
    if (
      lastFetchRef.current.period === period &&
      lastFetchRef.current.assetCount === assets.length
    ) {
      return;
    }

    const fetchHistorical = async () => {
      setLoading(true);
      setError(null);

      const periodStartDate = getPeriodStartDate(period);
      
      if (!periodStartDate) {
        setHistoricalPrices({});
        setLoading(false);
        return;
      }

      console.log(`📊 Tarihsel fiyatlar çekiliyor: ${period} (${periodStartDate.toISOString().split('T')[0]}) - ${assets.length} varlık`);

      const prices = {};

      // Her varlık için tarihsel fiyat çek (sıralı, rate limit güvenli)
      for (const asset of assets) {
        try {
          const histPrice = await fetchHistoricalAssetPrice(
            asset.name,
            {
              symbol: asset.symbol,
              category: asset.category,
              mainCategory: asset.mainCategory || asset.category,
              apiId: asset.apiId,
              provider: asset.provider,
              apiCurrency: asset.apiCurrency,
            },
            periodStartDate
          );

          prices[asset.name] = histPrice;
          
          console.log(`✅ Tarihsel ${asset.name}: ${histPrice.price} ${histPrice.currency} @ ${histPrice.date}`);
        } catch (err) {
          console.warn(`⚠️ Tarihsel fiyat çekilemedi: ${asset.name}`, err.message);
          prices[asset.name] = { price: null, currency: 'TRY', error: true };
        }
      }

      setHistoricalPrices(prices);
      lastFetchRef.current = { period, assetCount: assets.length };
      setLoading(false);

      console.log(`✅ Tarihsel fiyatlar tamamlandı: ${Object.keys(prices).length}/${assets.length} varlık`);
    };

    fetchHistorical().catch(err => {
      console.error('❌ Tarihsel fiyat çekme hatası:', err);
      setError(err.message);
      setLoading(false);
    });
  }, [period, assets.length]); // assets.length değişince de yeniden çek

  return {
    historicalPrices,
    loading,
    error,
  };
};
