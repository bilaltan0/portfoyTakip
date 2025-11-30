/**
 * TransactionScreen.js - İşlem Yap Ekranı
 */

import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, PREDEFINED_ASSETS } from '../constants/theme';
import { usePortfolio } from '../context/PortfolioContext';

export default function TransactionScreen({ route, navigation }) {
  const { addTransaction, categories, activePortfolio } = usePortfolio();

  // Form state
  const [mainCategory, setMainCategory] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [note, setNote] = useState('');
  
  // Ekran her focus olduğunda params'ı kontrol et ve form alanlarını doldur
  useFocusEffect(
    React.useCallback(() => {
      const preselectedAsset = route?.params?.preselectedAsset;
      
      if (preselectedAsset) {
        setMainCategory(preselectedAsset.mainCategory || '');
        setAssetName(preselectedAsset.assetName || '');
        // Parametreleri temizle
        navigation.setParams({ preselectedAsset: undefined });
      }
    }, [route?.params, navigation])
  );

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

    Alert.alert(
      'Başarılı! ✅',
      `${transactionType === 'buy' ? 'Alış' : 'Satış'} işlemi kaydedildi.\n\n${assetName}\n${quantity} adet x ${unitPrice} ${currency}`,
      [{ text: 'Tamam' }]
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
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Yeni İşlem</Text>
            <Text style={styles.headerSubtitle}>
              Varlık bilgilerini doldurun ve alış/satış seçin
            </Text>
          </View>

          {/* Ana Kategori */}
          <View style={styles.section}>
            <Text style={styles.label}>Ana Kategori *</Text>
            <View style={styles.categoryButtons}>
              {mainCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    mainCategory === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setMainCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      mainCategory === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Varlık Adı */}
          <View style={styles.section}>
            <Text style={styles.label}>Varlık Adı *</Text>
            
            {!mainCategory ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Önce ana kategori seçin
                </Text>
              </View>
            ) : (
              <>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.assetScroll}
                >
                  {PREDEFINED_ASSETS[mainCategory]?.map((asset) => (
                    <TouchableOpacity
                      key={asset}
                      style={[
                        styles.assetChip,
                        assetName === asset && styles.assetChipActive,
                      ]}
                      onPress={() => setAssetName(asset)}
                    >
                      <Text
                        style={[
                          styles.assetChipText,
                          assetName === asset && styles.assetChipTextActive,
                        ]}
                      >
                        {asset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Manuel giriş için TextInput (opsiyonel) */}
                <TextInput
                  style={[styles.input, { marginTop: 12 }]}
                  placeholder="veya özel varlık adı yazın..."
                  placeholderTextColor={COLORS.mediumGray}
                  value={assetName}
                  onChangeText={setAssetName}
                />
              </>
            )}
          </View>

          {/* Miktar ve Fiyat */}
          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Miktar *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.mediumGray}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Birim Fiyat *</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.mediumGray}
                value={unitPrice}
                onChangeText={setUnitPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Para Birimi */}
          <View style={styles.section}>
            <Text style={styles.label}>Para Birimi</Text>
            <View style={styles.currencyButtons}>
              {['TRY', 'USD', 'EUR'].map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyButton,
                    currency === curr && styles.currencyButtonActive,
                  ]}
                  onPress={() => setCurrency(curr)}
                >
                  <Text
                    style={[
                      styles.currencyButtonText,
                      currency === curr && styles.currencyButtonTextActive,
                    ]}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Not */}
          <View style={styles.section}>
            <Text style={styles.label}>Not (Opsiyonel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="İşlem hakkında not ekleyin"
              placeholderTextColor={COLORS.mediumGray}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Toplam Değer Gösterimi */}
          {quantity && unitPrice && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Toplam Tutar</Text>
              <Text style={styles.totalValue}>
                {(parseFloat(quantity) * parseFloat(unitPrice)).toFixed(2)} {currency}
              </Text>
            </View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={styles.fixedButtonContainer}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.buyButton]}
              onPress={handleBuy}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Alış</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.sellButton]}
              onPress={handleSell}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Satış</Text>
            </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buyButton: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  sellButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  categoryButtonActive: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.gold,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  categoryButtonTextActive: {
    color: COLORS.white,
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
  assetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    marginRight: 8,
  },
  assetChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  assetChipText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    fontWeight: '500',
  },
  assetChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
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
  currencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  currencyButtonActive: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.green,
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mediumGray,
  },
  currencyButtonTextActive: {
    color: COLORS.white,
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
    fontSize: 14,
    color: COLORS.mediumGray,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});
