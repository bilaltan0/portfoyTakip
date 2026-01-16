/**
 * assetKeys.js
 * Helpers to normalize asset identifiers used as keys in mappings.
 */

export const normalizeAssetKey = (name) => {
  if (!name && name !== 0) return '';
  try {
    // Ensure consistent string form: trim, uppercase
    return String(name).trim().toUpperCase();
  } catch (err) {
    return String(name || '').trim().toUpperCase();
  }
};

export default normalizeAssetKey;
