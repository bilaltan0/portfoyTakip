import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Simple rating prompt: shows after N opens or after M days since first open.
 * Stores opt-out and shown flags in AsyncStorage so we don't nag the user.
 */
const FIRST_OPEN_KEY = '@first_open_ts';
const OPEN_COUNT_KEY = '@open_count';
const RATING_SHOWN_KEY = '@rating_shown';
const RATING_OPT_OUT_KEY = '@rating_opt_out';

const MIN_OPENS = 5; // show on or after 5th open
const MIN_DAYS = 3;   // or after 3 days since first open

export default function RatingPrompt() {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const optOut = await AsyncStorage.getItem(RATING_OPT_OUT_KEY);
        if (optOut === 'true') return;

        const shown = await AsyncStorage.getItem(RATING_SHOWN_KEY);
        if (shown === 'true') return;

        const now = Date.now();
        const firstOpen = await AsyncStorage.getItem(FIRST_OPEN_KEY);
        if (!firstOpen) {
          await AsyncStorage.setItem(FIRST_OPEN_KEY, String(now));
        }

        const countStr = await AsyncStorage.getItem(OPEN_COUNT_KEY);
        const count = countStr ? parseInt(countStr, 10) + 1 : 1;
        await AsyncStorage.setItem(OPEN_COUNT_KEY, String(count));

        const firstTs = firstOpen ? parseInt(firstOpen, 10) : now;
        const days = Math.floor((now - firstTs) / (1000 * 60 * 60 * 24));

        // Decide whether to prompt
        if (count >= MIN_OPENS || days >= MIN_DAYS) {
          // small delay to avoid race with navigation
          setTimeout(() => {
            if (!mounted) return;
            promptToRate();
          }, 1200);
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setChecked(true);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const promptToRate = async () => {
    Alert.alert(
      'Uygulamayı Değerlendirmek İster misiniz?',
      'Beğendiyseniz uygulamamızı mağazada değerlendirerek destek olabilirsiniz. Hemen yönlendireyim mi?',
      [
        { text: 'Sonra Hatırlat', style: 'cancel' },
        { text: 'Hayır', style: 'destructive', onPress: async () => { await AsyncStorage.setItem(RATING_OPT_OUT_KEY, 'true'); } },
        { text: 'Evet', onPress: async () => { await tryInAppReviewOrStore(); await AsyncStorage.setItem(RATING_SHOWN_KEY, 'true'); } },
      ],
      { cancelable: true }
    );
  };

  const tryInAppReviewOrStore = async () => {
    // Try to use native in-app review module if available (recommended). If not,
    // fall back to opening the Play Store / App Store link.
    try {
      // Dynamically require so the app still runs if the native module isn't installed
      // Package: react-native-in-app-review (https://github.com/iamandrewluca/react-native-in-app-review)
      const InAppReview = require('react-native-in-app-review');

      if (InAppReview && InAppReview.isAvailable && InAppReview.isAvailable()) {
        // Request in-app review (may or may not show UI depending on platform heuristics)
        await InAppReview.RequestInAppReview();
        return;
      }
    } catch (e) {
      // module not available or failed; fall through to store link
      console.debug('In-app review module not available, opening store instead', e);
    }

    // Fallback: open store page
    const pkg = Constants.expoConfig?.android?.package || Constants.manifest?.android?.package;
    if (!pkg) return;
    if (Platform.OS === 'android') {
      const androidUrl = `market://details?id=${pkg}`;
      const webUrl = `https://play.google.com/store/apps/details?id=${pkg}`;
      Linking.openURL(androidUrl).catch(() => Linking.openURL(webUrl));
    } else {
      const iosUrl = `https://apps.apple.com/app/id${pkg}`; // pkg for iOS might differ
      Linking.openURL(iosUrl).catch(() => {});
    }
  };

  return null;
}
