// Helper to create a canonical payload when navigating to Transaction (İşlem Yap)
// Keeps the shape consistent across callers so TransactionScreen can rely on it.
export function createPreselectedAsset(mainCategory, assetName, type = 'buy', selectedAssetInfo = null) {
  return {
    preselectedAsset: {
      mainCategory: mainCategory || '',
      assetName: assetName || '',
      type: type || 'buy',
      selectedAssetInfo: selectedAssetInfo || null,
    }
  };
}
