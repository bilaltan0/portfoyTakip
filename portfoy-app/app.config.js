const appJson = require('./app.json');

/**
 * app.config.js — allows reading build-time env variables (e.g. ENABLE_ADS)
 * Usage:
 *   ENABLE_ADS=true npx eas build -p android --profile preview
 */
module.exports = ({ config } = {}) => {
  const enableAdsEnv = process.env.ENABLE_ADS === 'true';
  const enableTestAdsEnv = process.env.USE_TEST_ADS === 'true';

  return {
    ...appJson,
    expo: {
      ...appJson.expo,
      extra: {
        ...(appJson.expo.extra || {}),
        enableAds: enableAdsEnv,
        enableTestAds: enableTestAdsEnv,
      },
    },
  };
};
