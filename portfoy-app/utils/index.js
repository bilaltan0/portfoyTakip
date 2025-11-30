/**
 * utils/index.js - Utility Fonksiyonları Merkezi Export
 * 
 * Tüm utility fonksiyonlarını tek noktadan export eder
 */

// Calculations
export {
  calculatePortfolioTotals,
  calculateDistribution,
  calculateProfitLoss,
  convertCurrency,
} from './calculations';

// Currency Utils
export {
  convertCurrency as convertCurrencyNew,
  getCurrencySymbol,
  formatCurrency as formatCurrencyNew,
  formatPercentage as formatPercentageNew,
} from './currencyUtils';

// Color Utils
export {
  getCategoryColor,
  generateColorForAsset,
  getProfitLossColor,
} from './colorUtils';

// Asset Utils
export {
  getQuantityLabel,
  getShortAssetName,
} from './assetUtils';

// Formatters
export {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateLong,
  formatDateTime,
  formatRelativeTime,
  formatCompactNumber,
} from './formatters';

// Validators
export {
  validateTransaction,
  validatePortfolioName,
  validateCategoryName,
  validateEmail,
  validatePhone,
  validateNumericInput,
} from './validators';

// Storage
export {
  saveData,
  loadData,
  removeData,
  clearAllData,
  getAllKeys,
  saveMultipleData,
  loadMultipleData,
} from './storage';

// Error Handler
export {
  AppError,
  ERROR_CODES,
  handleError,
  tryCatch,
  formatValidationErrors,
  isNetworkError,
  isTimeoutError,
  logError,
  showErrorAlert,
} from './errorHandler';
