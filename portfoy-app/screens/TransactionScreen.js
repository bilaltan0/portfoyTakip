/**
 * TransactionScreen.js - İşlem Yap Ekranı
 */

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
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
  
  // Preselected asset kontrolü için ref
  const isPreselectingRef = React.useRef(false);
  const searchTimeoutRef = React.useRef(null);
  
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
    
    console.log('✅ Varlık seçildi:', {
      original: displayName,
      clean: cleanName,
      symbol: asset.symbol,
      category: asset.category
    });
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

  // Form submit with transaction type
  const handleSubmit = (transactionType) => {
    if (!validateForm()) return;

    const transaction = {
      mainCategory,
      assetName: assetName.trim(),
      type: transactionType,
      quantity: parseFloat(quantity),
      unitPrice: parseFloat(unitPrice),
      currency,
      note: note.trim(),
      date: new Date().toISOString(),
    };

    addTransaction(transaction);

    // Form temizle
    resetForm();

    // Profesyonel başarı mesajı
    const totalAmount = (parseFloat(quantity) * parseFloat(unitPrice)).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    Alert.alert(
      transactionType === 'buy' ? '✅ Alış İşlemi Başarılı' : '✅ Satış İşlemi Başarılı',
      `İşlem portföyünüze kaydedildi.\n\n` +
      `📦 Varlık: ${assetName}\n` +
      `📊 Miktar: ${quantity} adet\n` +
      `💰 Birim Fiyat: ${parseFloat(unitPrice).toLocaleString('tr-TR')} ${currency}\n` +
      `💵 Toplam Tutar: ${totalAmount} ${currency}`,
      [
        { 
          text: '✓ Tamam',
          style: 'default'
        }
      ],
      { cancelable: false }
    );
  };

  // Form reset
  const resetForm = () => {
    setMainCategory('');
    setAssetName('');
    setQuantity('');
    setUnitPrice('');
    setNote('');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>💼 Yeni İşlem</Text>
            <Text style={styles.headerSubtitle}>
              Varlık ekleyin, portföyünüzü güçlendirin
            </Text>
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
                <TextInput
                  style={styles.input}
                  placeholder="Varlık ara... (Altın, BTC, BIST, Dolar)"
                  placeholderTextColor={COLORS.mediumGray}
                  value={assetName}
                  onChangeText={handleAssetSearch}
                  onFocus={() => setShowDropdown(true)}
                  autoCorrect={false}
                  returnKeyType="search"
                  enablesReturnKeyAutomatically={false}
                />

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
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>📊 Miktar</Text>
              <TextInput
                style={styles.input}
                placeholder="Adet girin"
                placeholderTextColor={COLORS.mediumGray}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>💰 Birim Fiyat</Text>
              <TextInput
                style={styles.input}
                placeholder="Fiyat girin"
                placeholderTextColor={COLORS.mediumGray}
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="decimal-pad"
              />
            </View>
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

          {/* Not */}
          <View style={styles.section}>
            <Text style={styles.label}>📝 Not Ekleyin (İsteğe Bağlı)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="İşlem detaylarını yazabilirsiniz..."
              placeholderTextColor={COLORS.mediumGray}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
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
                {(parseFloat(quantity) * parseFloat(unitPrice)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
              </Text>
            </View>
          )}

          <View style={{ height: 20 }} />
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
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.mediumGray,
    fontWeight: '400',
  },
  section: {
    marginBottom: 24,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalHint: {
    fontSize: 12,
    color: COLORS.mediumGray,
    fontWeight: '400',
  },
  totalValue: {
    fontSize: 24,
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
});
