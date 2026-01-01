/**
 * TransactionScreen.js - İşlem Yap Ekranı
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, PREDEFINED_ASSETS } from '../constants/theme';
import { usePortfolio } from '../context/PortfolioContext';
import CategoryButton from '../components/CategoryButton';
import AssetChip from '../components/AssetChip';
import CurrencyButton from '../components/CurrencyButton';
import ActionButton from '../components/ActionButton';
import { searchAllAssets, getPopularAssets } from '../services/assetSearchService';
import { fetchAssetPrice } from '../services/priceService';

// Ekran boyutunu al - Responsive tasarım için
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TransactionScreen({ route, navigation }) {
  const { addTransaction, categories, activePortfolio } = usePortfolio();

  // Form state
  const [mainCategory, setMainCategory] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [note, setNote] = useState('');
  
  // Search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [popularAssets, setPopularAssets] = useState([]);
  
  // Price fetching state
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState(null); // API mapping bilgisi
  
  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' or 'error'
  const toastAnim = useRef(new Animated.Value(0)).current;
  
  // Preselected asset kontrolü için ref
  const isPreselectingRef = React.useRef(false);
  const searchTimeoutRef = React.useRef(null);
  
  // Toast notification göster
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    
    // Animasyon: aşağıdan yukarı çık
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setToastVisible(false);
    });
  };
  
  // Ekran her focus olduğunda params'ı kontrol et ve form alanlarını doldur
  useFocusEffect(
    React.useCallback(() => {
      const preselectedAsset = route?.params?.preselectedAsset;
      
      if (preselectedAsset) {
        isPreselectingRef.current = true;
        setMainCategory(preselectedAsset.mainCategory || '');
        setAssetName(preselectedAsset.assetName || '');
        // Parametreleri temizle
        navigation.setParams({ preselectedAsset: undefined });
        // Preselecting işlemi bittiğini işaretle
        setTimeout(() => {
          isPreselectingRef.current = false;
        }, 100);
      }
    }, [route?.params, navigation])
  );

  // Ana kategori değiştiğinde varlık adını temizle (sadece manuel değişiklikse)
  useEffect(() => {
    if (!isPreselectingRef.current) {
      setAssetName('');
      setSearchResults([]);
      setShowDropdown(false);
      setUnitPrice(''); // Fiyatı da temizle
      setSelectedAssetInfo(null); // API mapping'i de temizle
    }
    
    // Kategori seçildiğinde popüler varlıkları yükle
    if (mainCategory) {
      loadPopularAssets(mainCategory);
    }
  }, [mainCategory]);

  // Popüler varlıkları yükle
  const loadPopularAssets = (category) => {
    const popular = getPopularAssets(category);
    setPopularAssets(popular);
  };

  // Varlık arama fonksiyonu (debounced)
  const handleAssetSearch = (text) => {
    setAssetName(text);
    
    // Eğer seçili bir varlık varsa, temizle (kullanıcı değiştirmeye başladı)
    if (selectedAssetInfo) {
      setSelectedAssetInfo(null);
      setUnitPrice('');
    }
    
    // Eğer text boşsa, sadece popüler varlıkları göster
    if (!text.trim()) {
      setSearchResults([]);
      setShowDropdown(popularAssets.length > 0);
      return;
    }

    // Önceki timeout'u temizle
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);
    setShowDropdown(true);

    // 500ms sonra arama yap (debounce)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchAllAssets(text, mainCategory);
        setSearchResults(results);
        setIsSearching(false);
      } catch (error) {
        console.error('Asset search error:', error);
        setIsSearching(false);
        setSearchResults([]);
      }
    }, 500);
  };

  // Dropdown'dan varlık seçildiğinde
  const handleSelectAsset = (asset) => {
    // Parantez içindeki sembolü kaldır: "Bitcoin (BTC)" → "Bitcoin"
    const displayName = asset.fullName || asset.assetName || asset.name;
    const cleanName = displayName.split('(')[0].trim();
    
    setAssetName(cleanName);
    setShowDropdown(false);
    setSearchResults([]);
    
    // API mapping bilgisini sakla (anlık fiyat için)
    setSelectedAssetInfo({
      symbol: asset.symbol,
      provider: asset.provider,
      id: asset.id,
      currency: asset.currency,
      category: asset.category,
      fullName: displayName
    });
    
    console.log('✅ Varlık seçildi:', {
      original: displayName,
      clean: cleanName,
      symbol: asset.symbol,
      category: asset.category
    });
  };

  // Anlık fiyat çekme fonksiyonu
  const handleFetchLivePrice = async () => {
    if (!assetName.trim()) {
      Alert.alert('Uyarı', 'Önce bir varlık seçin');
      return;
    }

    // Eğer varlık bilgisi yoksa otomatik arama yap
    let assetInfo = selectedAssetInfo;
    if (!assetInfo) {
      console.log('⚠️ Varlık bilgisi yok, otomatik arama yapılıyor...');
      
      try {
        // Kategori bazlı arama yap
        const results = await searchAssets(assetName, mainCategory);
        
        if (results && results.length > 0) {
          // İlk sonucu otomatik seç
          assetInfo = {
            symbol: results[0].symbol,
            provider: results[0].provider,
            id: results[0].id,
            currency: results[0].currency,
            category: results[0].category,
            fullName: results[0].assetName
          };
          
          // Sonraki kullanımlar için kaydet
          setSelectedAssetInfo(assetInfo);
          
          console.log('✅ Otomatik varlık bulundu:', assetInfo);
        } else {
          Alert.alert('Uyarı', 'Varlık bulunamadı. Lütfen doğru ismi girin veya kategorisini kontrol edin.');
          return;
        }
      } catch (error) {
        Alert.alert('Hata', 'Varlık ararken hata oluştu');
        return;
      }
    }

    try {
      setIsFetchingPrice(true);
      
      // API'den fiyat çek (assetSearchService'den gelen tüm bilgiyi gönder)
      const priceData = await fetchAssetPrice(assetName, assetInfo);
      
      if (priceData && priceData.price > 0) {
        // Fiyatı forma doldur (sessizce) - max 3 decimal places
        setUnitPrice(priceData.price.toFixed(3));
        setCurrency(priceData.currency);
      } else {
        Alert.alert('Hata', 'Fiyat bilgisi alınamadı');
      }
    } catch (error) {
      console.error('Fiyat çekme hatası:', error);
      Alert.alert('Hata', `Fiyat alınırken hata oluştu:\n${error.message}`);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Ana kategoriler
  const mainCategories = Object.keys(categories);

  // Form validation
  const validateForm = () => {
    if (!mainCategory) {
      Alert.alert('Hata', 'Lütfen ana kategori seçin');
      return false;
    }
    if (!assetName.trim()) {
      Alert.alert('Hata', 'Lütfen varlık adı girin');
      return false;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir miktar girin');
      return false;
    }
    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir fiyat girin');
      return false;
    }
    return true;
  };

  // Form submit with transaction type - ASYNC ile tam doğru timing
  const handleSubmit = async (transactionType) => {
    if (!validateForm()) return;

    const transaction = {
      mainCategory,
      assetName: assetName.trim(),
      // Dinamik algılama için tüm API bilgisini sakla
      symbol: selectedAssetInfo?.symbol || null,
      provider: selectedAssetInfo?.provider || null,
      apiId: selectedAssetInfo?.id || null, // CoinGecko ID, Yahoo symbol, vb.
      apiCurrency: selectedAssetInfo?.currency || null,
      type: transactionType,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      currency,
      note: note.trim(),
      date: new Date().toISOString(),
    };

    console.log('💾 Transaction kaydediliyor:', {
      assetName: transaction.assetName,
      symbol: transaction.symbol,
      provider: transaction.provider,
      apiId: transaction.apiId,
      mainCategory: transaction.mainCategory
    });

    // AsyncStorage'a kaydedilene kadar BEKLE
    const success = await addTransaction(transaction);

    if (success) {
      // Form temizle (kategori korunur)
      resetForm();

      // Toast bildirim göster - Artık kesin kaydedildi!
      showToast('İşlem gerçekleştirildi', transactionType === 'buy' ? 'success' : 'error');
    } else {
      // Hata durumu
      Alert.alert('Hata', 'İşlem kaydedilemedi. Lütfen tekrar deneyin.');
    }
  };

  // Form reset - Ana kategoriyi KORU
  const resetForm = () => {
    // setMainCategory(''); // ❌ KALDIRILDI - Kategori korunsun
    setAssetName('');
    setQuantity('');
    setUnitPrice('');
    setNote('');
    setSelectedAssetInfo(null); // API mapping'i temizle
  };

  // Handle buy button
  const handleBuy = () => {
    handleSubmit('buy');
  };

  // Handle sell button - Stok kontrolü ile
  const handleSell = () => {
    if (!validateForm()) return;

    // Aktif portföydeki varlık pozisyonunu hesapla
    const transactions = activePortfolio?.transactions || [];
    const assetKey = `${mainCategory}_${assetName.trim()}`;
    
    let totalOwned = 0;
    transactions.forEach(transaction => {
      const txAssetKey = `${transaction.mainCategory}_${transaction.assetName}`;
      if (txAssetKey === assetKey) {
        if (transaction.type === 'buy') {
          totalOwned += transaction.quantity;
        } else if (transaction.type === 'sell') {
          totalOwned -= transaction.quantity;
        }
      }
    });

    const sellQuantity = parseFloat(quantity);
    
    if (sellQuantity > totalOwned) {
      Alert.alert('❌ Yetersiz Bakiye', 'Bu miktarda varlığınız yok.');
      return;
    }

    handleSubmit('sell');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback 
          onPress={() => {
            Keyboard.dismiss();
            setShowDropdown(false);
          }}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
          {/* Header - Compact */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>💼 Yeni İşlem</Text>
          </View>

          {/* Ana Kategori */}
          <View style={styles.section}>
            <Text style={styles.label}>📂 Kategori Seçin</Text>
            <View style={styles.categoryButtons}>
              {mainCategories.map((cat) => (
                <CategoryButton
                  key={cat}
                  label={cat}
                  isActive={mainCategory === cat}
                  onPress={() => setMainCategory(cat)}
                />
              ))}
            </View>
          </View>

          {/* Varlık Adı */}
          <View style={styles.section}>
            <Text style={styles.label}>🔍 Varlık Arama</Text>
            
            {!mainCategory ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Önce yukarıdan kategori seçin
                </Text>
              </View>
            ) : (
              <>
                {/* Arama Input'u */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, assetName.trim() && styles.inputWithClear]}
                    placeholder="Varlık ara... (Altın, BTC, BIST, Dolar)"
                    placeholderTextColor={COLORS.mediumGray}
                    value={assetName}
                    onChangeText={handleAssetSearch}
                    onFocus={() => {
                      // Eğer seçili varlık varsa dropdown gösterme
                      if (!selectedAssetInfo) {
                        setShowDropdown(true);
                      }
                    }}
                    autoCorrect={false}
                    returnKeyType="search"
                    enablesReturnKeyAutomatically={false}
                  />
                  {/* Temizle Butonu */}
                  {assetName.trim() && (
                    <TouchableOpacity 
                      style={styles.clearButton}
                      onPress={() => {
                        setAssetName('');
                        setSelectedAssetInfo(null);
                        setUnitPrice('');
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.clearButtonText}>× Temizle</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Arama Sonuçları Dropdown */}
                {showDropdown && (
                  <View style={styles.dropdown}>
                    {isSearching ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Aranıyor...</Text>
                      </View>
                    ) : assetName.trim() === '' && popularAssets.length > 0 ? (
                      // Boş input -> Popüler varlıkları göster
                      <View>
                        <Text style={styles.dropdownHeader}>⭐ Popüler Varlıklar</Text>
                        <ScrollView 
                          style={styles.dropdownScroll}
                          nestedScrollEnabled={true}
                        >
                          {popularAssets.map((asset, index) => (
                            <TouchableOpacity
                              key={`popular-${asset.symbol}-${index}`}
                              style={styles.dropdownItem}
                              onPress={() => handleSelectAsset(asset)}
                            >
                              <View style={styles.dropdownItemContent}>
                                <Text style={styles.dropdownItemName}>
                                  {asset.fullName || asset.assetName}
                                </Text>
                                <Text style={styles.dropdownItemSymbol}>
                                  {asset.symbol}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    ) : searchResults.length > 0 ? (
                      // Arama sonuçları var
                      <ScrollView 
                        style={styles.dropdownScroll}
                        nestedScrollEnabled={true}
                      >
                        {searchResults.map((asset, index) => (
                          <TouchableOpacity
                            key={`${asset.symbol}-${index}`}
                            style={styles.dropdownItem}
                            onPress={() => handleSelectAsset(asset)}
                          >
                            <View style={styles.dropdownItemContent}>
                              <Text style={styles.dropdownItemName}>
                                {asset.fullName || asset.assetName}
                              </Text>
                              <Text style={styles.dropdownItemSymbol}>
                                {asset.symbol} • {asset.category}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : assetName.trim() !== '' ? (
                      // Arama yaptı ama sonuç yok
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>🔍 Sonuç bulunamadı</Text>
                        <Text style={styles.emptyHint}>Farklı bir arama terimi deneyin</Text>
                      </View>
                    ) : null}
                  </View>
                )}

              </>
            )}
          </View>

          {/* Miktar ve Fiyat */}
          <View style={styles.section}>
            <View style={styles.row}>
              <View style={[styles.halfWidth]}>
                <Text style={styles.label}>📊 Miktar</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Adet"
                  placeholderTextColor={COLORS.mediumGray}
                  value={quantity}
                  onChangeText={(text) => {
                    // Virgülden sonra max 3 basamak kontrolü
                    const parts = text.split('.');
                    if (parts.length > 1 && parts[1].length > 3) {
                      // 3 basamaktan fazlaysa kes
                      setQuantity(`${parts[0]}.${parts[1].substring(0, 3)}`);
                    } else {
                      setQuantity(text);
                    }
                  }}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.halfWidth]}>
                <Text style={styles.label}>💰 Birim Fiyat</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Fiyat girin"
                  placeholderTextColor={COLORS.mediumGray}
                  value={unitPrice}
                  onChangeText={(text) => {
                    // Virgülden sonra max 3 basamak kontrolü
                    const parts = text.split('.');
                    if (parts.length > 1 && parts[1].length > 3) {
                      // 3 basamaktan fazlaysa kes
                      setUnitPrice(`${parts[0]}.${parts[1].substring(0, 3)}`);
                    } else {
                      setUnitPrice(text);
                    }
                  }}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Anlık Fiyat Butonu - Input'ların altında */}
            {assetName.trim() && selectedAssetInfo && (
              <TouchableOpacity 
                onPress={handleFetchLivePrice}
                disabled={isFetchingPrice}
                style={styles.livePriceButtonCompact}
              >
                {isFetchingPrice ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
                    <Text style={styles.livePriceButtonCompactText}>Fiyat alınıyor...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.livePriceButtonCompactIcon}>📊</Text>
                    <Text style={styles.livePriceButtonCompactText}>Anlık Fiyatı Çek</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Para Birimi */}
          <View style={styles.section}>
            <Text style={styles.label}>💵 Para Birimi</Text>
            <View style={styles.currencyButtons}>
              {['TRY', 'USD', 'EUR'].map((curr) => (
                <CurrencyButton
                  key={curr}
                  currency={curr}
                  isActive={currency === curr}
                  onPress={() => setCurrency(curr)}
                />
              ))}
            </View>
          </View>

          {/* Not - Optimize edilmiş */}
          <View style={styles.section}>
            <Text style={styles.label}>📝 Not (Opsiyonel)</Text>
            <TextInput
              style={[styles.input, styles.textAreaCompact]}
              placeholder="Detay ekle..."
              placeholderTextColor={COLORS.mediumGray}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
              maxLength={100}
              autoCorrect={true}
              autoCapitalize="sentences"
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </View>

          {/* Toplam Değer Gösterimi */}
          {quantity && unitPrice && (
            <View style={styles.totalContainer}>
              <View>
                <Text style={styles.totalLabel}>Toplam Tutar</Text>
                <Text style={styles.totalHint}>{quantity} × {unitPrice} {currency}</Text>
              </View>
              <Text style={styles.totalValue}>
                {(parseFloat(quantity) * parseFloat(unitPrice)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} {currency}
              </Text>
            </View>
          )}

          {/* Sabit butonların arkasında kalmaması için boşluk */}
          <View style={{ height: 120 }} />
        </ScrollView>
        </TouchableWithoutFeedback>

        {/* Fixed Action Buttons */}
        <View style={styles.fixedButtonContainer}>
          <View style={styles.actionButtonsRow}>
            <ActionButton
              label="📈 Alış Yap"
              variant="success"
              onPress={handleBuy}
            />
            <ActionButton
              label="📉 Satış Yap"
              variant="danger"
              onPress={handleSell}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Toast Notification */}
      {toastVisible && (
        <Animated.View 
          style={[
            styles.toastContainer,
            {
              transform: [{
                translateY: toastAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0]
                })
              }],
              opacity: toastAnim
            }
          ]}
        >
          <View style={[
            styles.toast,
            toastType === 'success' ? styles.toastSuccess : styles.toastError
          ]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollContent: {
    padding: SCREEN_WIDTH * 0.05, // Responsive padding (%5 of screen width)
    paddingBottom: SCREEN_HEIGHT * 0.18, // Responsive bottom padding (%18 of screen height)
  },
  header: {
    marginBottom: SCREEN_HEIGHT * 0.015, // Responsive (küçük ekranlarda küçülür)
  },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.07, // Responsive font size (%7 of screen width)
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: SCREEN_HEIGHT * 0.022, // Responsive margin
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subCategoryScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  subCategoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginRight: 8,
  },
  subCategoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  subCategoryChipText: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
  subCategoryChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  assetScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  textAreaCompact: {
    height: SCREEN_HEIGHT * 0.08, // Responsive height (%8 of screen height)
    textAlignVertical: 'top',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  totalContainer: {
    backgroundColor: COLORS.lightGray,
    padding: SCREEN_WIDTH * 0.04, // Responsive padding
    borderRadius: 12,
    marginBottom: SCREEN_HEIGHT * 0.02, // Alt kısımdan boşluk
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: SCREEN_WIDTH * 0.038, // Responsive font
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalHint: {
    fontSize: SCREEN_WIDTH * 0.03, // Responsive font
    color: COLORS.mediumGray,
    fontWeight: '400',
  },
  totalValue: {
    fontSize: SCREEN_WIDTH * 0.06, // Responsive font
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Dropdown Styles
  dropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mediumGray,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  dropdownItemContent: {
    flexDirection: 'column',
  },
  dropdownItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  dropdownItemSymbol: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.mediumGray,
  },
  // Live Price Compact Button (input'ların altında)
  livePriceButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  livePriceButtonCompactIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  livePriceButtonCompactText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  // Temizle butonu için container ve stiller
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  inputWithClear: {
    paddingRight: 90, // Temizle butonu için sağda boşluk
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
  },
  clearButtonText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  // Toast notification
  toastContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingBottom: 80, // Tab bar'ın üstünde
  },
  toast: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  toastSuccess: {
    backgroundColor: COLORS.success, // Yeşil arka plan
  },
  toastError: {
    backgroundColor: COLORS.danger, // Kırmızı arka plan
  },
  toastText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
});
