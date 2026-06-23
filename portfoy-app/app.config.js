const appJson = require('./app.json');

/**
 * app.config.js — allows reading build-time env variables (e.g. ENABLE_ADS)
 * Usage:
 *   ENABLE_ADS=true npx eas build -p android --profile preview
 *
 * NOTE: When ENABLE_ADS env var is not set (e.g. local development without EAS),
 * we fall back to the value in app.json rather than defaulting to false.
 */
module.exports = ({ config } = {}) => {
  const enableAdsEnv = process.env.ENABLE_ADS;
  const enableTestAdsEnv = process.env.USE_TEST_ADS;

  // Only override if the env variable is explicitly set.
  // Otherwise, preserve the value from app.json.
  const enableAds = enableAdsEnv !== undefined
    ? enableAdsEnv === 'true'
    : (appJson.expo.extra?.enableAds ?? true);

  const enableTestAds = enableTestAdsEnv !== undefined
    ? enableTestAdsEnv === 'true'
    : (appJson.expo.extra?.enableTestAds ?? false);

  console.log(
    '🔧 app.config.js — ENABLE_ADS env:', enableAdsEnv,
    '| resolved enableAds:', enableAds,
    '| USE_TEST_ADS env:', enableTestAdsEnv,
    '| resolved enableTestAds:', enableTestAds,
  );

  return {
    ...appJson,
    expo: {
      ...appJson.expo,
      extra: {
        ...(appJson.expo.extra || {}),
        enableAds,
        enableTestAds,
      },
    },
  };
};
