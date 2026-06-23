import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { ChevronDown, Plus, Edit2, Trash2, X, MoreVertical } from 'lucide-react-native';
import RewardedModal from './RewardedModal';
import { useAd } from '../context/AdContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { usePortfolio } from '../context/PortfolioContext';

const PortfolioSelector = ({ grandTotalValue }) => {
  const {
    portfolios,
    activePortfolioId,
    activePortfolio,
    setActivePortfolioId,
    createPortfolio,
    deletePortfolio,
    renamePortfolio,
  } = usePortfolio();

  const { enabled: adsEnabled, initialized: adsInitialized, buildDefault } = useAd();

  const [modalVisible, setModalVisible] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [menuVisible, setMenuVisible] = useState(null); // Hangi portföyün menüsü açık
  const [rewardedVisible, setRewardedVisible] = useState(false);

  const handleSelectPortfolio = (portfolioId) => {
    setActivePortfolioId(portfolioId);
    setModalVisible(false);
  };

  const handleCreatePortfolio = () => {
    if (!newPortfolioName.trim()) {
      Alert.alert('Hata', 'Lütfen portföy adı girin');
      return;
    }

    createPortfolio(newPortfolioName);
    setNewPortfolioName('');
    setShowCreateInput(false);
    setModalVisible(false);
  };

  const handleAttemptCreate = async () => {
    try {
      // Determine effective ad-enabled state by reading the persisted override directly
      // to avoid stale hook values at the moment of user interaction.
      const overrideVal = await AsyncStorage.getItem('@enable_ads_override');
      const effectiveAdsEnabled = overrideVal !== null ? (overrideVal === 'true') : !!buildDefault;

      console.log('📣 AttemptCreate - portfolios:', portfolios.length, 'effectiveAdsEnabled:', effectiveAdsEnabled);

      // If ads are disabled via runtime toggle (or build default), allow direct creation
      if (!effectiveAdsEnabled) {
        setShowCreateInput(true);
        return;
      }



      // Otherwise, if there are already 2 portfolios, show rewarded modal
      if (portfolios.length >= 2) {
        setRewardedVisible(true);
        return;
      }

      setShowCreateInput(true);
    } catch (e) {
      // On error, fall back to allowing creation
      console.warn('Error while checking ad/unlock state', e);
      setShowCreateInput(true);
    }
  };

  const onRewardedUnlocked = () => {
    // After the rewarded ad is watched, open the create input transiently
    setRewardedVisible(false);
    setShowCreateInput(true);
  };

  const handleDeletePortfolio = (portfolioId) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    
    if (portfolios.length <= 1) {
      Alert.alert('Uyarı', 'En az bir portföy bulunmalıdır');
      return;
    }

    const transactionCount = portfolio?.transactions?.length || 0;
    const message = transactionCount > 0
      ? `${portfolio.name} portföyünde ${transactionCount} işlem var. Silmek istediğinize emin misiniz?`
      : `${portfolio.name} portföyünü silmek istediğinize emin misiniz?`;

    Alert.alert(
      'Portföy Sil',
      message,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deletePortfolio(portfolioId),
        },
      ]
    );
  };

  const handleStartEdit = (portfolio) => {
    setEditingId(portfolio.id);
    setEditingName(portfolio.name);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      Alert.alert('Hata', 'Portföy adı boş olamaz');
      return;
    }

    renamePortfolio(editingId, editingName);
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };



  return (
    <>
      {/* Portfolio Selector Button */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText} numberOfLines={1}>
          {activePortfolio?.name || 'Portföy Seç'}
        </Text>
        <ChevronDown size={18} color={COLORS.darkBlue} style={{ marginLeft: 4 }} />
      </TouchableOpacity>

      {/* Portfolio Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setShowCreateInput(false);
          setEditingId(null);
          setMenuVisible(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setModalVisible(false);
            setShowCreateInput(false);
            setEditingId(null);
            setMenuVisible(null);
          }}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Portföy Seç</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setShowCreateInput(false);
                  setEditingId(null);
                  setMenuVisible(null);
                }}
              >
                <X size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.portfolioList}>
              {/* Portfolio List */}
              {portfolios.map((portfolio) => {
                const isActive = portfolio.id === activePortfolioId;
                const isEditing = editingId === portfolio.id;

                return (
                  <View key={portfolio.id} style={styles.portfolioItem}>
                    {isEditing ? (
                      // Edit Mode
                      <View style={styles.editContainer}>
                        <TextInput
                          style={styles.editInput}
                          value={editingName}
                          onChangeText={setEditingName}
                          autoFocus
                          placeholder="Portföy adı"
                          placeholderTextColor={COLORS.gray}
                        />
                        <View style={styles.editActions}>
                          <TouchableOpacity
                            style={[styles.editButton, styles.saveButton]}
                            onPress={handleSaveEdit}
                          >
                            <Text style={styles.editButtonText}>Kaydet</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.editButton, styles.cancelButton]}
                            onPress={handleCancelEdit}
                          >
                            <Text style={styles.editButtonText}>İptal</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // Normal Mode
                      <>
                        <View style={styles.portfolioRow}>
                          <TouchableOpacity
                            style={[
                              styles.portfolioButtonWithMenu,
                              isActive && styles.portfolioButtonActive,
                            ]}
                            onPress={() => handleSelectPortfolio(portfolio.id)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.portfolioName,
                                  isActive && styles.portfolioNameActive,
                                ]}
                              >
                                {portfolio.name}
                              </Text>
                            </View>
                            {isActive && (
                              <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>✓</Text>
                              </View>
                            )}
                          </TouchableOpacity>

                          {/* Daha Fazla Butonu - Sağda */}
                          <TouchableOpacity
                            style={styles.moreButtonInline}
                            onPress={() => setMenuVisible(menuVisible === portfolio.id ? null : portfolio.id)}
                          >
                            <MoreVertical size={20} color={COLORS.gray} />
                          </TouchableOpacity>
                        </View>

                        {/* Açılır Menü */}
                        {menuVisible === portfolio.id && (
                          <View style={styles.menuDropdown}>
                            <TouchableOpacity
                              style={styles.menuItem}
                              onPress={() => {
                                setMenuVisible(null);
                                handleStartEdit(portfolio);
                              }}
                            >
                              <Edit2 size={18} color={COLORS.gray} />
                              <Text style={styles.menuItemText}>Düzenle</Text>
                            </TouchableOpacity>
                            <View style={styles.menuDivider} />
                            <TouchableOpacity
                              style={styles.menuItem}
                              onPress={() => {
                                setMenuVisible(null);
                                handleDeletePortfolio(portfolio.id);
                              }}
                            >
                              <Trash2 size={18} color={COLORS.danger} />
                              <Text style={[styles.menuItemText, { color: COLORS.danger }]}>Sil</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                );
              })}

              {/* Create New Portfolio */}
              {showCreateInput ? (
                <View style={styles.createInputContainer}>
                  <TextInput
                    style={styles.createInput}
                    value={newPortfolioName}
                    onChangeText={setNewPortfolioName}
                    placeholder="Yeni portföy adı"
                    placeholderTextColor={COLORS.gray}
                    autoFocus
                  />
                  <View style={styles.createActions}>
                    <TouchableOpacity
                      style={[styles.createButton, styles.createButtonSave]}
                      onPress={handleCreatePortfolio}
                    >
                      <Text style={styles.createButtonText}>Oluştur</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.createButton, styles.createButtonCancel]}
                      onPress={() => {
                        setShowCreateInput(false);
                        setNewPortfolioName('');
                      }}
                    >
                      <Text style={styles.createButtonText}>İptal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={handleAttemptCreate}
                >
                  <Plus size={20} color={COLORS.primary} />
                  <Text style={styles.addButtonText}>Yeni Portföy Oluştur</Text>
                </TouchableOpacity>
              )}
              {/* Genel Toplam */}
              {grandTotalValue && portfolios.length > 1 && (
                <View style={styles.grandTotalContainer}>
                  <Text style={styles.grandTotalLabel}>Tüm Portföyler Toplamı</Text>
                  <Text style={styles.grandTotalValue}>{grandTotalValue}</Text>
                </View>
              )}
            
            <RewardedModal
              visible={rewardedVisible}
              onClose={() => setRewardedVisible(false)}
              onUnlocked={onRewardedUnlocked}
            />

            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Selector Button
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 140,
    maxWidth: 180,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.darkBlue,
    marginRight: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.dark,
  },

  // Portfolio List
  portfolioList: {
    maxHeight: 400,
  },
  portfolioItem: {
    marginBottom: 12,
  },
  portfolioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portfolioButtonWithMenu: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  portfolioButtonActive: {
    backgroundColor: COLORS.lightPrimary,
    borderColor: COLORS.primary,
  },
  portfolioName: {
    ...FONTS.h4,
    color: COLORS.dark,
  },
  portfolioNameActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBadgeText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // Daha Fazla Butonu - İnline
  moreButtonInline: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Açılır Menü
  menuDropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuItemText: {
    ...FONTS.body3,
    color: COLORS.dark,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 4,
  },

  // Edit Mode
  editContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
  },
  editInput: {
    ...FONTS.h4,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  editButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },

  // Create New
  createInputContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  createInput: {
    ...FONTS.h4,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  createActions: {
    flexDirection: 'row',
    gap: 8,
  },
  createButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonSave: {
    backgroundColor: COLORS.primary,
  },
  createButtonCancel: {
    backgroundColor: COLORS.gray,
  },
  createButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addButtonText: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginLeft: 8,
  },
  
  // Grand Total
  grandTotalContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.lightPrimary,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  grandTotalLabel: {
    ...FONTS.body3,
    color: COLORS.darkBlue,
    marginBottom: 4,
  },
  grandTotalValue: {
    ...FONTS.h3,
    color: COLORS.primary,
    fontWeight: '800',
  },
});

export default PortfolioSelector;
